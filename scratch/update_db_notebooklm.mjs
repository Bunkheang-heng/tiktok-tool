import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dbPath = path.resolve(process.cwd(), 'storage', 'ben10fx.db');
const schemaPath = path.resolve(process.cwd(), 'src', 'database', 'migrations', 'schema.sql');

const db = new DatabaseSync(dbPath);
const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schemaSql);

const now = new Date().toISOString();
const setStmt = db.prepare(`
  INSERT INTO app_settings (key, value, updated_at)
  VALUES (?, ?, ?)
  ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
`);

setStmt.run('APP_MODE', 'production', now);
setStmt.run('VIDEO_PROVIDER', 'notebooklm', now);
setStmt.run('NOTEBOOK_URL', 'https://notebook.google.com/notebook/2419265c-bfcb-4dfa-9ee8-52ad6926b5fa', now);
setStmt.run('TELEGRAM_BOT_TOKEN', '8884039162:AAEXDW30sIAUzD3d40ziClGPxM0vhHb_3lE', now);
setStmt.run('TELEGRAM_CHAT_ID', '1099911298', now);
setStmt.run('GEMINI_API_KEY', 'AIzaSyDw17nb34vJWCkEyJtWdnSLrybRjcx0wvE', now);
setStmt.run('GEMINI_MODEL', 'gemini-3.1-flash-lite', now);
setStmt.run('TTS_PROVIDER', 'google', now);

console.log('✅ SQLite Database updated successfully:');
const rows = db.prepare('SELECT key, value FROM app_settings').all();
for (const r of rows) {
  console.log(`  ${r.key}: ${r.value}`);
}
