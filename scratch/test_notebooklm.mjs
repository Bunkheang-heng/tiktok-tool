import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

async function testNotebookLm() {
  const profileDir = path.resolve(
    process.env.USERPROFILE || 'C:\\Users\\bunkh',
    '.ben10fx',
    'browser-profile'
  );
  
  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
  }

  console.log('Testing Playwright persistent Chrome launch...');
  console.log('Profile dir:', profileDir);

  const context = await chromium.launchPersistentContext(profileDir, {
    channel: 'chrome',
    headless: false,
    viewport: { width: 1280, height: 860 },
    acceptDownloads: true
  });

  const page = await context.newPage();
  const url = 'https://notebook.google.com/notebook/2419265c-bfcb-4dfa-9ee8-52ad6926b5fa';
  console.log('Navigating to:', url);

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Current URL:', page.url());
    console.log('Page Title:', await page.title());

    // Check if on login page
    if (page.url().includes('accounts.google.com') || page.url().includes('signin')) {
      console.log('User is redirected to Google sign-in.');
    } else {
      console.log('Successfully opened notebook!');
    }

    await page.waitForTimeout(5000);
  } finally {
    await context.close();
  }
}

testNotebookLm().catch(console.error);
