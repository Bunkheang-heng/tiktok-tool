import { TtsInput, TtsProvider, TtsResult } from './TtsProvider';
import fs from 'node:fs';
import path from 'node:path';

export class MockTtsProvider implements TtsProvider {
  public readonly id = 'mock-tts';
  public readonly name = 'Mock Khmer TTS Provider';

  public async synthesize(input: TtsInput): Promise<TtsResult> {
    if (!fs.existsSync(input.outputDirectory)) {
      fs.mkdirSync(input.outputDirectory, { recursive: true });
    }

    const audioPath = path.join(input.outputDirectory, 'narration.mp3');
    fs.writeFileSync(audioPath, Buffer.from('MOCK_TTS_AUDIO_BUFFER_' + input.text.slice(0, 50)));

    // Estimate duration: approx 3 words per second or 10 characters per second
    const estimatedDuration = Math.max(15, Math.round(input.text.length / 10));

    return {
      audioPath,
      durationSeconds: estimatedDuration,
      format: 'mp3'
    };
  }
}
