export interface TelegramMessageInput {
  chatId?: string;
  text: string;
  parseMode?: 'Markdown' | 'HTML';
}

export interface TelegramVideoInput {
  chatId?: string;
  videoPath: string;
  caption?: string;
  parseMode?: 'Markdown' | 'HTML';
  title?: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface TelegramDocumentInput {
  chatId?: string;
  documentPath: string;
  caption?: string;
}

export interface TelegramService {
  sendMessage(input: TelegramMessageInput): Promise<{ messageId: number }>;
  sendVideo(input: TelegramVideoInput): Promise<{ messageId: number }>;
  sendDocument(input: TelegramDocumentInput): Promise<{ messageId: number }>;
  notifyJobStart(jobName: string, scheduledTime: string, topic?: string): Promise<void>;
  notifyTopicSelected(topic: string, topicKhmer?: string): Promise<void>;
  notifyVideoGenerationStarted(topic: string): Promise<void>;
  notifyStepRetry(jobName: string, step: string, retryCount: number, maxRetries: number, error: string): Promise<void>;
  notifyJobSuccess(params: {
    videoPath: string;
    topic: string;
    title: string;
    description: string;
    hashtags: string[];
  }): Promise<void>;
  notifyJobFailure(params: {
    jobName: string;
    topic?: string;
    failedStep: string;
    retryCount: number;
    error: string;
  }): Promise<void>;
}
