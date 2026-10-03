import {
  GeneratedVideo,
  ProviderHealth,
  VideoGenerationInput,
  VideoGenerator
} from './VideoGenerator';
import fs from 'node:fs';
import path from 'node:path';

export class MockVideoGenerator implements VideoGenerator {
  public readonly id = 'mock-video';
  public readonly name = 'Mock Video Generator';

  public async validateConfiguration(): Promise<ProviderHealth> {
    return { healthy: true, message: 'Mock video generator is always operational' };
  }

  public async generate(input: VideoGenerationInput): Promise<GeneratedVideo> {
    if (!fs.existsSync(input.outputDirectory)) {
      fs.mkdirSync(input.outputDirectory, { recursive: true });
    }

    const filePath = path.join(input.outputDirectory, 'source-video.mp4');
    // Write a mock video container header/content
    fs.writeFileSync(filePath, Buffer.from('MOCK_VIDEO_BINARY_DATA_' + input.jobId));

    return {
      filePath,
      durationSeconds: input.durationSeconds || 60,
      width: 1080,
      height: 1920,
      hasAudio: false
    };
  }
}
