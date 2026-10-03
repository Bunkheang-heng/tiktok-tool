export interface AppSetting {
  key: string;
  value: string;
  updatedAt: string;
}

export interface AppConfig {
  appMode: 'mock' | 'production';
  logLevel: string;
  telegramBotToken: string;
  telegramChatId: string;
  telegramNotifyLevel: 'minimal' | 'normal' | 'detailed';
  geminiApiKey: string;
  geminiModel: string;
  videoProvider: 'mock' | 'browser' | 'api';
  ttsProvider: 'mock' | 'edge' | 'google';
  ttsVoice: string;
  ttsRate: number;
  ffmpegPath: string;
  storageDir: string;
  maxRetries: number;
  retryBaseDelayMs: number;
  startWithWindows: boolean;
  minimizeToTray: boolean;
}
