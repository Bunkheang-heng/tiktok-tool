import fs from 'node:fs';
import path from 'node:path';
import {
  GeneratedVideo,
  ProviderHealth,
  VideoGenerationInput,
  VideoGenerator
} from '../VideoGenerator';

export class NotebookLmVideoAdapter implements VideoGenerator {
  public readonly id = 'notebooklm';
  public readonly name = 'Google NotebookLM Video Adapter';

  constructor(private downloadsDir: string = path.resolve(process.env.USERPROFILE || 'C:\\Users\\bunkh', 'Downloads')) {}

  public async validateConfiguration(): Promise<ProviderHealth> {
    return {
      healthy: true,
      message: `Watching for NotebookLM video downloads in: ${this.downloadsDir}`
    };
  }

  public async generate(input: VideoGenerationInput): Promise<GeneratedVideo> {
    if (!fs.existsSync(input.outputDirectory)) {
      fs.mkdirSync(input.outputDirectory, { recursive: true });
    }

    const targetPath = path.join(input.outputDirectory, 'source-video.mp4');

    // 1. Look for recently downloaded MP4/WebM files in the Downloads folder
    const recentVideos = this.findRecentDownloadedVideos(15 * 60 * 1000); // last 15 mins

    if (recentVideos.length > 0) {
      const latestVideo = recentVideos[0];
      fs.copyFileSync(latestVideo.fullPath, targetPath);

      return {
        filePath: targetPath,
        durationSeconds: input.durationSeconds || 60,
        width: 1920,
        height: 1080,
        hasAudio: true
      };
    }

    // 2. Fallback: check storage/source-video.mp4 or return existing
    if (fs.existsSync(targetPath)) {
      return {
        filePath: targetPath,
        durationSeconds: 60,
        width: 1920,
        height: 1080,
        hasAudio: true
      };
    }

    throw new Error(
      `No downloaded NotebookLM video found in ${this.downloadsDir}. Please click Download on the Video Overview in NotebookLM first!`
    );
  }

  private findRecentDownloadedVideos(maxAgeMs: number): Array<{ name: string; fullPath: string; mtime: number }> {
    if (!fs.existsSync(this.downloadsDir)) return [];

    const files = fs.readdirSync(this.downloadsDir);
    const now = Date.now();
    const matches: Array<{ name: string; fullPath: string; mtime: number }> = [];

    for (const f of files) {
      const ext = path.extname(f).toLowerCase();
      if (['.mp4', '.webm', '.mov', '.mkv'].includes(ext)) {
        const fullPath = path.join(this.downloadsDir, f);
        try {
          const stats = fs.statSync(fullPath);
          if (now - stats.mtimeMs < maxAgeMs) {
            matches.push({ name: f, fullPath, mtime: stats.mtimeMs });
          }
        } catch {
          // ignore busy files
        }
      }
    }

    return matches.sort((a, b) => b.mtime - a.mtime);
  }
}
