export interface TtsInput {
  jobId: string;
  text: string;
  voice?: string;
  rate?: number; // 1.0 = normal
  pitch?: number; // 1.0 = normal
  outputDirectory: string;
}

export interface TtsResult {
  audioPath: string;
  durationSeconds: number;
  format: 'mp3' | 'wav';
}

export interface TtsProvider {
  readonly id: string;
  readonly name: string;
  synthesize(input: TtsInput): Promise<TtsResult>;
}
