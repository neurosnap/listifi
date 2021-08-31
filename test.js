const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({});
    const page = await browser.newPage();
    await page.goto('https://new.ycombinator.com');
    await page.screenshot({ path: 'example.png' });

    await browser.close();
  } catch (err) {
    console.error(err);
  }
})();
