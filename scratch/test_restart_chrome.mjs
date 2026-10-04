import { chromium } from 'playwright';
import { execSync, spawn } from 'node:child_process';

async function testAutoRestartAndConnect() {
  console.log('Checking if port 9222 is open...');
  let portOpen = false;
  try {
    const res = await fetch('http://localhost:9222/json/version', { signal: AbortSignal.timeout(1000) });
    portOpen = res.ok;
  } catch {}

  if (!portOpen) {
    console.log('Port 9222 is closed. Restarting Chrome with automation port...');
    try {
      execSync('powershell -Command "Stop-Process -Name chrome -Force -ErrorAction SilentlyContinue"');
    } catch {}

    await new Promise((r) => setTimeout(r, 1200));

    console.log('Launching Chrome with Default profile and port 9222...');
    spawn(
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      ['--profile-directory=Default', '--remote-debugging-port=9222', '--restore-last-session'],
      { detached: true, stdio: 'ignore' }
    ).unref();

    console.log('Waiting for port 9222 to become available...');
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 500));
      try {
        const res = await fetch('http://localhost:9222/json/version', { signal: AbortSignal.timeout(1000) });
        if (res.ok) {
          portOpen = true;
          console.log(`Port 9222 is ready after ${(i + 1) * 0.5}s!`);
          break;
        }
      } catch {}
    }
  }

  if (!portOpen) {
    throw new Error('Failed to open Chrome with port 9222');
  }

  console.log('Connecting Playwright to Chrome via CDP...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const contexts = browser.contexts();
  const context = contexts[0] || (await browser.newContext());

  console.log('Opening NotebookLM in your real Chrome browser...');
  const page = await context.newPage();
  const url = 'https://notebook.google.com/notebook/2419265c-bfcb-4dfa-9ee8-52ad6926b5fa';
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

  await page.waitForTimeout(3000);
  console.log('Current URL in real Chrome:', page.url());
  console.log('Page Title in real Chrome:', await page.title());

  if (page.url().includes('accounts.google.com')) {
    console.log('⚠️ Still on accounts.google.com');
  } else {
    console.log('🎉 SUCCESS! Real Chrome opened directly to NotebookLM with active login!');
  }

  await page.waitForTimeout(4000);
  await page.close();
}

testAutoRestartAndConnect().catch(console.error);
