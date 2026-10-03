export type JobStatus =
  | 'SCHEDULED'
  | 'STARTING'
  | 'TOPIC_SELECTING'
  | 'SCRIPT_GENERATING'
  | 'SCRIPT_READY'
  | 'VIDEO_GENERATING'
  | 'VIDEO_READY'
  | 'AUDIO_GENERATING'
  | 'SUBTITLE_GENERATING'
  | 'RENDERING'
  | 'METADATA_GENERATING'
  | 'TELEGRAM_SENDING'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETRYING'
  | 'FAILED_FINAL'
  | 'INTERRUPTED'
  | 'CANCELLED';

export type JobStep =
  | 'INITIALIZING'
  | 'TOPIC_SELECTION'
  | 'SCRIPT_GENERATION'
  | 'VIDEO_GENERATION'
  | 'AUDIO_GENERATION'
  | 'SUBTITLE_GENERATION'
  | 'RENDERING'
  | 'METADATA_GENERATION'
  | 'TELEGRAM_DELIVERY';

export interface Job {
  id: string;
  scheduleSlotId: string | null;
  topicId: string | null;
  status: JobStatus;
  currentStep: JobStep | null;
  retryCount: number;
  maxRetries: number;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  failedAt: string | null;
  lastError: string | null;
  outputDirectory: string;
  finalVideoPath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobEvent {
  id: string;
  jobId: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  type: string;
  message: string;
  metadataJson: string | null;
  createdAt: string;
}
