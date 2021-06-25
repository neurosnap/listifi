import debug from 'debug';
import { MapEntity } from 'robodux';
import { createCanvas, loadImage, registerFont } from 'canvas';

import { deserializeList, processListItems } from '@app/lists';
import { processComments } from '@app/comments';
import { ListClient, ListCommentClient } from '@app/types';

import { fetchListDetailData } from './lists';
import { FnResult } from '../types';

const log = debug('server:services:generate-image');

export interface TemplateData {
  list: ListClient;
  itemIds: string[];
  comments: MapEntity<ListCommentClient>;
}

export async function generateListDetailImage(
  username: string,
  listname: string,
): Promise<FnResult<Buffer>> {
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
  const { itemIds } = processListItems(result.data.items);
  const comments = processComments(result.data.comments);

  log(`generating image for ${username}/${listname}`);
  const width = 1200;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  registerFont('./public/OpenSans-Regular.ttf', {
    family: 'opensans',
  });
  registerFont('./public/OpenSans-SemiBold.ttf', {
    family: 'opensans',
    weight: 'bold',
  });

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, height);
  const marginX = 70;

  ctx.font = 'bold 70px opensans';
  ctx.fillStyle = '#3A3B3C';
  ctx.fillText(list.name, marginX, 150);

  ctx.font = 'normal normal 30px opensans';
  ctx.fillStyle = '#666';
  ctx.fillText(list.description, marginX, 150 + 50 + 30);

  ctx.fillStyle = '#3A3B3C';
  const metricsY = 500;
  const metricsPad = 180;
  ctx.fillText(`${itemIds.length}`, marginX, metricsY);
  ctx.fillText('items', marginX, metricsY + 35);

  ctx.fillText(`${list.stars}`, marginX + metricsPad, metricsY);
  ctx.fillText('stars', marginX + metricsPad, metricsY + 35);

  ctx.fillText(
    `${Object.keys(comments).length}`,
    marginX + metricsPad * 2,
    metricsY,
  );
  ctx.fillText('comments', marginX + metricsPad * 2, metricsY + 35);

  const text = 'listifi.app';
  const textWidth = ctx.measureText(text).width;
  ctx.fillText('listifi.app', 1200 - marginX - textWidth, metricsY + 20);

  const rainbow = await loadImage('./public/rainbow.png');
  ctx.drawImage(rainbow, 0, 580, 1200, 10);

  const buffer = canvas.toBuffer('image/png');

  return {
    success: true,
    data: buffer,
  };
}
