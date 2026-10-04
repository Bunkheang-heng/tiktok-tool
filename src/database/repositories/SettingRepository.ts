import { DatabaseClient } from '../client/DatabaseClient';
import { AppConfig } from '../../core/types/settings';

interface SettingRow {
  key: string;
  value: string;
  updated_at: string;
}

export class SettingRepository {
  constructor(private db: DatabaseClient) {}

  public get(key: string, defaultValue: string = ''): string {
    const row = this.db.get<SettingRow>('SELECT * FROM app_settings WHERE key = ?', [key]);
    return row ? row.value : defaultValue;
  }

  public set(key: string, value: string): void {
    const now = new Date().toISOString();
    this.db.run(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      [key, value, now]
    );
  }

  public getAll(): Record<string, string> {
    const rows = this.db.all<SettingRow>('SELECT * FROM app_settings');
    const result: Record<string, string> = {};
    for (const r of rows) {
      result[r.key] = r.value;
    }
    return result;
  }

  public getAppConfig(): AppConfig {
    const s = this.getAll();
    return {
      appMode: (s['APP_MODE'] as 'mock' | 'production') || 'mock',
      logLevel: s['LOG_LEVEL'] || 'info',
      telegramBotToken: s['TELEGRAM_BOT_TOKEN'] || '',
      telegramChatId: s['TELEGRAM_CHAT_ID'] || '',
      telegramNotifyLevel: (s['TELEGRAM_NOTIFY_LEVEL'] as 'minimal' | 'normal' | 'detailed') || 'normal',
      geminiApiKey: s['GEMINI_API_KEY'] || '',
      geminiModel: s['GEMINI_MODEL'] || 'gemini-3.1-flash-lite',
      videoProvider: (s['VIDEO_PROVIDER'] as 'mock' | 'browser' | 'api' | 'notebooklm') || 'mock',
      notebookUrl: s['NOTEBOOK_URL'] || 'https://notebook.google.com/notebook/2419265c-bfcb-4dfa-9ee8-52ad6926b5fa',
      ttsProvider: (s['TTS_PROVIDER'] as 'mock' | 'edge' | 'google') || 'mock',
      ttsVoice: s['TTS_VOICE'] || 'km-KH-SreymomNeural',
      ttsRate: parseFloat(s['TTS_RATE'] || '1.0'),
      ffmpegPath: s['FFMPEG_PATH'] || '',
      storageDir: s['STORAGE_DIR'] || './storage',
      maxRetries: parseInt(s['MAX_RETRIES'] || '3', 10),
      retryBaseDelayMs: parseInt(s['RETRY_BASE_DELAY_MS'] || '10000', 10),
      startWithWindows: s['START_WITH_WINDOWS'] === 'true',
      minimizeToTray: s['MINIMIZE_TO_TRAY'] !== 'false' // default true
    };
  }

  public updateAppConfig(config: Partial<AppConfig>): void {
    if (config.appMode !== undefined) this.set('APP_MODE', config.appMode);
    if (config.logLevel !== undefined) this.set('LOG_LEVEL', config.logLevel);
    if (config.telegramBotToken !== undefined) this.set('TELEGRAM_BOT_TOKEN', config.telegramBotToken);
    if (config.telegramChatId !== undefined) this.set('TELEGRAM_CHAT_ID', config.telegramChatId);
    if (config.telegramNotifyLevel !== undefined) this.set('TELEGRAM_NOTIFY_LEVEL', config.telegramNotifyLevel);
    if (config.geminiApiKey !== undefined) this.set('GEMINI_API_KEY', config.geminiApiKey);
    if (config.geminiModel !== undefined) this.set('GEMINI_MODEL', config.geminiModel);
    if (config.videoProvider !== undefined) this.set('VIDEO_PROVIDER', config.videoProvider);
    if (config.notebookUrl !== undefined) this.set('NOTEBOOK_URL', config.notebookUrl);
    if (config.ttsProvider !== undefined) this.set('TTS_PROVIDER', config.ttsProvider);
    if (config.ttsVoice !== undefined) this.set('TTS_VOICE', config.ttsVoice);
    if (config.ttsRate !== undefined) this.set('TTS_RATE', String(config.ttsRate));
    if (config.ffmpegPath !== undefined) this.set('FFMPEG_PATH', config.ffmpegPath);
    if (config.storageDir !== undefined) this.set('STORAGE_DIR', config.storageDir);
    if (config.maxRetries !== undefined) this.set('MAX_RETRIES', String(config.maxRetries));
    if (config.retryBaseDelayMs !== undefined) this.set('RETRY_BASE_DELAY_MS', String(config.retryBaseDelayMs));
    if (config.startWithWindows !== undefined) this.set('START_WITH_WINDOWS', String(config.startWithWindows));
    if (config.minimizeToTray !== undefined) this.set('MINIMIZE_TO_TRAY', String(config.minimizeToTray));
  }
}
