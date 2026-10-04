const path = require('node:path');
const fs = require('node:fs');

console.log('Testing better-sqlite3 in Electron...');
try {
  const Database = require('better-sqlite3');
  const dbPath = path.resolve(process.cwd(), 'storage', 'test-electron.db');
  console.log('Opening DB at:', dbPath);
  const db = new Database(dbPath);
  console.log('Database opened successfully!');
  db.exec('CREATE TABLE IF NOT EXISTS test (id INT);');
  console.log('Table created successfully!');
  db.close();
  console.log('ALL DB OPERATIONS SUCCEEDED IN ELECTRON!');
} catch (err) {
  console.error('🔥 DB ERROR IN ELECTRON:', err);
}
