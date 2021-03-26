export function textToItems(text = '') {
  if (!text) return [];
  const txt = text.trim();

  if (txt.startsWith('- ')) {
    const items = txt
      .split('- ')
      .map((item) => item.trim())
      .map((item) => item.replace(/\r?\n/, ' '))
      .filter(Boolean);
    return items;
  }

  const items = txt
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  return items;
}
