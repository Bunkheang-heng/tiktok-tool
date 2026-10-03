import { Job, JobStatus, JobStep } from '../types/job';
import { JobRepository } from '../../database/repositories/JobRepository';
import { EventRepository } from '../../database/repositories/EventRepository';

export class InvalidTransitionError extends Error {
  constructor(public from: JobStatus, public to: JobStatus, public jobId: string) {
    super(`Cannot transition job ${jobId} from '${from}' to '${to}'`);
    this.name = 'InvalidTransitionError';
  }
}

export const ALLOWED_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  SCHEDULED: ['STARTING', 'CANCELLED', 'INTERRUPTED'],
  STARTING: ['TOPIC_SELECTING', 'FAILED', 'CANCELLED', 'INTERRUPTED'],
  TOPIC_SELECTING: ['SCRIPT_GENERATING', 'FAILED', 'CANCELLED', 'INTERRUPTED'],
  SCRIPT_GENERATING: ['SCRIPT_READY', 'FAILED', 'CANCELLED', 'INTERRUPTED'],
  SCRIPT_READY: ['VIDEO_GENERATING', 'FAILED', 'CANCELLED', 'INTERRUPTED'],
  VIDEO_GENERATING: ['VIDEO_READY', 'FAILED', 'CANCELLED', 'INTERRUPTED'],
  VIDEO_READY: ['AUDIO_GENERATING', 'FAILED', 'CANCELLED', 'INTERRUPTED'],
  AUDIO_GENERATING: ['SUBTITLE_GENERATING', 'FAILED', 'CANCELLED', 'INTERRUPTED'],
  SUBTITLE_GENERATING: ['RENDERING', 'FAILED', 'CANCELLED', 'INTERRUPTED'],
  RENDERING: ['METADATA_GENERATING', 'FAILED', 'CANCELLED', 'INTERRUPTED'],
  METADATA_GENERATING: ['TELEGRAM_SENDING', 'FAILED', 'CANCELLED', 'INTERRUPTED'],
  TELEGRAM_SENDING: ['DELIVERED', 'FAILED', 'CANCELLED', 'INTERRUPTED'],
  DELIVERED: ['TELEGRAM_SENDING'], // allows resending to Telegram
  FAILED: ['RETRYING', 'FAILED_FINAL', 'CANCELLED'],
  RETRYING: [
    'STARTING',
    'TOPIC_SELECTING',
    'SCRIPT_GENERATING',
    'VIDEO_GENERATING',
    'AUDIO_GENERATING',
    'SUBTITLE_GENERATING',
    'RENDERING',
    'METADATA_GENERATING',
    'TELEGRAM_SENDING',
    'FAILED',
    'CANCELLED'
  ],
  FAILED_FINAL: ['RETRYING', 'STARTING'], // manual retry from UI
  INTERRUPTED: ['RETRYING', 'STARTING', 'FAILED_FINAL', 'CANCELLED'],
  CANCELLED: ['RETRYING', 'STARTING']
};

export class JobStateMachine {
  constructor(
    private jobRepo: JobRepository,
    private eventRepo: EventRepository
  ) {}

  public static canTransition(from: JobStatus, to: JobStatus): boolean {
    const allowed = ALLOWED_TRANSITIONS[from];
    return Array.isArray(allowed) && allowed.includes(to);
  }

  public transition(
    jobId: string,
    toStatus: JobStatus,
    options?: {
      step?: JobStep;
      message?: string;
      error?: string;
      metadata?: Record<string, unknown>;
    }
  ): Job {
    const job = this.jobRepo.findById(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    const currentStatus = job.status;
    if (!JobStateMachine.canTransition(currentStatus, toStatus)) {
      throw new InvalidTransitionError(currentStatus, toStatus, jobId);
    }

    const updates: Partial<Omit<Job, 'id' | 'createdAt'>> = {
      status: toStatus
    };

    if (options?.step !== undefined) {
      updates.currentStep = options.step;
    }

    const now = new Date().toISOString();

    if (toStatus === 'STARTING' && !job.startedAt) {
      updates.startedAt = now;
    } else if (toStatus === 'DELIVERED') {
      updates.completedAt = now;
    } else if (toStatus === 'FAILED' || toStatus === 'FAILED_FINAL') {
      updates.failedAt = now;
      if (options?.error) {
        updates.lastError = options.error;
      }
    } else if (toStatus === 'RETRYING') {
      updates.retryCount = job.retryCount + 1;
    }

    const updatedJob = this.jobRepo.update(jobId, updates);
    if (!updatedJob) {
      throw new Error(`Failed to update job: ${jobId}`);
    }

    // Record transition event
    const eventMessage =
      options?.message || `Job transitioned from ${currentStatus} to ${toStatus}`;

    this.eventRepo.record({
      jobId,
      level: toStatus === 'FAILED' || toStatus === 'FAILED_FINAL' ? 'error' : 'info',
      type: 'STATE_TRANSITION',
      message: eventMessage,
      metadata: {
        from: currentStatus,
        to: toStatus,
        step: options?.step || updatedJob.currentStep,
        error: options?.error,
        retryCount: updatedJob.retryCount,
        ...options?.metadata
      }
    });

    return updatedJob;
  }
}
