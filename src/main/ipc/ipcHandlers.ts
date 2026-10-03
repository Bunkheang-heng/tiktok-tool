import { ipcMain, shell } from 'electron';
import { DatabaseService } from '../../database';
import { Scheduler } from '../../core/scheduling/Scheduler';
import { Orchestrator } from '../../core/jobs/Orchestrator';
import { RealTelegramService } from '../../providers/telegram/RealTelegramService';
import { MockTelegramService } from '../../providers/telegram/MockTelegramService';
import fs from 'node:fs';
import path from 'node:path';

export interface IpcContext {
  dbService: DatabaseService;
  scheduler: Scheduler;
  orchestrator: Orchestrator;
  storageDir: string;
}

export function registerIpcHandlers(ctx: IpcContext): void {
  const { dbService, scheduler, orchestrator, storageDir } = ctx;

  // 1. Dashboard state
  ipcMain.handle('dashboard:get-state', async () => {
    const activeJobs = dbService.jobs.findActive();
    const upcoming = scheduler.getNextUpcomingSlot();
    const allJobs = dbService.jobs.findAll({ limit: 10 });
    const completedCount = dbService.jobs.findAll({ status: 'DELIVERED' }).length;
    const failedCount = dbService.jobs.findAll({ status: 'FAILED_FINAL' }).length;
    const totalTopics = dbService.topics.count();
    const config = dbService.settings.getAppConfig();

    return {
      schedulerRunning: scheduler.isRunning(),
      activeJob: activeJobs.length > 0 ? activeJobs[0] : null,
      nextRun: upcoming ? upcoming.nextRun.toISOString() : null,
      nextSlotName: upcoming ? upcoming.slot.name : null,
      recentJobs: allJobs,
      stats: {
        completed: completedCount,
        failed: failedCount,
        totalTopics,
        mode: config.appMode
      }
    };
  });

  // 2. Jobs
  ipcMain.handle('jobs:get-all', async (_, options) => {
    return dbService.jobs.findAll(options);
  });

  ipcMain.handle('jobs:get-by-id', async (_, jobId: string) => {
    const job = dbService.jobs.findById(jobId);
    if (!job) return null;
    const content = dbService.contents.findByJobId(jobId);
    const events = dbService.events.findByJobId(jobId);
    const topic = job.topicId ? dbService.topics.findById(job.topicId) : null;
    return { job, content, events, topic };
  });

  ipcMain.handle('jobs:trigger-generate-now', async () => {
    const job = await scheduler.triggerGenerateNow();
    // Run orchestrator asynchronously in background
    orchestrator.executeJob(job.id, 'On-Demand Generation').catch((err) => {
      console.error(`On-demand job execution error for ${job.id}:`, err);
    });
    return job;
  });

  ipcMain.handle('jobs:retry', async (_, jobId: string) => {
    const job = dbService.jobs.findById(jobId);
    if (!job) throw new Error(`Job not found: ${jobId}`);

    // Trigger retry asynchronously
    orchestrator.executeJob(job.id, 'Manual Retry').catch((err) => {
      console.error(`Manual retry error for ${job.id}:`, err);
    });
    return { success: true };
  });

  ipcMain.handle('jobs:resend-telegram', async (_, jobId: string) => {
    await orchestrator.resendToTelegram(jobId);
    return { success: true };
  });

  ipcMain.handle('jobs:open-folder', async (_, jobId: string) => {
    const job = dbService.jobs.findById(jobId);
    if (!job) throw new Error(`Job not found: ${jobId}`);
    if (fs.existsSync(job.outputDirectory)) {
      await shell.openPath(job.outputDirectory);
      return { success: true };
    }
    return { success: false, error: 'Directory does not exist' };
  });

  // 3. Schedule slots
  ipcMain.handle('schedule:get-slots', async () => {
    return dbService.schedules.findAll().map((s) => dbService.schedules.toDTO(s));
  });

  ipcMain.handle('schedule:update-slot', async (_, id: string, updates: any) => {
    return dbService.schedules.update(id, updates);
  });

  ipcMain.handle('schedule:add-slot', async (_, slotData: any) => {
    return dbService.schedules.create(slotData);
  });

  ipcMain.handle('schedule:delete-slot', async (_, id: string) => {
    return dbService.schedules.delete(id);
  });

  // 4. Topics
  ipcMain.handle('topics:get-all', async (_, filter) => {
    return dbService.topics.findAll(filter);
  });

  ipcMain.handle('topics:add', async (_, topicData) => {
    return dbService.topics.create(topicData);
  });

  ipcMain.handle('topics:update', async (_, id: string, updates) => {
    return dbService.topics.update(id, updates);
  });

  ipcMain.handle('topics:delete', async (_, id: string) => {
    return dbService.topics.delete(id);
  });

  ipcMain.handle('topics:set-pinned', async (_, id: string, pinned: boolean) => {
    dbService.topics.setPinned(id, pinned);
    return { success: true };
  });

  // 5. Settings
  ipcMain.handle('settings:get', async () => {
    return dbService.settings.getAppConfig();
  });

  ipcMain.handle('settings:update', async (_, newSettings) => {
    dbService.settings.updateAppConfig(newSettings);
    return dbService.settings.getAppConfig();
  });

  ipcMain.handle('settings:test-telegram', async () => {
    const config = dbService.settings.getAppConfig();
    if (!config.telegramBotToken || !config.telegramChatId) {
      throw new Error('Telegram Bot Token and Chat ID must be configured in Settings');
    }
    const telegram = new RealTelegramService(config.telegramBotToken, config.telegramChatId);
    await telegram.sendMessage({
      text: '🤖 *Ben10 FX Content Automation*\n\n✅ Test connection successful! Your Telegram notifications and video deliveries are active.',
      parseMode: 'Markdown'
    });
    return { success: true };
  });

  // 6. Logs
  ipcMain.handle('logs:get-recent', async (_, limit = 100) => {
    return dbService.events.findRecent(limit);
  });

  ipcMain.handle('logs:open-folder', async () => {
    const logDir = path.resolve(storageDir, 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    await shell.openPath(logDir);
    return { success: true };
  });
}
