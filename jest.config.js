process.env.TZ = 'UTC';

module.exports = {
  testRunner: 'jest-circus/runner',
  setupFilesAfterEnv: ['./tests.js'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '@app/(.*)': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: ['/node_modules/(?!@babel).+\\.js$'],
  testEnvironment: 'node',
};
