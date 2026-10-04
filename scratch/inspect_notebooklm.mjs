import { chromium } from 'playwright';
import path from 'node:path';

async function main() {
  const profileDir = path.resolve('C:\\Users\\bunkh\\.ben10fx\\browser-profile');
  const context = await chromium.launchPersistentContext(profileDir, {
    channel: 'chrome',
    headless: true,
    viewport: { width: 1366, height: 900 }
  });

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
  await page.goto('https://notebooklm.google.com/notebook/2419265c-bfcb-4dfa-9ee8-52ad6926b5fa');
  await page.waitForTimeout(4000);

  // Inspect existing artifacts in Studio
  const artifacts = await page.$$eval('.artifact-item, .studio-item, mat-card, [role="listitem"]', els =>
    els.map(e => ({
      className: e.className,
      text: e.innerText?.trim()?.replace(/\n/g, ' ')
    }))
  );
  console.log('Artifacts in studio:', JSON.stringify(artifacts, null, 2));

  await context.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
