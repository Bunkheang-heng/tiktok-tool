const initSqlJs = require('sql.js');
const fs = require('node:fs');
const path = require('node:path');

async function test() {
  console.log('Testing sql.js in Electron...');
  const SQL = await initSqlJs();
  console.log('SQL.js initialized!');

  const dbPath = path.resolve(process.cwd(), 'storage', 'test-sqljs.db');
  let data = null;
  if (fs.existsSync(dbPath)) {
    data = fs.readFileSync(dbPath);
  }

  const db = new SQL.Database(data);
  console.log('Database opened!');
  db.run('CREATE TABLE IF NOT EXISTS test (id INT, message TEXT);');
  db.run("INSERT INTO test VALUES (1, 'hello from electron');");
  
  const res = db.exec('SELECT * FROM test;');
  console.log('Query Result:', JSON.stringify(res));

  const binaryArray = db.export();
  fs.writeFileSync(dbPath, Buffer.from(binaryArray));
  console.log('✅ SQLite database saved to disk successfully via sql.js!');
  db.close();
}

test().catch(console.error);
