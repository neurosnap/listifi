import {
  uniqueNamesGenerator,
  adjectives,
  names,
  Config,
} from 'unique-names-generator';

const config: Config = {
  dictionaries: [adjectives, names],
  separator: '-',
  length: 2,
  style: 'lowerCase',
};

export const generateUsername = () => uniqueNamesGenerator(config);
