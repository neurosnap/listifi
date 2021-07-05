const path = require('path');
const { merge } = require('webpack-merge');
const NodemonPlugin = require('nodemon-webpack-plugin');

const commonServer = require('./common.server');

const ROOT = path.resolve(__dirname, '..');

process.on('unhandledRejection', (err) => {
  throw err;
});

module.exports = () => {
  const config = merge(commonServer(), {
    mode: 'development',
    // webpack documentation indicated this was what we most likely want to use
    // for development: https://webpack.js.org/configuration/devtool/#development
    devtool: 'eval-cheap-module-source-map',
    plugins: [new NodemonPlugin()],
    output: {
      filename: '[name].js',
      path: path.join(ROOT, 'dist'),
      publicPath: '/',
    },
  });

  console.log(config);
  return config;
};
