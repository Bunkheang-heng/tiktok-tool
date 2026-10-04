export interface VideoGenerationInput {
  jobId: string;
  topic?: string;
  topicKhmer?: string;
  prompt: string;
  script?: string;
  aspectRatio?: '9:16' | '16:9' | '1:1';
  durationSeconds?: number;
  outputDirectory: string;
}

export interface GeneratedVideo {
  filePath: string;
  durationSeconds: number;
  width: number;
  height: number;
  hasAudio: boolean;
}

export interface ProviderHealth {
  healthy: boolean;
  message?: string;
}

export interface VideoGenerator {
  readonly id: string;
  readonly name: string;
  validateConfiguration(): Promise<ProviderHealth>;
  generate(input: VideoGenerationInput): Promise<GeneratedVideo>;
}
