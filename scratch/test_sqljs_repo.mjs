import initSqlJs from 'sql.js';
import fs from 'node:fs';
import path from 'node:path';

async function testRepositoryPattern() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  const schemaPath = path.resolve(process.cwd(), 'src', 'database', 'migrations', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schemaSql);

  // Test INSERT with ON CONFLICT
  const now = new Date().toISOString();
  db.run(`
    INSERT INTO app_settings (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `, ['APP_MODE', 'production', now]);

  console.log('Insert rows modified:', db.getRowsModified());

  // Test SELECT single
  const stmt = db.prepare('SELECT * FROM app_settings WHERE key = ?');
  stmt.bind(['APP_MODE']);
  let row = null;
  if (stmt.step()) {
    row = stmt.getAsObject();
  }
  stmt.free();
  console.log('Selected row:', row);

  // Test SELECT multiple
  const allStmt = db.prepare('SELECT * FROM app_settings');
  const rows = [];
  while (allStmt.step()) {
    rows.push(allStmt.getAsObject());
  }
  allStmt.free();
  console.log('All rows count:', rows.length);
}

testRepositoryPattern().catch(console.error);
