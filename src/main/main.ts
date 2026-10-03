import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { getDatabaseService } from '../database';
import { JobStateMachine } from '../core/jobs/StateMachine';
import { Orchestrator } from '../core/jobs/Orchestrator';
import { Scheduler } from '../core/scheduling/Scheduler';
import { registerIpcHandlers } from './ipc/ipcHandlers';
import { TrayManager } from './tray/trayManager';
import { MockLlmProvider } from '../providers/llm/MockLlmProvider';
import { GeminiLlmProvider } from '../providers/llm/GeminiLlmProvider';
import { MockVideoGenerator } from '../providers/video/MockVideoGenerator';
import { BrowserVideoGenerator } from '../providers/video/browser/BrowserVideoGenerator';
import { MockTtsProvider } from '../providers/tts/MockTtsProvider';
import { KhmerTtsProvider } from '../providers/tts/KhmerTtsProvider';
import { MockSubtitleService } from '../media/subtitles/MockSubtitleService';
import { MockRenderer } from '../media/ffmpeg/MockRenderer';
import { RealVideoRenderer } from '../media/ffmpeg/RealVideoRenderer';
import { MockTelegramService } from '../providers/telegram/MockTelegramService';
import { RealTelegramService } from '../providers/telegram/RealTelegramService';
import dotenv from 'dotenv';

dotenv.config();

let mainWindow: BrowserWindow | null = null;
let trayManager: TrayManager | null = null;
let isQuitting = false;

// Enforce single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

async function createWindow() {
  const dbService = getDatabaseService();
  const config = dbService.settings.getAppConfig();

  // 1. Crash recovery: find and mark interrupted jobs from previous unclean shutdowns
  const activeJobs = dbService.jobs.findActive();
  for (const job of activeJobs) {
    dbService.jobs.update(job.id, {
      status: 'INTERRUPTED',
      lastError: 'Application was restarted while job was in progress'
    });
    dbService.events.record({
      jobId: job.id,
      level: 'warn',
      type: 'CRASH_RECOVERY',
      message: `Marked job as INTERRUPTED on app startup from state ${job.status}`
    });
  }

  // 2. Instantiate Providers based on configuration & environment
  const stateMachine = new JobStateMachine(dbService.jobs, dbService.events);

  const isMock = config.appMode === 'mock';

  const llmProvider =
    !isMock && config.geminiApiKey
      ? new GeminiLlmProvider(config.geminiApiKey, config.geminiModel)
      : new MockLlmProvider();

  const videoGenerator =
    !isMock && config.videoProvider === 'browser'
      ? new BrowserVideoGenerator()
      : new MockVideoGenerator();

  const ttsProvider =
    !isMock && config.ttsProvider === 'google'
      ? new KhmerTtsProvider()
      : new MockTtsProvider();

  const subtitleService = new MockSubtitleService();

  const videoRenderer =
    !isMock && config.ffmpegPath
      ? new RealVideoRenderer(config.ffmpegPath)
      : new RealVideoRenderer('ffmpeg');

  const telegramService =
    !isMock && config.telegramBotToken && config.telegramChatId
      ? new RealTelegramService(config.telegramBotToken, config.telegramChatId)
      : new MockTelegramService();

  const orchestrator = new Orchestrator({
    jobRepo: dbService.jobs,
    topicRepo: dbService.topics,
    contentRepo: dbService.contents,
    eventRepo: dbService.events,
    stateMachine,
    llm: llmProvider,
    videoGenerator,
    tts: ttsProvider,
    subtitleService,
    renderer: videoRenderer,
    telegram: telegramService
  });

  // 3. Scheduler with automated execution callback
  const scheduler = new Scheduler(
    dbService.schedules,
    dbService.jobs,
    config.storageDir,
    {
      onJobTriggered: async (job, slot) => {
        const slotName = slot ? slot.name : 'Scheduled Drop';
        await orchestrator.executeJob(job.id, slotName);
        if (trayManager) trayManager.updateMenu();
      }
    }
  );

  scheduler.start();

  // 4. Register safe IPC handlers
  registerIpcHandlers({
    dbService,
    scheduler,
    orchestrator,
    storageDir: config.storageDir
  });

  // 5. Create Desktop Window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    title: 'Ben10 FX Content Automation',
    backgroundColor: '#0a0d14',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Set up Tray
  trayManager = new TrayManager(mainWindow, scheduler);
  trayManager.init();

  // Window close behaviour: minimize to tray if enabled
  mainWindow.on('close', (event) => {
    if (!isQuitting && config.minimizeToTray) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  // Load URL or build
  if (process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.on('before-quit', () => {
  isQuitting = true;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && isQuitting) {
    app.quit();
  }
});
