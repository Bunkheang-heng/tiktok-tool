import fs from 'node:fs';
import path from 'node:path';
import initSqlJs from 'sql.js';

async function checkProfiles() {
  const SQL = await initSqlJs();
  const base = 'C:\\Users\\bunkh\\AppData\\Local\\Google\\Chrome\\User Data';
  const profiles = ['Default', 'Profile 2', 'Profile 5'];

  for (const prof of profiles) {
    const historyPath = path.join(base, prof, 'History');
    if (!fs.existsSync(historyPath)) continue;

    const tmpPath = path.resolve(process.cwd(), 'storage', `History_${prof.replace(' ', '_')}`);
    try {
      fs.copyFileSync(historyPath, tmpPath);
      const data = fs.readFileSync(tmpPath);
      const db = new SQL.Database(data);
      const res = db.exec("SELECT url, title, visit_count FROM urls WHERE url LIKE '%notebook%' ORDER BY visit_count DESC LIMIT 5");
      console.log(`\n=== PROFILE: ${prof} ===`);
      if (res.length > 0 && res[0].values) {
        for (const row of res[0].values) {
          console.log(`- ${row[0]} (${row[1]}) [Visits: ${row[2]}]`);
        }
      } else {
        console.log('No notebook visits found in this profile.');
      }
      db.close();
      fs.unlinkSync(tmpPath);
    } catch (err) {
      console.log(`Profile ${prof} read error:`, err.message);
    }
  }
}

checkProfiles().catch(console.error);
