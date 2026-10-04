import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createDatabaseService, DatabaseService } from '../../src/database';
import { JobStateMachine } from '../../src/core/jobs/StateMachine';
import { Orchestrator } from '../../src/core/jobs/Orchestrator';
import { MockLlmProvider } from '../../src/providers/llm/MockLlmProvider';
import { MockVideoGenerator } from '../../src/providers/video/MockVideoGenerator';
import { MockTtsProvider } from '../../src/providers/tts/MockTtsProvider';
import { MockSubtitleService } from '../../src/media/subtitles/MockSubtitleService';
import { MockRenderer } from '../../src/media/ffmpeg/MockRenderer';
import { MockTelegramService } from '../../src/providers/telegram/MockTelegramService';
import fs from 'node:fs';
import path from 'node:path';

describe('Milestone 5: Mock End-to-End Content Pipeline', () => {
  let dbService: DatabaseService;
  let orchestrator: Orchestrator;
  let telegram: MockTelegramService;
  const testStorageDir = path.resolve(process.cwd(), 'storage_test');

  beforeEach(async () => {
    dbService = await createDatabaseService(':memory:');
    dbService.seedIfEmpty();

    const stateMachine = new JobStateMachine(dbService.jobs, dbService.events);
    telegram = new MockTelegramService();

    orchestrator = new Orchestrator({
      jobRepo: dbService.jobs,
      topicRepo: dbService.topics,
      contentRepo: dbService.contents,
      eventRepo: dbService.events,
      stateMachine,
      llm: new MockLlmProvider(),
      videoGenerator: new MockVideoGenerator(),
      tts: new MockTtsProvider(),
      subtitleService: new MockSubtitleService(),
      renderer: new MockRenderer(),
      telegram
    });
  });

  afterEach(() => {
    dbService.close();
    if (fs.existsSync(testStorageDir)) {
      fs.rmSync(testStorageDir, { recursive: true, force: true });
    }
  });

  it('runs complete end-to-end pipeline from start to delivery', async () => {
    const jobId = 'e2e-pipeline-job-1';
    const jobDir = path.join(testStorageDir, 'jobs', jobId);

    // 1. Create scheduled job
    const job = dbService.jobs.create({
      id: jobId,
      scheduleSlotId: 'slot-morning',
      status: 'SCHEDULED',
      outputDirectory: jobDir
    });

    expect(job.status).toBe('SCHEDULED');

    // 2. Execute pipeline
    const completedJob = await orchestrator.executeJob(jobId, 'Morning Drop');

    // 3. Verify final job status
    expect(completedJob.status).toBe('DELIVERED');
    expect(completedJob.startedAt).toBeTruthy();
    expect(completedJob.completedAt).toBeTruthy();
    expect(completedJob.finalVideoPath).toContain('final.mp4');
    expect(fs.existsSync(completedJob.finalVideoPath!)).toBe(true);

    // 4. Verify topic was selected and marked used
    expect(completedJob.topicId).not.toBeNull();
    const topic = dbService.topics.findById(completedJob.topicId!)!;
    expect(topic.useCount).toBe(1);
    expect(topic.lastUsedAt).toBeTruthy();

    // 5. Verify generated content in database
    const content = dbService.contents.findByJobId(jobId)!;
    expect(content).toBeDefined();
    expect(content.scriptKhmer).toContain('សួស្តីបងប្អូនទាំងអស់គ្នា');
    expect(content.hashtags).toContain('#Ben10FX');

    // 6. Verify generated physical files in job folder
    expect(fs.existsSync(path.join(jobDir, 'source-video.mp4'))).toBe(true);
    expect(fs.existsSync(path.join(jobDir, 'narration.mp3'))).toBe(true);
    expect(fs.existsSync(path.join(jobDir, 'subtitles.srt'))).toBe(true);
    expect(fs.existsSync(path.join(jobDir, 'subtitles.ass'))).toBe(true);
    expect(fs.existsSync(path.join(jobDir, 'final.mp4'))).toBe(true);
    expect(fs.existsSync(path.join(jobDir, 'thumbnail.jpg'))).toBe(true);

    // 7. Verify Telegram received all expected notifications
    expect(telegram.recordedItems.length).toBe(4);
    // Item 1: Job start
    expect(telegram.recordedItems[0].payload.text).toContain('BEN10 FX AUTOMATION STARTED');
    // Item 2: Topic selected
    expect(telegram.recordedItems[1].payload.text).toContain('TOPIC SELECTED');
    // Item 3: Video generation started
    expect(telegram.recordedItems[2].payload.text).toContain('VIDEO GENERATION STARTED');
    // Item 4: Video sent
    expect(telegram.recordedItems[3].type).toBe('video');
    expect(telegram.recordedItems[3].payload.caption).toContain('BEN10 FX VIDEO READY');
    expect(telegram.recordedItems[3].payload.caption).toContain('#Ben10FX');

    // 8. Verify Resend to Telegram works without re-rendering
    telegram.clear();
    await orchestrator.resendToTelegram(jobId);
    expect(telegram.recordedItems.length).toBe(1);
    expect(telegram.recordedItems[0].type).toBe('video');
  });
});
