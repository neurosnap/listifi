import puppeteer from 'puppeteer';

interface ListMap {
  [key: string]: Set<string>;
}

export async function extractListsFromSite(url: string) {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    const lists = await page.evaluate(() => {
      const containsAlphaNum = (str: string): Boolean => {
        const reg = new RegExp(/[a-z0-9]+/i);
        return Boolean(str.match(reg));
      };
      const li: ListMap = {};
      const traverse = (el: HTMLElement | null, id: string) => {
        if (!el) return;
        const prefix = el.className ? '.' : '';
        const classStr =
          typeof el.className === 'string'
            ? `${prefix}${el.className.replace(' ', '.')}`
            : '';
        const nextId = `${id}>${el.tagName}`;
        const nextClassId = `${nextId}${classStr}`;

        const addToList = (curEl: HTMLElement) => {
          const text = curEl.textContent || '';
          if (!containsAlphaNum(text)) {
            return;
          }

          if (!li[nextId]) {
            li[nextId] = new Set();
          }

          text
            .split('\n')
            .filter((t) => Boolean(t.trim()))
            .forEach((item) => li[nextId].add(item));

          if (!li[nextClassId]) {
            li[nextClassId] = new Set();
          }

          text
            .split('\n')
            .filter((t) => Boolean(t.trim()))
            .forEach((item) => li[nextClassId].add(item));
        };

        if (!el.hasChildNodes()) {
          if (el.nodeType === Node.TEXT_NODE) {
            addToList(el);
          }
          return;
        }

        el.childNodes.forEach((curEl) => {
          if (curEl.nodeType === Node.TEXT_NODE) {
            addToList(curEl as HTMLElement);
            return;
          }

          traverse(curEl as HTMLElement, nextId);
        });
      };

      document.querySelectorAll('script, noscript').forEach((el) => {
        el.remove();
      });
      traverse(document.querySelector('body'), '');

      return Object.values(li)
        .filter((list) => list.size > 1)
        .map((list) => Array.from(list));
    });
    const html = await page.evaluate(() => {
      document.querySelectorAll('script, noscript').forEach((el) => {
        el.remove();
      });
      return document.documentElement.outerHTML;
    });

    await browser.close();

    return { lists, error: '', html };
  } catch (err) {
    console.error(err);
    return { lists: [], error: err.message, html: '' };
  }
}

/* export async function example() {
  const sites = [
    ['./data/hn.txt', 'https://news.ycombinator.com'],
    ['./data/reddit.txt', 'https://reddit.com'],
    ['./data/twitter-profile.txt', 'https://twitter.com/neurosnap'],
  ];
  for (let i = 0; i < sites.length; i += 1) {
    const [fname, url] = sites[i];
    const results = await extractListsFromSite(url);
    await writeFile(fname, results.text);
  }
}

example().then(console.log).catch(console.error); */
