import { MetaData, OGData } from '@app/types';

export const defaultOGData = (og: Partial<OGData> = {}): OGData => {
  return {
    url: '',
    display: true,
    'og:type': '',
    'og:title': '',
    'og:description': '',
    'og:image': '',
    'twitter:title': '',
    'twitter:image': '',
    'twitter:description': '',
    'twitter:site': '',
    'twitter:creator': '',
    ...og,
  };
};

export const defaultMetadata = (m: Partial<MetaData> = {}): MetaData => {
  return {
    ogData: defaultOGData(),
    ...m,
  };
};
