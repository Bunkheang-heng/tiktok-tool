-- Ben10 FX Content Automation Database Schema

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

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_at ON jobs(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_topics_enabled_cooldown ON topics(enabled, last_used_at);
CREATE INDEX IF NOT EXISTS idx_job_events_job_id ON job_events(job_id, created_at);
