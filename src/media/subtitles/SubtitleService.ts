export interface SubtitleTimingInput {
  text: string;
  totalDurationSeconds: number;
  outputDirectory: string;
  fontName?: string;
  fontSize?: number;
}

export interface SubtitleResult {
  srtPath: string;
  assPath: string;
  entryCount: number;
}

export interface SubtitleService {
  generateSubtitles(input: SubtitleTimingInput): Promise<SubtitleResult>;
}
