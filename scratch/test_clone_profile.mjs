import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

async function testProfileClone() {
  const sourceBase = 'C:\\Users\\bunkh\\AppData\\Local\\Google\\Chrome\\User Data';
  const targetBase = 'C:\\Users\\bunkh\\.ben10fx\\cloned-profile';

  console.log('Copying Local State and essential session files from Chrome Default profile...');
  if (!fs.existsSync(targetBase)) {
    fs.mkdirSync(targetBase, { recursive: true });
  }

  // Copy Local State
  const localStateSrc = path.join(sourceBase, 'Local State');
  const localStateDest = path.join(targetBase, 'Local State');
  if (fs.existsSync(localStateSrc)) {
    fs.copyFileSync(localStateSrc, localStateDest);
    console.log('Copied Local State');
  }

  // Copy Default essential dirs: Network, Sessions, Storage
  const defaultTarget = path.join(targetBase, 'Default');
  if (!fs.existsSync(defaultTarget)) {
    fs.mkdirSync(defaultTarget, { recursive: true });
  }

  const filesToCopy = [
    'Preferences',
    'Secure Preferences',
    'Login Data',
    'Web Data'
  ];

  for (const f of filesToCopy) {
    const src = path.join(sourceBase, 'Default', f);
    const dest = path.join(defaultTarget, f);
    if (fs.existsSync(src)) {
      try {
        fs.copyFileSync(src, dest);
        console.log(`Copied ${f}`);
      } catch (e) {
        console.log(`Could not copy ${f}:`, e.message);
      }
    }
  }

  // Copy Network folder (cookies)
  const networkSrc = path.join(sourceBase, 'Default', 'Network');
  const networkDest = path.join(defaultTarget, 'Network');
  if (fs.existsSync(networkSrc)) {
    if (!fs.existsSync(networkDest)) fs.mkdirSync(networkDest, { recursive: true });
    const cookieFile = path.join(networkSrc, 'Cookies');
    if (fs.existsSync(cookieFile)) {
      try {
        fs.copyFileSync(cookieFile, path.join(networkDest, 'Cookies'));
        console.log('Copied Network/Cookies');
      } catch (e) {
        console.log('Could not copy Cookies:', e.message);
      }
    }
  }

  console.log('Testing launch with cloned profile...');
  const context = await chromium.launchPersistentContext(targetBase, {
    channel: 'chrome',
    headless: false,
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();
  console.log('Navigating to NotebookLM...');
  await page.goto('https://notebook.google.com/notebook/2419265c-bfcb-4dfa-9ee8-52ad6926b5fa', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });

  await page.waitForTimeout(5000);
  console.log('Current URL:', page.url());
  console.log('Page Title:', await page.title());

  await context.close();
}

testProfileClone().catch(console.error);
