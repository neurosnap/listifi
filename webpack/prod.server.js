const webpack = require('webpack');
const { merge } = require('webpack-merge');
const path = require('path');

const commonServer = require('./common.server');

const ROOT = path.resolve(__dirname, '..');

module.exports = () => {
  return merge(commonServer(), {
    mode: 'production',
    devtool: 'source-map',
    output: {
      filename: '[name].js',
      path: path.join(ROOT, 'dist'),
      publicPath: '/',
    },
    optimization: {
      minimize: false,
    },
  });
};
