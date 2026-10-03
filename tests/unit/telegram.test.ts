import { describe, it, expect, beforeEach } from 'vitest';
import { MockTelegramService } from '../../src/providers/telegram/MockTelegramService';

describe('Telegram Notifications & Service', () => {
  let telegram: MockTelegramService;

  beforeEach(() => {
    telegram = new MockTelegramService();
  });

  it('formats and records job start notification', async () => {
    await telegram.notifyJobStart('Morning Drop', '08:30', 'What is leverage?');

    expect(telegram.recordedItems.length).toBe(1);
    const item = telegram.recordedItems[0];
    expect(item.type).toBe('message');
    expect(item.payload.text).toContain('BEN10 FX AUTOMATION STARTED');
    expect(item.payload.text).toContain('Morning Drop');
    expect(item.payload.text).toContain('08:30');
    expect(item.payload.text).toContain('What is leverage?');
  });

  it('formats and records topic selection and video generation notifications', async () => {
    await telegram.notifyTopicSelected('Support and Resistance', 'តំបន់ Support និង Resistance');
    await telegram.notifyVideoGenerationStarted('Support and Resistance');

    expect(telegram.recordedItems.length).toBe(2);
    expect(telegram.recordedItems[0].payload.text).toContain('TOPIC SELECTED');
    expect(telegram.recordedItems[0].payload.text).toContain('Support and Resistance');
    expect(telegram.recordedItems[1].payload.text).toContain('VIDEO GENERATION STARTED');
  });

  it('formats and sends final completion package with video and metadata', async () => {
    await telegram.notifyJobSuccess({
      videoPath: '/mock/path/final.mp4',
      topic: 'What is lot size?',
      title: 'របៀបគណនា Lot Size អោយត្រូវតាមដើមទុន!',
      description: 'ការយល់ដឹងពីទំហំ Lot ជួយការពារគណនីរបស់អ្នកមិនឱ្យ Burn។',
      hashtags: ['#TradingKhmer', '#ForexKhmer', '#Ben10FX']
    });

    expect(telegram.recordedItems.length).toBe(1);
    const item = telegram.recordedItems[0];
    expect(item.type).toBe('video');
    expect(item.payload.videoPath).toBe('/mock/path/final.mp4');
    expect(item.payload.caption).toContain('BEN10 FX VIDEO READY');
    expect(item.payload.caption).toContain('What is lot size?');
    expect(item.payload.caption).toContain('#TradingKhmer #ForexKhmer #Ben10FX');
  });

  it('formats and sends retry and final failure notifications', async () => {
    await telegram.notifyStepRetry('Evening Drop', 'VIDEO_GENERATION', 1, 3, 'Timeout reaching video API');
    await telegram.notifyJobFailure({
      jobName: 'Evening Drop',
      topic: 'Order Blocks',
      failedStep: 'VIDEO_GENERATION',
      retryCount: 3,
      error: 'Max retries exhausted'
    });

    expect(telegram.recordedItems.length).toBe(2);
    expect(telegram.recordedItems[0].payload.text).toContain('STEP FAILED — RETRYING');
    expect(telegram.recordedItems[0].payload.text).toContain('Retry: 1/3');
    expect(telegram.recordedItems[1].payload.text).toContain('JOB FAILED');
    expect(telegram.recordedItems[1].payload.text).toContain('Failed Step: VIDEO_GENERATION');
  });
});
