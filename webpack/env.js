const dotenv = require('dotenv');
const path = require('path');

defaultPath = path.resolve(process.cwd(), '.env');

module.exports = (path = defaultPath) => {
  // https://github.com/motdotla/dotenv#what-happens-to-environment-variables-that-were-already-set
  const envConfig = dotenv.config({ path });
  const env = envConfig.error ? {} : envConfig.parsed;
  // https://medium.com/@trekinbami/using-environment-variables-in-react-6b0a99d83cf5
  const envKeys = Object.keys(env).reduce((prev, next) => {
    prev[next] = JSON.stringify(env[next]);
    return prev;
  }, {});
  // console.log(envKeys);
  return envKeys;
};
