import { z } from 'zod';

export const GeneratedContentSchema = z.object({
  topic: z.string().min(1),
  topicKhmer: z.string().min(1),
  hook: z.string().min(1),
  scriptKhmer: z.string().min(1),
  videoPrompt: z.string().min(1),
  titleKhmer: z.string().min(1),
  descriptionKhmer: z.string().min(1),
  hashtags: z.array(z.string()).min(1)
});

export type GeneratedContentData = z.infer<typeof GeneratedContentSchema>;

export interface GeneratedContentRecord extends GeneratedContentData {
  id: string;
  jobId: string;
  rawLlmResponse: string;
  createdAt: string;
}
