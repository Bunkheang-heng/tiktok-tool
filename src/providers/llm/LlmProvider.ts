import { GeneratedContentData } from '../../core/types/content';

export interface ContentGenerationInput {
  topic: string;
  topicKhmer?: string;
  category?: string;
  targetDurationSeconds?: number;
  additionalInstructions?: string;
}

export interface LlmProvider {
  readonly id: string;
  readonly name: string;
  generateContent(input: ContentGenerationInput): Promise<GeneratedContentData>;
}
