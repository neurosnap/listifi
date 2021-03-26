const webpack = require('webpack');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

const envKeys = require('./env');
const commonWeb = require('./common.web');

const ROOT = path.resolve(__dirname, '..');

module.exports = () => {
  const envPath = path.resolve(process.cwd(), '.env.prod');
  const processEnv = {
    ...envKeys(envPath),
    NODE_ENV: JSON.stringify('production'),
  };
  console.log(processEnv);

  const plugins = [
    new webpack.DefinePlugin({
      'process.env': processEnv,
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: false,
      __DEVTOOLS__: false,
      __REACT_PERF__: false,
    }),
  ];

  return merge(commonWeb(), {
    mode: 'production',
    devtool: 'source-map',
    output: {
      filename: 'static/[name].[contenthash:6].js',
      path: path.join(ROOT, 'public'),
      publicPath: '/',
    },
    plugins,
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
  });
};
