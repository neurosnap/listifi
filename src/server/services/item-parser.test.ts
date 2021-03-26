import { textToItems } from './item-parser';

describe('textToItems', () => {
  it('should convert text to array of items', () => {
    const items = textToItems(`one
  two
three

four


`);
    expect(items).toEqual(['one', 'two', 'three', 'four']);
  });

  describe('when using hyphens', () => {
    it('should convert the hypens to array of items', () => {
      const items = textToItems(`- one
one again
      - two
      - three
      `);
      expect(items).toEqual(['one one again', 'two', 'three']);
    });
  });
});
