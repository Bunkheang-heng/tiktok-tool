import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { DatabaseSync } = require('node:sqlite');

// Type shim for DatabaseSync
interface DatabaseSyncInstance {
  exec(sql: string): void;
  prepare(sql: string): StatementSync;
  close(): void;
}

// Type shim for StatementSync
interface StatementSync {
  all(...params: unknown[]): unknown[];
  get(...params: unknown[]): unknown;
  run(...params: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint };
}

export interface RunResult {
  changes: number | bigint;
  lastInsertRowid: number | bigint;
}

export class DatabaseClient {
  private db: DatabaseSyncInstance;
  private readonly dbPath: string;

  constructor(dbPath: string = ':memory:') {
    this.dbPath = dbPath;
    if (dbPath !== ':memory:') {
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    this.db = new DatabaseSync(dbPath);
    this.initPragmas();
  }

  private initPragmas(): void {
    this.db.exec('PRAGMA foreign_keys = ON;');
    this.db.exec('PRAGMA journal_mode = WAL;');
  }

  public exec(sql: string): void {
    this.db.exec(sql);
  }

  public prepare(sql: string): StatementSync {
    return this.db.prepare(sql);
  }

  public all<T = Record<string, unknown>>(sql: string, params: (string | number | bigint | null | Buffer)[] = []): T[] {
    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as Record<string, unknown>[];
    return rows as unknown as T[];
  }

  public get<T = Record<string, unknown>>(sql: string, params: (string | number | bigint | null | Buffer)[] = []): T | null {
    const stmt = this.db.prepare(sql);
    const row = stmt.get(...params);
    if (!row) return null;
    return row as unknown as T;
  }

  public run(sql: string, params: (string | number | bigint | null | Buffer)[] = []): RunResult {
    const stmt = this.db.prepare(sql);
    const result = stmt.run(...params);
    return {
      changes: result.changes,
      lastInsertRowid: result.lastInsertRowid
    };
  }

  public transaction<T>(callback: () => T): T {
    this.exec('BEGIN TRANSACTION;');
    try {
      const result = callback();
      this.exec('COMMIT;');
      return result;
    } catch (error) {
      this.exec('ROLLBACK;');
      throw error;
    }
  }

  public runMigrations(): void {
    // Run initial schema
    const schemaSql = `
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        schedule_slot_id TEXT,
        topic_id TEXT,
        status TEXT NOT NULL,
        current_step TEXT,
        retry_count INTEGER NOT NULL DEFAULT 0,
        max_retries INTEGER NOT NULL DEFAULT 3,
        scheduled_at TEXT,
        started_at TEXT,
        completed_at TEXT,
        failed_at TEXT,
        last_error TEXT,
        output_directory TEXT NOT NULL,
        final_video_path TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS topics (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        khmer_title TEXT NOT NULL,
        category TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1,
        use_count INTEGER NOT NULL DEFAULT 0,
        last_used_at TEXT,
        cooldown_days INTEGER NOT NULL DEFAULT 7,
        pinned_for_next INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS schedule_slots (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1,
        local_time TEXT NOT NULL,
        days_of_week_json TEXT NOT NULL DEFAULT '[0,1,2,3,4,5,6]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS generated_contents (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL UNIQUE,
        topic TEXT NOT NULL,
        topic_khmer TEXT NOT NULL,
        hook TEXT NOT NULL,
        script_khmer TEXT NOT NULL,
        video_prompt TEXT NOT NULL,
        title_khmer TEXT NOT NULL,
        description_khmer TEXT NOT NULL,
        hashtags_json TEXT NOT NULL,
        raw_llm_response TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS job_events (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        level TEXT NOT NULL,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        metadata_json TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
      CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_at ON jobs(scheduled_at);
      CREATE INDEX IF NOT EXISTS idx_topics_enabled_cooldown ON topics(enabled, last_used_at);
      CREATE INDEX IF NOT EXISTS idx_job_events_job_id ON job_events(job_id, created_at);
    `;
    this.exec(schemaSql);
  }

  public close(): void {
    this.db.close();
  }
}
