import {
  TelegramDocumentInput,
  TelegramMessageInput,
  TelegramService,
  TelegramVideoInput
} from './TelegramService';
import fs from 'node:fs';
import path from 'node:path';

function cleanMarkdown(str: string): string {
  if (!str) return '';
  return str.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, ' ');
}

export class RealTelegramService implements TelegramService {
  private readonly baseUrl = 'https://api.telegram.org/bot';
  private readonly timeoutMs: number;

  constructor(
    private botToken: string,
    private defaultChatId?: string,
    timeoutMs: number = 30000
  ) {
    this.timeoutMs = timeoutMs;
  }

  private getApiUrl(method: string): string {
    return `${this.baseUrl}${this.botToken}/${method}`;
  }

  public async sendMessage(input: TelegramMessageInput): Promise<{ messageId: number }> {
    const chatId = input.chatId || this.defaultChatId;
    if (!chatId) throw new Error('Telegram chatId is required');
    if (!this.botToken) throw new Error('Telegram botToken is required');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    const postBody: Record<string, unknown> = {
      chat_id: chatId,
      text: input.text
    };
    if (input.parseMode) {
      postBody.parse_mode = input.parseMode;
    }

    try {
      const response = await fetch(this.getApiUrl('sendMessage'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postBody),
        signal: controller.signal
      });

      const data = (await response.json()) as { ok: boolean; result?: { message_id: number }; description?: string };
      if (!data.ok) {
        if (data.description?.includes("can't parse entities") && input.parseMode) {
          // Auto-fallback: Resend without any parse_mode (pure plain text) so it never fails!
          return this.sendMessage({ text: input.text, chatId: input.chatId, parseMode: undefined });
        }
        throw new Error(`Telegram sendMessage failed: ${data.description || 'Unknown error'}`);
      }
      return { messageId: data.result?.message_id || 0 };
    } finally {
      clearTimeout(timeout);
    }
  }

  public async sendVideo(input: TelegramVideoInput): Promise<{ messageId: number }> {
    const chatId = input.chatId || this.defaultChatId;
    if (!chatId) throw new Error('Telegram chatId is required');
    if (!this.botToken) throw new Error('Telegram botToken is required');

    if (!fs.existsSync(input.videoPath)) {
      throw new Error(`Video file not found at: ${input.videoPath}`);
    }

    const fileBuffer = fs.readFileSync(input.videoPath);
    const fileName = path.basename(input.videoPath);
    const blob = new Blob([fileBuffer], { type: 'video/mp4' });

    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('video', blob, fileName);
    if (input.caption) formData.append('caption', input.caption);
    if (input.parseMode) formData.append('parse_mode', input.parseMode);
    if (input.title) formData.append('title', input.title);
    if (input.duration) formData.append('duration', String(input.duration));

    const controller = new AbortController();
    // Allow up to 3 minutes for video upload
    const timeout = setTimeout(() => controller.abort(), Math.max(this.timeoutMs, 180000));

    try {
      const response = await fetch(this.getApiUrl('sendVideo'), {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      const data = (await response.json()) as { ok: boolean; result?: { message_id: number }; description?: string };
      if (!data.ok) {
        if (data.description?.includes("can't parse entities") && input.parseMode) {
          return this.sendVideo({ ...input, parseMode: undefined });
        }
        throw new Error(`Telegram sendVideo failed: ${data.description || 'Unknown error'}`);
      }
      return { messageId: data.result?.message_id || 0 };
    } finally {
      clearTimeout(timeout);
    }
  }

  public async sendDocument(input: TelegramDocumentInput): Promise<{ messageId: number }> {
    const chatId = input.chatId || this.defaultChatId;
    if (!chatId) throw new Error('Telegram chatId is required');
    if (!this.botToken) throw new Error('Telegram botToken is required');

    if (!fs.existsSync(input.documentPath)) {
      throw new Error(`Document not found at: ${input.documentPath}`);
    }

    const fileBuffer = fs.readFileSync(input.documentPath);
    const fileName = path.basename(input.documentPath);
    const blob = new Blob([fileBuffer]);

    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('document', blob, fileName);
    if (input.caption) formData.append('caption', input.caption);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.getApiUrl('sendDocument'), {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      const data = (await response.json()) as { ok: boolean; result?: { message_id: number }; description?: string };
      if (!data.ok) {
        throw new Error(`Telegram sendDocument failed: ${data.description || 'Unknown error'}`);
      }
      return { messageId: data.result?.message_id || 0 };
    } finally {
      clearTimeout(timeout);
    }
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
    const safeError = cleanMarkdown(error);
    const safeStep = cleanMarkdown(step);
    const text = `⚠️ *STEP FAILED — RETRYING*\n\nJob: ${jobName}\nStep: ${safeStep}\nRetry: ${retryCount}/${maxRetries}\nError: ${safeError}`;
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
    const safeError = cleanMarkdown(params.error);
    const safeStep = cleanMarkdown(params.failedStep);
    const text = `❌ *JOB FAILED*\n\nJob: ${params.jobName}\nTopic: ${params.topic || 'N/A'}\nFailed Step: ${safeStep}\nRetries: ${params.retryCount}\nError: ${safeError}\n\nPlease check the desktop application logs.`;
    await this.sendMessage({ text, parseMode: 'Markdown' });
  }
}
