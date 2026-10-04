import { chromium } from 'playwright';
import path from 'node:path';

async function verify() {
  const profileDir = 'C:\\Users\\bunkh\\.ben10fx\\browser-profile';
  console.log('Launching Playwright with cloned profile:', profileDir);

  const context = await chromium.launchPersistentContext(profileDir, {
    channel: 'chrome',
    headless: false,
    viewport: { width: 1366, height: 860 },
    acceptDownloads: true,
    args: ['--profile-directory=Default']
  });

  const page = await context.newPage();
  const url = 'https://notebook.google.com/notebook/2419265c-bfcb-4dfa-9ee8-52ad6926b5fa';
  console.log('Navigating to:', url);

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  console.log('Current URL:', page.url());
  console.log('Page Title:', await page.title());

  if (page.url().includes('accounts.google.com')) {
    console.log('❌ Still redirected to accounts.google.com');
  } else {
    console.log('🎉 SUCCESS! NotebookLM loaded with active login!');
  }

  await page.waitForTimeout(3000);
  await context.close();
}

verify().catch(console.error);
