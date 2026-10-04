import initSqlJs, { Database, Statement } from 'sql.js';
import fs from 'node:fs';
import path from 'node:path';

export interface RunResult {
  changes: number | bigint;
  lastInsertRowid: number | bigint;
}

export interface StatementSync {
  all(...params: unknown[]): unknown[];
  get(...params: unknown[]): unknown;
  run(...params: unknown[]): RunResult;
}

class SqlJsStatement implements StatementSync {
  constructor(
    private db: Database,
    private sql: string,
    private onSave: () => void
  ) {}

  public all(...params: unknown[]): unknown[] {
    const stmt: Statement = this.db.prepare(this.sql);
    if (params.length > 0) {
      stmt.bind(params as any[]);
    }
    const results: unknown[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  public get(...params: unknown[]): unknown {
    const stmt: Statement = this.db.prepare(this.sql);
    if (params.length > 0) {
      stmt.bind(params as any[]);
    }
    let result: unknown = null;
    if (stmt.step()) {
      result = stmt.getAsObject();
    }
    stmt.free();
    return result;
  }

  public run(...params: unknown[]): RunResult {
    this.db.run(this.sql, params as any[]);
    const changes = this.db.getRowsModified();
    const res = this.db.exec('SELECT last_insert_rowid() AS id;');
    const lastInsertRowid = (res[0]?.values[0]?.[0] as number) ?? 0;
    this.onSave();
    return { changes, lastInsertRowid };
  }
}

export class DatabaseClient {
  private db: Database;
  private readonly dbPath: string;

  constructor(db: Database, dbPath: string = ':memory:') {
    this.db = db;
    this.dbPath = dbPath;
    this.initPragmas();
  }

  public static async create(dbPath: string = ':memory:'): Promise<DatabaseClient> {
    const SQL = await initSqlJs();
    let data: Uint8Array | null = null;
    if (dbPath !== ':memory:') {
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(dbPath)) {
        data = fs.readFileSync(dbPath);
      }
    }
    const db = data ? new SQL.Database(data) : new SQL.Database();
    return new DatabaseClient(db, dbPath);
  }

  private initPragmas(): void {
    this.db.exec('PRAGMA foreign_keys = ON;');
  }

  public save(): void {
    if (this.dbPath && this.dbPath !== ':memory:') {
      const binaryArray = this.db.export();
      fs.writeFileSync(this.dbPath, Buffer.from(binaryArray));
    }
  }

  public exec(sql: string): void {
    this.db.exec(sql);
    this.save();
  }

  public prepare(sql: string): StatementSync {
    return new SqlJsStatement(this.db, sql, () => this.save());
  }

  public all<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
    return this.prepare(sql).all(...params) as T[];
  }

  public get<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T | null {
    return this.prepare(sql).get(...params) as T | null;
  }

  public run(sql: string, params: unknown[] = []): RunResult {
    return this.prepare(sql).run(...params);
  }

  public transaction<T>(callback: () => T): T {
    this.db.exec('BEGIN TRANSACTION;');
    try {
      const result = callback();
      this.db.exec('COMMIT;');
      this.save();
      return result;
    } catch (error) {
      this.db.exec('ROLLBACK;');
      throw error;
    }
  }

  public runMigrations(): void {
    const schemaPath = path.resolve(__dirname, '..', 'migrations', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf-8');
      this.exec(sql);
      return;
    }

    // Fallback embedded schema
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
    this.save();
    this.db.close();
  }
}
