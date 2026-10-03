import { describe, it, expect } from 'vitest';
import { RealVideoRenderer } from '../../src/media/ffmpeg/RealVideoRenderer';

describe('FFmpeg Diagnostics & Health Check', () => {
  it('detects system FFmpeg installation and version', async () => {
    const renderer = new RealVideoRenderer('ffmpeg');
    const health = await renderer.checkHealth();

    expect(health.installed).toBe(true);
    expect(health.version).toBeDefined();
    expect(health.version).toContain('8.1');
  });
});
