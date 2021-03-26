import { textParser } from '.';

describe('textParser', () => {
  it('should grab all links from text', () => {
    const data =
      'here are some links: https://www.google.com and http://listifi.app/u/wow/very-nice now done.';
    expect(textParser(data)).toEqual([
      { type: 'text', text: 'here are some links: ' },
      { type: 'link', text: 'https://www.google.com' },
      { type: 'text', text: ' and ' },
      { type: 'link', text: 'http://listifi.app/u/wow/very-nice' },
      { type: 'text', text: ' now done.' },
    ]);
  });

  it('should parse text with one link', () => {
    const data = 'https://www.google.com';
    expect(textParser(data)).toEqual([
      { type: 'link', text: 'https://www.google.com' },
    ]);
  });

  it('should parse a link a leading space', () => {
    const data = ' https://www.google.com does this work';
    expect(textParser(data)).toEqual([
      { type: 'text', text: ' ' },
      { type: 'link', text: 'https://www.google.com' },
      { type: 'text', text: ' does this work' },
    ]);
  });

  it('should parse without any links', () => {
    const data = 'here is a great line';
    expect(textParser(data)).toEqual([
      { type: 'text', text: 'here is a great line' },
    ]);
  });

  it('should convert a listifi list as url to link list', () => {
    const data =
      'here is a list https://listifi.app/u/erock/killing-in-the-name wow';
    expect(textParser(data)).toEqual([
      { type: 'text', text: 'here is a list ' },
      { type: 'link-list', text: '#erock/killing-in-the-name' },
      { type: 'text', text: ' wow' },
    ]);
  });

  it('should preserve newline links', () => {
    const data = ' https://www.google.com does\n this work';
    expect(textParser(data)).toEqual([
      { type: 'text', text: ' ' },
      { type: 'link', text: 'https://www.google.com' },
      { type: 'text', text: ' does\n this work' },
    ]);
  });

  it('should preserve multiple newlines', () => {
    const data = `my favorite site is

http://imdb.com -- what's yours?

heh`;

    expect(textParser(data)).toEqual([
      { type: 'text', text: 'my favorite site is\n\n' },
      { type: 'link', text: 'http://imdb.com' },
      { type: 'text', text: " -- what's yours?\n\nheh" },
    ]);
  });
});
