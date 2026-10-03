import { RenderInput, RenderResult, VideoRenderer } from './VideoRenderer';
import fs from 'node:fs';
import path from 'node:path';

export class MockRenderer implements VideoRenderer {
  public async checkHealth(): Promise<{ installed: boolean; version?: string }> {
    return { installed: true, version: 'ffmpeg mock v8.1' };
  }

  public async render(input: RenderInput): Promise<RenderResult> {
    if (!fs.existsSync(input.outputDirectory)) {
      fs.mkdirSync(input.outputDirectory, { recursive: true });
    }

    const finalVideoPath = path.join(input.outputDirectory, 'final.mp4');
    const thumbnailPath = path.join(input.outputDirectory, 'thumbnail.jpg');

    // Simulate progress callback
    if (input.onProgress) {
      input.onProgress(25);
      input.onProgress(50);
      input.onProgress(75);
      input.onProgress(100);
    }

    // Write final output files
    fs.writeFileSync(finalVideoPath, Buffer.from('BEN10_FX_FINAL_RENDERED_MP4_' + input.jobId));
    fs.writeFileSync(thumbnailPath, Buffer.from('BEN10_FX_THUMBNAIL_JPG_' + input.jobId));

    return {
      finalVideoPath,
      thumbnailPath,
      durationSeconds: 45,
      fileSizeBytes: 1024 * 1024 * 12 // ~12MB mock size
    };
  }
}
