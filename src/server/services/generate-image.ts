import puppeteer from 'puppeteer';
// import util from 'util';
// import fs from 'fs';

import { ListClient } from '@app/types';

// const writeFile = util.promisify(fs.writeFile);

interface TemplateData {
  list: ListClient;
}

function compileTemplate(template: string, templateData: TemplateData): string {
  let html = template;
  Object.keys(templateData.list).forEach((key) => {
    html = html.replace(`{{${key}}}`, (templateData.list as any)[key]);
  });
  return html;
}

const template = `<html>
  <body>
    {{name}}
  </body>
</html>`;

export async function generateImage(data: TemplateData) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });

  // Render some HTML from the relevant template
  const html = compileTemplate(template, data);

  // Create a new page
  const page = await browser.newPage();

  // Set the content to our rendered HTML
  await page.setContent(html, { waitUntil: 'domcontentloaded' });

  const screenshotBuffer = await page.screenshot({
    fullPage: false,
    type: 'png',
  });

  if (!screenshotBuffer) {
    return '';
  }

  await page.close();

  // await writeFile(fname, screenshotBuffer.toString());

  return screenshotBuffer;
}
