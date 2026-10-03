import { DatabaseClient } from '../client/DatabaseClient';
import { JobEvent } from '../../core/types/job';
import { randomUUID } from 'node:crypto';

interface JobEventRow {
  id: string;
  job_id: string;
  level: string;
  type: string;
  message: string;
  metadata_json: string | null;
  created_at: string;
}

export class EventRepository {
  constructor(private db: DatabaseClient) {}

  private mapRowToEvent(row: JobEventRow): JobEvent {
    return {
      id: row.id,
      jobId: row.job_id,
      level: row.level as 'info' | 'warn' | 'error' | 'debug',
      type: row.type,
      message: row.message,
      metadataJson: row.metadata_json,
      createdAt: row.created_at
    };
  }

  public record(data: {
    jobId: string;
    level?: 'info' | 'warn' | 'error' | 'debug';
    type: string;
    message: string;
    metadata?: Record<string, unknown>;
  }): JobEvent {
    const id = randomUUID();
    const now = new Date().toISOString();
    const metaJson = data.metadata ? JSON.stringify(data.metadata) : null;

    this.db.run(
      `INSERT INTO job_events (
        id, job_id, level, type, message, metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.jobId,
        data.level || 'info',
        data.type,
        data.message,
        metaJson,
        now
      ]
    );

    return {
      id,
      jobId: data.jobId,
      level: data.level || 'info',
      type: data.type,
      message: data.message,
      metadataJson: metaJson,
      createdAt: now
    };
  }

  public findByJobId(jobId: string): JobEvent[] {
    const rows = this.db.all<JobEventRow>(
      'SELECT * FROM job_events WHERE job_id = ? ORDER BY created_at ASC',
      [jobId]
    );
    return rows.map((r) => this.mapRowToEvent(r));
  }

  public findRecent(limit: number = 100): JobEvent[] {
    const rows = this.db.all<JobEventRow>(
      'SELECT * FROM job_events ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    return rows.map((r) => this.mapRowToEvent(r));
  }
}
