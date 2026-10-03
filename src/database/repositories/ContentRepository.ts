import { DatabaseClient } from '../client/DatabaseClient';
import { GeneratedContentData, GeneratedContentRecord } from '../../core/types/content';
import { randomUUID } from 'node:crypto';

interface GeneratedContentRow {
  id: string;
  job_id: string;
  topic: string;
  topic_khmer: string;
  hook: string;
  script_khmer: string;
  video_prompt: string;
  title_khmer: string;
  description_khmer: string;
  hashtags_json: string;
  raw_llm_response: string;
  created_at: string;
}

export class ContentRepository {
  constructor(private db: DatabaseClient) {}

  private mapRowToRecord(row: GeneratedContentRow): GeneratedContentRecord {
    let hashtags: string[] = [];
    try {
      hashtags = JSON.parse(row.hashtags_json);
    } catch {
      hashtags = ['#TradingKhmer', '#ForexKhmer', '#Ben10FX'];
    }

    return {
      id: row.id,
      jobId: row.job_id,
      topic: row.topic,
      topicKhmer: row.topic_khmer,
      hook: row.hook,
      scriptKhmer: row.script_khmer,
      videoPrompt: row.video_prompt,
      titleKhmer: row.title_khmer,
      descriptionKhmer: row.description_khmer,
      hashtags,
      rawLlmResponse: row.raw_llm_response,
      createdAt: row.created_at
    };
  }

  public save(jobId: string, content: GeneratedContentData, rawResponse: string = ''): GeneratedContentRecord {
    const existing = this.findByJobId(jobId);
    const now = new Date().toISOString();
    const id = existing ? existing.id : randomUUID();
    const hashtagsJson = JSON.stringify(content.hashtags);

    if (existing) {
      this.db.run(
        `UPDATE generated_contents SET
          topic = ?, topic_khmer = ?, hook = ?, script_khmer = ?,
          video_prompt = ?, title_khmer = ?, description_khmer = ?,
          hashtags_json = ?, raw_llm_response = ?
        WHERE job_id = ?`,
        [
          content.topic,
          content.topicKhmer,
          content.hook,
          content.scriptKhmer,
          content.videoPrompt,
          content.titleKhmer,
          content.descriptionKhmer,
          hashtagsJson,
          rawResponse,
          jobId
        ]
      );
    } else {
      this.db.run(
        `INSERT INTO generated_contents (
          id, job_id, topic, topic_khmer, hook, script_khmer,
          video_prompt, title_khmer, description_khmer, hashtags_json,
          raw_llm_response, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          jobId,
          content.topic,
          content.topicKhmer,
          content.hook,
          content.scriptKhmer,
          content.videoPrompt,
          content.titleKhmer,
          content.descriptionKhmer,
          hashtagsJson,
          rawResponse,
          now
        ]
      );
    }

    const saved = this.findByJobId(jobId);
    if (!saved) throw new Error(`Failed to save generated content for job ${jobId}`);
    return saved;
  }

  public findByJobId(jobId: string): GeneratedContentRecord | null {
    const row = this.db.get<GeneratedContentRow>(
      'SELECT * FROM generated_contents WHERE job_id = ?',
      [jobId]
    );
    if (!row) return null;
    return this.mapRowToRecord(row);
  }

  public deleteByJobId(jobId: string): boolean {
    const res = this.db.run('DELETE FROM generated_contents WHERE job_id = ?', [jobId]);
    return Number(res.changes) > 0;
  }
}
