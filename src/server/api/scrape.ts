import Router from '@koa/router';
import puppeteer from 'puppeteer';

import { getBody, requireBody, sendBody } from '../body';

export const scrapeRouter = new Router({ prefix: '/api/scrape' });

async function getContent(url: string) {
  const styles: string[] = [];
  try {
    const browser = await puppeteer.launch({
      headless: true,
      // pipe: true, <-- delete this property
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage', // <-- add this one
      ],
    });
    const page = await browser.newPage();
    /* page.on('response', async (response) => {
      if (response.request().resourceType() === 'stylesheet') {
        const css = await response.text();
        styles.push(css);
      }
    }); */

    console.log(url);
    await page.goto(url, { waitUntil: 'networkidle0' });
    console.log('GOTO');
    const html = await page.evaluate(() => document.documentElement.outerHTML);
    console.log(html);

    await browser.close();
    return { html, styles };
  } catch (err) {
    console.error(err);
    return { html: '', styles };
  }
}

scrapeRouter.post('/', async (ctx) => {
  requireBody(ctx, ['clientId', 'url']);
  const body = getBody<{ clientId: string; url: string }>(ctx);
  const resp = await getContent(body.url);
  sendBody<{ html: string; styles: string[] }>(ctx, resp);
});
