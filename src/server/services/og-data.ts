// import fetch from 'node-fetch';
// import cheerio from 'cheerio';

import { defaultOGData } from '@app/metadata';
import { urlRe } from '@app/text-parser';
import { OGData } from '@app/types';

export async function extractOgData(text: string): Promise<OGData | null> {
  const ex = urlRe.exec(text);
  if (!ex) {
    return null;
  }

  const url = ex[0];
  const data = defaultOGData({ url });
  return data;

  /* let html = '';
  try {
    const res = await fetch(url);
    html = await res.text();
  } catch (err) {
    return null;
  }

  const $ = cheerio.load(html);
  const meta = $('meta');
  const keys = Object.keys(meta);
  Object.keys(data).forEach((s) => {
    keys.forEach((key: string) => {
      const m = meta[key as any] as any;
      if (m.attribs && m.attribs.property && m.attribs.property === s) {
        (data as any)[s] = m.attribs.content;
      }
    });
  });
  return data; */
}
