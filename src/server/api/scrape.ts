import Router from '@koa/router';
import puppeteer from 'puppeteer';

import { getBody, requireBody, sendBody } from '../body';

export const scrapeRouter = new Router({ prefix: '/api/scrape' });

async function getContent(url: string) {
  const styles: string[] = [];
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    page.on('response', async (response) => {
      if (response.request().resourceType() === 'stylesheet') {
        const css = await response.text();
        styles.push(css);
      }
    });

    await page.goto(url, { waitUntil: 'networkidle0' });
    const html = await page.evaluate(() => document.documentElement.outerHTML);

    await browser.close();
    return { html, styles, error: '' };
  } catch (err) {
    console.error(err);
    return { html: '', styles, error: err.message };
  }
}

scrapeRouter.post('/', async (ctx) => {
  requireBody(ctx, ['clientId', 'url']);
  const body = getBody<{ clientId: string; url: string }>(ctx);
  const resp = await getContent(body.url);
  sendBody<{ html: string; styles: string[] }>(ctx, resp);
});
