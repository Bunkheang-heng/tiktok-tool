import { chromium } from 'playwright';

async function testDefaultProfile() {
  const chromeUserData = 'C:\\Users\\bunkh\\AppData\\Local\\Google\\Chrome\\User Data';
  console.log('Testing launch with user data dir:', chromeUserData);
  try {
    const context = await chromium.launchPersistentContext(chromeUserData, {
      channel: 'chrome',
      headless: false,
      args: ['--profile-directory=Default']
    });
    console.log('Context launched successfully!');
    const page = await context.newPage();
    await page.goto('https://notebook.google.com/notebook/2419265c-bfcb-4dfa-9ee8-52ad6926b5fa');
    console.log('Page URL:', page.url());
    await page.waitForTimeout(5000);
    await context.close();
  } catch (err) {
    console.error('Failed to launch with default profile:', err.message);
  }
}

testDefaultProfile();
