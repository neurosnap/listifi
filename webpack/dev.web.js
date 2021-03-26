const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const envKeys = require('./env');
const commonWeb = require('./common.web');

const ROOT = path.resolve(__dirname, '..');

process.on('unhandledRejection', (err) => {
  throw err;
});

module.exports = () => {
  const processEnv = {
    ...envKeys(),
    NODE_ENV: JSON.stringify('development'),
  };
  console.log(processEnv);

  const config = merge(commonWeb(), {
    mode: 'development',
    // webpack documentation indicated this was what we most likely want to use
    // for development: https://webpack.js.org/configuration/devtool/#development
    devtool: 'eval-cheap-module-source-map',
    plugins: [
      new webpack.DefinePlugin({
        'process.env': processEnv,
      }),
    ],
    output: {
      filename: 'static/[name].js',
      path: path.join(ROOT, 'public'),
      publicPath: '/',
    },
  });

  console.log(config);
  return config;
};
