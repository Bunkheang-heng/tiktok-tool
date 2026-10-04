import initSqlJs from 'sql.js';

async function testSqlJs() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run("CREATE TABLE test (id INT, name TEXT);");
  db.run("INSERT INTO test VALUES (1, 'hello');");
  const res = db.exec("SELECT * FROM test");
  console.log('Result:', JSON.stringify(res));
}

testSqlJs();
