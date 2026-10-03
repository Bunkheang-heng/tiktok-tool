import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createDatabaseService, DatabaseService } from '../../src/database';
import { JobStatus } from '../../src/core/types/job';

describe('Database and Repositories', () => {
  let dbService: DatabaseService;

  beforeEach(() => {
    dbService = createDatabaseService(':memory:');
    dbService.seedIfEmpty();
  });

  afterEach(() => {
    dbService.close();
  });

  it('initializes schema and seeds default schedule slots and topics', () => {
    const slots = dbService.schedules.findAll();
    expect(slots.length).toBe(3);
    expect(slots.map((s) => s.name)).toContain('Morning Drop');
    expect(slots.map((s) => s.name)).toContain('Afternoon Drop');
    expect(slots.map((s) => s.name)).toContain('Evening Drop');

    const topics = dbService.topics.findAll();
    expect(topics.length).toBeGreaterThan(30);
  });

  it('creates, retrieves, and updates jobs correctly', () => {
    const job = dbService.jobs.create({
      id: 'job-test-1',
      scheduleSlotId: 'slot-morning',
      status: 'SCHEDULED',
      outputDirectory: '/fake/output/dir'
    });

    expect(job.id).toBe('job-test-1');
    expect(job.status).toBe('SCHEDULED');
    expect(job.retryCount).toBe(0);

    const updated = dbService.jobs.update('job-test-1', {
      status: 'STARTING' as JobStatus,
      startedAt: new Date().toISOString()
    });

    expect(updated?.status).toBe('STARTING');
    expect(updated?.startedAt).toBeTruthy();

    const activeJobs = dbService.jobs.findActive();
    expect(activeJobs.some((j) => j.id === 'job-test-1')).toBe(true);
  });

  it('handles topic cooldown and pinning correctly', () => {
    const allTopics = dbService.topics.findAll();
    expect(allTopics.length).toBeGreaterThan(0);

    const targetTopic = allTopics[5];
    dbService.topics.setPinned(targetTopic.id, true);

    const nextSelected = dbService.topics.selectNextTopic();
    expect(nextSelected?.id).toBe(targetTopic.id);

    // After mark used, pinned should be cleared and useCount incremented
    dbService.topics.markUsed(targetTopic.id);
    const updated = dbService.topics.findById(targetTopic.id);
    expect(updated?.useCount).toBe(1);
    expect(updated?.pinnedForNext).toBe(false);
    expect(updated?.lastUsedAt).toBeTruthy();
  });

  it('saves and retrieves generated content', () => {
    const job = dbService.jobs.create({
      id: 'job-content-test',
      status: 'STARTING',
      outputDirectory: '/test'
    });

    const content = dbService.contents.save(job.id, {
      topic: 'What is leverage?',
      topicKhmer: 'តើ Leverage គឺជាអ្វី?',
      hook: 'Leverage អាចធ្វើឱ្យអ្នកចំណេញច្រើន ឬខាតអស់ដើមទុន!',
      scriptKhmer: 'សួស្តីបងប្អូនទាំងអស់គ្នា ថ្ងៃនេះយើងរៀនអំពី Leverage...',
      videoPrompt: 'Cinematic visual of financial chart zooming in, high-tech screen',
      titleKhmer: 'យល់ដឹងពី Leverage ត្រឹមតែ ១ នាទី!',
      descriptionKhmer: 'ស្វែងយល់ពីរបៀបប្រើ Leverage ដោយសុវត្ថិភាពក្នុងការ Trade Forex និង Gold។',
      hashtags: ['#TradingKhmer', '#ForexKhmer', '#Ben10FX']
    }, '{"raw": true}');

    expect(content.jobId).toBe(job.id);
    expect(content.hashtags).toContain('#Ben10FX');

    const fetched = dbService.contents.findByJobId(job.id);
    expect(fetched?.titleKhmer).toBe('យល់ដឹងពី Leverage ត្រឹមតែ ១ នាទី!');
  });

  it('records job events audit trail', () => {
    const job = dbService.jobs.create({
      id: 'job-events-test',
      status: 'STARTING',
      outputDirectory: '/test'
    });

    dbService.events.record({
      jobId: job.id,
      type: 'STATE_TRANSITION',
      message: 'Transitioned from SCHEDULED to STARTING',
      metadata: { from: 'SCHEDULED', to: 'STARTING' }
    });

    const events = dbService.events.findByJobId(job.id);
    expect(events.length).toBe(1);
    expect(events[0].message).toContain('Transitioned');
  });

  it('reads and updates application configuration in settings repository', () => {
    const initial = dbService.settings.getAppConfig();
    expect(initial.appMode).toBe('mock');

    dbService.settings.updateAppConfig({
      telegramBotToken: '123456:ABC-DEF',
      telegramChatId: '987654321',
      appMode: 'production'
    });

    const updated = dbService.settings.getAppConfig();
    expect(updated.telegramBotToken).toBe('123456:ABC-DEF');
    expect(updated.telegramChatId).toBe('987654321');
    expect(updated.appMode).toBe('production');
  });
});
