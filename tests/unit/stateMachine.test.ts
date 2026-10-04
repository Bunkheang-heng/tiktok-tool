import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createDatabaseService, DatabaseService } from '../../src/database';
import { JobStateMachine, InvalidTransitionError } from '../../src/core/jobs/StateMachine';

describe('JobStateMachine', () => {
  let dbService: DatabaseService;
  let stateMachine: JobStateMachine;

  beforeEach(async () => {
    dbService = await createDatabaseService(':memory:');
    stateMachine = new JobStateMachine(dbService.jobs, dbService.events);
  });


  afterEach(() => {
    dbService.close();
  });

  it('completes the full happy path successfully', () => {
    const job = dbService.jobs.create({
      id: 'job-sm-1',
      status: 'SCHEDULED',
      outputDirectory: '/fake/path'
    });

    expect(job.status).toBe('SCHEDULED');

    stateMachine.transition(job.id, 'STARTING', { step: 'INITIALIZING' });
    stateMachine.transition(job.id, 'TOPIC_SELECTING', { step: 'TOPIC_SELECTION' });
    stateMachine.transition(job.id, 'SCRIPT_GENERATING', { step: 'SCRIPT_GENERATION' });
    stateMachine.transition(job.id, 'SCRIPT_READY', { step: 'SCRIPT_GENERATION' });
    stateMachine.transition(job.id, 'VIDEO_GENERATING', { step: 'VIDEO_GENERATION' });
    stateMachine.transition(job.id, 'VIDEO_READY', { step: 'VIDEO_GENERATION' });
    stateMachine.transition(job.id, 'AUDIO_GENERATING', { step: 'AUDIO_GENERATION' });
    stateMachine.transition(job.id, 'SUBTITLE_GENERATING', { step: 'SUBTITLE_GENERATION' });
    stateMachine.transition(job.id, 'RENDERING', { step: 'RENDERING' });
    stateMachine.transition(job.id, 'METADATA_GENERATING', { step: 'METADATA_GENERATION' });
    stateMachine.transition(job.id, 'TELEGRAM_SENDING', { step: 'TELEGRAM_DELIVERY' });
    const finalJob = stateMachine.transition(job.id, 'DELIVERED', { step: 'TELEGRAM_DELIVERY' });

    expect(finalJob.status).toBe('DELIVERED');
    expect(finalJob.startedAt).toBeTruthy();
    expect(finalJob.completedAt).toBeTruthy();

    const events = dbService.events.findByJobId(job.id);
    expect(events.length).toBe(12);
  });

  it('prevents illegal transitions and throws InvalidTransitionError', () => {
    const job = dbService.jobs.create({
      id: 'job-sm-2',
      status: 'SCHEDULED',
      outputDirectory: '/fake/path'
    });

    expect(() => {
      stateMachine.transition(job.id, 'DELIVERED');
    }).toThrow(InvalidTransitionError);

    expect(() => {
      stateMachine.transition(job.id, 'RENDERING');
    }).toThrow(InvalidTransitionError);
  });

  it('handles failure, retry count increment, and final failure', () => {
    const job = dbService.jobs.create({
      id: 'job-sm-3',
      status: 'SCHEDULED',
      outputDirectory: '/fake/path'
    });

    stateMachine.transition(job.id, 'STARTING');
    stateMachine.transition(job.id, 'TOPIC_SELECTING');
    stateMachine.transition(job.id, 'SCRIPT_GENERATING');

    // Simulate failure during script generation
    stateMachine.transition(job.id, 'FAILED', {
      error: 'Gemini rate limit exceeded',
      step: 'SCRIPT_GENERATION'
    });

    let current = dbService.jobs.findById(job.id)!;
    expect(current.status).toBe('FAILED');
    expect(current.lastError).toBe('Gemini rate limit exceeded');

    // Retry
    stateMachine.transition(job.id, 'RETRYING');
    current = dbService.jobs.findById(job.id)!;
    expect(current.status).toBe('RETRYING');
    expect(current.retryCount).toBe(1);

    // Resume from failed step
    stateMachine.transition(job.id, 'SCRIPT_GENERATING');
    current = dbService.jobs.findById(job.id)!;
    expect(current.status).toBe('SCRIPT_GENERATING');

    // Fail again and transition to FAILED_FINAL
    stateMachine.transition(job.id, 'FAILED', { error: 'Fatal error' });
    stateMachine.transition(job.id, 'FAILED_FINAL');
    current = dbService.jobs.findById(job.id)!;
    expect(current.status).toBe('FAILED_FINAL');
  });
});
