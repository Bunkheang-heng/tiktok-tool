export interface RenderInput {
  jobId: string;
  sourceVideoPath: string;
  narrationAudioPath?: string;
  subtitlesAssPath?: string;
  outputDirectory: string;
  targetWidth?: number; // default 1080
  targetHeight?: number; // default 1920
  targetFps?: number; // default 30
  muteOriginalAudio?: boolean; // default true
  onProgress?: (progressPercentage: number) => void;
}

export interface RenderResult {
  finalVideoPath: string;
  thumbnailPath: string;
  durationSeconds: number;
  fileSizeBytes: number;
}

export interface VideoRenderer {
  render(input: RenderInput): Promise<RenderResult>;
  checkHealth(): Promise<{ installed: boolean; version?: string; error?: string }>;
}
