import puppeteer from 'puppeteer';
import debug from 'debug';
import { MapEntity } from 'robodux';
import util from 'util';
import fs from 'fs';

import { deserializeList, processListItems } from '@app/lists';
import { processComments } from '@app/comments';
import { ListClient, ListItemClient, ListCommentClient } from '@app/types';

import { fetchListDetailData } from './lists';
import { FnResult } from '../types';
import { redisGet, redisSet } from '../redis';

const readFile = util.promisify(fs.readFile);
const log = debug('server:services:generate-image');

export interface TemplateData {
  list: ListClient;
  items: MapEntity<ListItemClient>;
  itemIds: string[];
  comments: MapEntity<ListCommentClient>;
}

interface ImageCache {
  image: string;
  expiresAt: string;
}

interface ImageResult {
  image: Buffer;
  expiresAt: string;
}

function getKey(username: string, listname: string) {
  return `${username}/${listname}`;
}

async function processImage(data: TemplateData) {
  const key = getKey(data.list.username, data.list.urlName);
  const imageData = await generateImage(data);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const imageCache = {
    expiresAt: tomorrow.toISOString(),
    image: imageData.toString('base64'),
  };

  redisSet(key, JSON.stringify(imageCache));

  return {
    expiresAt: imageCache.expiresAt,
    image: imageData as Buffer,
  };
}

export async function generateListDetailImage(
  username: string,
  listname: string,
): Promise<FnResult<ImageResult>> {
  const result = await fetchListDetailData(username, listname);
  if (!result.success) {
    return {
      success: false,
      data: {
        status: 404,
        message: 'list not found',
      },
    };
  }

  const list = deserializeList(result.data.list);
  const { items, itemIds } = processListItems(result.data.items);
  const comments = processComments(result.data.comments);
  const data = { list, itemIds, items, comments };
  const key = getKey(username, listname);
  const cache = await redisGet(key);
  if (cache) {
    const jso: ImageCache = JSON.parse(cache);
    if (new Date(jso.expiresAt) < new Date()) {
      log(`${key} has expired, processing new image`);
      const imageCache = await processImage(data);
      return { success: true, data: imageCache };
    }

    log(`${key} cache found, using it`);
    const buff = Buffer.from(jso.image, 'base64');
    return {
      success: true,
      data: {
        expiresAt: jso.expiresAt,
        image: buff,
      },
    };
  }

  log(`${key} no cache found, processing new image`);
  const imageCache = await processImage(data);
  return { success: true, data: imageCache };
}

async function compileTemplate({
  list,
  itemIds,
  comments,
}: TemplateData): Promise<string> {
  /* const itemList = itemIds
    .map((id) => items[id])
    .filter(excludesFalse)
    .map((item) => `<li>${item.text}</li>`)
    .slice(0, 3)
    .join(''); */
  const regular = await readFile('./public/OpenSans-Regular.ttf', {
    encoding: 'base64',
  });
  const bold = await readFile('./public/OpenSans-SemiBold.ttf', {
    encoding: 'base64',
  });

  return `<!DOCTYPE html><html>
  <head>
    <style>
      @font-face {
        font-family: OpenSans;
        src: url(data:font/truetype;charset=utf-8;base64,${regular});
      }
      @font-face {
        font-family: OpenSans;
        font-weight: bold;
        src: url(data:font/truetype;charset=utf-8;base64,${bold});
      }

      body {
        font-family: OpenSans;
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
        margin-left: 70px;
        margin-right: 70px;
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
        font-size: 70px;
        color: #3A3B3C;
      }

      .desc {
        font-size: 30px;
        margin: 30px 0;
        color: #666;
      }

      .strong {
        font-weight: bold;
      }

      .bottom {
        position: fixed;
        bottom: -10px;
        left: 0;
        width: 1200px;
      }

      .footer {
        margin-left: 70px;
        margin-right: 70px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 30px;
      }

      .brand {
        height: 100%;
      }

      .metrics {
        width: 500px;
        margin-bottom: 30px;
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
            <div>${itemIds.length}</div>
            <div>items</div>
          </div>
          <div>
            <div>${list.stars}</div>
            <div>stars</div>
          </div>
          <div>
            <div>${Object.values(comments).length}</div>
            <div>comments</div>
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

async function generateImage(data: TemplateData) {
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--font-render-hinting=none',
      '--force-color-profile=srgb',
    ],
  });

  // Render some HTML from the relevant template
  const html = await compileTemplate(data);

  // Create a new page
  const page = await browser.newPage();

  // Set the content to our rendered HTML
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.evaluateHandle('document.fonts.ready');

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
