import { USER_PREFIX } from '@app/routes';

export const urlRe = new RegExp(
  /(http|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/gm,
);

interface TextPart {
  type: 'link' | 'text' | 'link-list';
  text: string;
}

export const textParser = (
  text: string,
  apiUrl = `https://listifi.app${USER_PREFIX}/`,
): TextPart[] => {
  const parsed: TextPart[] = [];

  const parseWord = (word: string, whitespace: string) => {
    const last = parsed.length - 1;
    const lastType = parsed[last] ? parsed[last].type : '';

    if (word.startsWith(apiUrl)) {
      parsed.push({
        type: 'link-list',
        text: word.replace(apiUrl, '#'),
      });
      if (whitespace) {
        parsed.push({
          type: 'text',
          text: whitespace,
        });
      }

      return;
    }

    if (word.match(urlRe)) {
      parsed.push({
        type: 'link',
        text: word,
      });
      if (whitespace) {
        parsed.push({
          type: 'text',
          text: whitespace,
        });
      }

      return;
    }

    if (lastType === 'text') {
      parsed[last].text += `${word}${whitespace}`;
    } else {
      parsed.push({
        type: 'text',
        text: `${word}${whitespace}`,
      });
    }
  };

  let curWord = '';
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char.match(/\s/)) {
      parseWord(curWord, char);
      curWord = '';
      continue;
    }

    curWord += char;
  }

  if (curWord) {
    parseWord(curWord, '');
  }

  return parsed;
};
