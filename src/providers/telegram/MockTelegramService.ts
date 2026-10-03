import {
  TelegramDocumentInput,
  TelegramMessageInput,
  TelegramService,
  TelegramVideoInput
} from './TelegramService';

export interface RecordedTelegramItem {
  type: 'message' | 'video' | 'document' | 'notification';
  payload: Record<string, unknown>;
  timestamp: string;
}

export class MockTelegramService implements TelegramService {
  public recordedItems: RecordedTelegramItem[] = [];
  private messageCounter = 1;

  public async sendMessage(input: TelegramMessageInput): Promise<{ messageId: number }> {
    const id = this.messageCounter++;
    this.recordedItems.push({
      type: 'message',
      payload: { ...input, messageId: id },
      timestamp: new Date().toISOString()
    });
    return { messageId: id };
  }

  public async sendVideo(input: TelegramVideoInput): Promise<{ messageId: number }> {
    const id = this.messageCounter++;
    this.recordedItems.push({
      type: 'video',
      payload: { ...input, messageId: id },
      timestamp: new Date().toISOString()
    });
    return { messageId: id };
  }

  public async sendDocument(input: TelegramDocumentInput): Promise<{ messageId: number }> {
    const id = this.messageCounter++;
    this.recordedItems.push({
      type: 'document',
      payload: { ...input, messageId: id },
      timestamp: new Date().toISOString()
    });
    return { messageId: id };
  }

  public async notifyJobStart(jobName: string, scheduledTime: string, topic?: string): Promise<void> {
    const text = `🚀 *BEN10 FX AUTOMATION STARTED*\n\nJob: ${jobName}\nScheduled Time: ${scheduledTime}\nTopic: ${topic || 'Selecting...'}\nStatus: Starting content generation`;
    await this.sendMessage({ text, parseMode: 'Markdown' });
  }

  public async notifyTopicSelected(topic: string, topicKhmer?: string): Promise<void> {
    const text = `🧠 *TOPIC SELECTED*\n\nTopic: ${topic}${topicKhmer ? ` (${topicKhmer})` : ''}\n\nGenerating Khmer script...`;
    await this.sendMessage({ text, parseMode: 'Markdown' });
  }

  public async notifyVideoGenerationStarted(topic: string): Promise<void> {
    const text = `🎬 *VIDEO GENERATION STARTED*\n\nTopic: ${topic}\n\nThe video engine is now generating the visual content.`;
    await this.sendMessage({ text, parseMode: 'Markdown' });
  }

  public async notifyStepRetry(
    jobName: string,
    step: string,
    retryCount: number,
    maxRetries: number,
    error: string
  ): Promise<void> {
    const text = `⚠️ *STEP FAILED — RETRYING*\n\nJob: ${jobName}\nStep: ${step}\nRetry: ${retryCount}/${maxRetries}\nError: ${error}`;
    await this.sendMessage({ text, parseMode: 'Markdown' });
  }

  public async notifyJobSuccess(params: {
    videoPath: string;
    topic: string;
    title: string;
    description: string;
    hashtags: string[];
  }): Promise<void> {
    const caption = `✅ *BEN10 FX VIDEO READY*\n\n*Topic:*\n${params.topic}\n\n*TikTok Title:*\n${params.title}\n\n*Description:*\n${params.description}\n\n*Hashtags:*\n${params.hashtags.join(' ')}\n\n*Status:*\nReady for manual posting.`;

    await this.sendVideo({
      videoPath: params.videoPath,
      caption,
      parseMode: 'Markdown',
      title: params.title
    });
  }

  public async notifyJobFailure(params: {
    jobName: string;
    topic?: string;
    failedStep: string;
    retryCount: number;
    error: string;
  }): Promise<void> {
    const text = `❌ *JOB FAILED*\n\nJob: ${params.jobName}\nTopic: ${params.topic || 'N/A'}\nFailed Step: ${params.failedStep}\nRetries: ${params.retryCount}\nError: ${params.error}\n\nPlease check the desktop application logs.`;
    await this.sendMessage({ text, parseMode: 'Markdown' });
  }

  public clear(): void {
    this.recordedItems = [];
    this.messageCounter = 1;
  }
}
