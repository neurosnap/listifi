import debug from 'debug';
import { MapEntity } from 'robodux';
import {
  createCanvas,
  loadImage,
  registerFont,
  NodeCanvasRenderingContext2D,
} from 'canvas';

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

function wrapLines(
  ctx: NodeCanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const lines = [];
  let result = '';
  let i = 0;
  let j = 0;
  let width = 0;

  while (text.length) {
    for (
      i = text.length;
      ctx.measureText(text.substr(0, i)).width > maxWidth;
      i--
    );

    result = text.substr(0, i);

    if (i !== text.length)
      for (
        j = 0;
        result.indexOf(' ', j) !== -1;
        j = result.indexOf(' ', j) + 1
      );

    lines.push(result.substr(0, j || result.length));
    width = Math.max(width, ctx.measureText(lines[lines.length - 1]).width);
    text = text.substr(lines[lines.length - 1].length, text.length);
  }

  return lines;
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
  const widthLength = width - marginX * 2;

  const titleFontSize = 70;
  ctx.font = `bold ${titleFontSize}px opensans`;
  ctx.fillStyle = '#3A3B3C';
  const titleText = list.name;
  const lines = wrapLines(ctx, titleText, widthLength).slice(0, 2);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    ctx.fillText(line, marginX, 150 + titleFontSize * i);
  }

  const subFontSize = 30;
  ctx.font = `normal normal ${subFontSize}px opensans`;
  ctx.fillStyle = '#666';
  const descLines = wrapLines(ctx, list.description, widthLength).slice(0, 2);
  for (let i = 0; i < descLines.length; i += 1) {
    const line = descLines[i];
    ctx.fillText(
      line,
      marginX,
      150 + lines.length * titleFontSize + (subFontSize + 10) * i,
    );
  }

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
