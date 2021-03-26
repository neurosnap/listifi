import { formatUrlName } from '.';

describe('formatUrlName', () => {
  it('should handle umlaut characters by removing them', () => {
    expect(formatUrlName('Städer')).toEqual('stder');
  });

  it('should replace spaces with hyphens', () => {
    expect(formatUrlName('A great list!')).toEqual('a-great-list');
  });

  it('should replace underscores with hyphens', () => {
    expect(formatUrlName('MY_GREAT_LIST')).toEqual('my-great-list');
  });

  it('should remove trailing hyphens', () => {
    expect(formatUrlName('--something great__')).toEqual('something-great');
  });
});
