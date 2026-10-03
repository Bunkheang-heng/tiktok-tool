import { TtsInput, TtsProvider, TtsResult } from './TtsProvider';
import fs from 'node:fs';
import path from 'node:path';

export class KhmerTtsProvider implements TtsProvider {
  public readonly id = 'google-khmer';
  public readonly name = 'Khmer Neural Voice TTS';

  constructor(private timeoutMs: number = 30000) {}

  public async synthesize(input: TtsInput): Promise<TtsResult> {
    if (!fs.existsSync(input.outputDirectory)) {
      fs.mkdirSync(input.outputDirectory, { recursive: true });
    }

    const audioPath = path.join(input.outputDirectory, 'narration.mp3');

    // Split text into chunks suitable for TTS (around 150 chars, split on punctuation)
    const chunks = this.chunkKhmerText(input.text, 150);
    const audioBuffers: Buffer[] = [];

    for (const chunk of chunks) {
      if (!chunk.trim()) continue;
      const buffer = await this.fetchAudioChunk(chunk);
      audioBuffers.push(buffer);
    }

    if (audioBuffers.length === 0) {
      throw new Error('TTS produced no audio buffers for the given text');
    }

    // Merge audio chunks into narration.mp3
    const combined = Buffer.concat(audioBuffers);
    fs.writeFileSync(audioPath, combined);

    // Approximate duration: average Khmer reading speed is approx 12-15 chars per second
    const estimatedDuration = Math.max(15, Math.round(input.text.length / 12));

    return {
      audioPath,
      durationSeconds: estimatedDuration,
      format: 'mp3'
    };
  }

  private chunkKhmerText(text: string, maxChunkLen: number): string[] {
    const sentences = text.split(/([។!?\n]+)/);
    const chunks: string[] = [];
    let current = '';

    for (const piece of sentences) {
      if ((current + piece).length > maxChunkLen && current.length > 0) {
        chunks.push(current.trim());
        current = piece;
      } else {
        current += piece;
      }
    }
    if (current.trim()) {
      chunks.push(current.trim());
    }

    return chunks.length > 0 ? chunks : [text];
  }

  private async fetchAudioChunk(text: string): Promise<Buffer> {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=km&client=tw-ob`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://translate.google.com/'
        },
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Google TTS request failed with status: ${response.status}`);
      }

      const arrayBuf = await response.arrayBuffer();
      return Buffer.from(arrayBuf);
    } finally {
      clearTimeout(timer);
    }
  }
}
