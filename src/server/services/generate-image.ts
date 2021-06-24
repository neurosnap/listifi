import puppeteer from 'puppeteer';
import { MapEntity } from 'robodux';
// import util from 'util';
// import fs from 'fs';

import { ListClient, ListItemClient, ListCommentClient } from '@app/types';

// const writeFile = util.promisify(fs.writeFile);

interface TemplateData {
  list: ListClient;
  items: MapEntity<ListItemClient>;
  itemIds: string[];
  comments: MapEntity<ListCommentClient>;
}

function compileTemplate({ list, itemIds, comments }: TemplateData): string {
  /* const itemList = itemIds
    .map((id) => items[id])
    .filter(excludesFalse)
    .map((item) => `<li>${item.text}</li>`)
    .slice(0, 3)
    .join(''); */
  return `<!DOCTYPE html><html>
  <head>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
    Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
        width: 1200px;
        height: 600px;
        padding: 0;
        margin: 0;
      }

      ul {
        list-style-type: circle;
      }

      li {
        margin: 10px 0;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .top {
        margin-top: 100px;
        margin-left: 50px;
      }

      .list {
        width: 600px;
      }

      .items {
        max-width: 400px;
        flex: 1;
        font-size: 30px;
      }

      .header {
        font-size: 60px;
      }

      .desc {
        font-size: 40px;
        margin: 40px 0;
        color: #666;
      }

      .strong {
        font-weight: bold;
      }

      .bottom {
        position: fixed;
        bottom: -20px;
        left: 0;
        width: 1200px;
      }

      .footer {
        margin-left: 50px;
        margin-right: 50px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 30px;
      }

      .brand {
        width: 200px;
        height: 100%;
      }

      .metrics {
        width: 450px;
        display: flex;
        justify-content: space-between;
      }

      .ruler {
        width: 100%;
        height: 20px;
        background: #FFFFFF;
            background-repeat: repeat;
            background-image: none;
            background-size: auto;
        margin-top: 1rem;
        margin-bottom: 1rem;
        opacity: 0.7;
        background-image: repeating-linear-gradient(to right, #c4e17f 0px, #c4e17f 50px, #f7fdca 50px, #f7fdca 100px, #fad071 100px, #fad071 150px, #f0766b 150px, #f0766b 200px, #db9dbe 200px, #db9dbe 250px, #c49cdf 250px, #c49cdf 300px, #6599e2 300px, #6599e2 350px, #61c2e4 350px, #61c2e4 400px);
        background-size: 100% 10px;
        background-repeat: no-repeat;
      }
    </style>
  </head>
  <body>
    <div class="top">
      <div class="header">
        <div class="strong">
          ${list.name}
        </div>
      </div>
      <div class="desc">
        ${list.description}
      </div>
    </div>
    <div class="bottom">
      <div class="footer">
        <div class="metrics">
          <div>
            <div>${list.stars}</div>
            <div>stars</div>
          </div>
          <div>
            <div>${Object.values(comments).length}</div>
            <div>comments</div>
          </div>
          <div>
            <div>${itemIds.length}</div>
            <div>items</div>
          </div>
        </div>
        <div class="brand">
          listifi.app
        </div>
      </div>
      <div class="ruler"></div>
    </div>
  </body>
</html>`;
}

export async function generateImage(data: TemplateData) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });

  console.log(data);
  // Render some HTML from the relevant template
  const html = compileTemplate(data);

  // Create a new page
  const page = await browser.newPage();

  // Set the content to our rendered HTML
  await page.setContent(html, { waitUntil: 'domcontentloaded' });

  const screenshotBuffer = await page.screenshot({
    fullPage: false,
    type: 'png',
    clip: {
      width: 1200,
      height: 600,
      x: 0,
      y: 0,
    },
  });

  if (!screenshotBuffer) {
    return '';
  }

  await page.close();

  // await writeFile(fname, screenshotBuffer.toString());

  return screenshotBuffer;
}
