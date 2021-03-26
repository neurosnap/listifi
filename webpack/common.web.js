const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { merge } = require('webpack-merge');
const common = require('./common');
const ROOT = path.resolve(__dirname, '..');

const entry = path.join(ROOT, 'src', 'web', 'client.tsx');
console.log(`building bundle with entry point ${entry}`);

module.exports = () => {
  return merge(common, {
    entry,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: ['@babel/env', '@babel/typescript', '@babel/react'],
              plugins: [
                '@babel/proposal-class-properties',
                '@babel/proposal-object-rest-spread',
                // Polyfills the runtime needed for async/await, generators, and friends
                // https://babeljs.io/docs/en/babel-plugin-transform-runtime
                [
                  require('@babel/plugin-transform-runtime').default,
                  {
                    corejs: false,
                    helpers: false,
                    // By default, babel assumes babel/runtime version 7.0.0-beta.0,
                    // explicitly resolving to match the provided helper functions.
                    // https://github.com/babel/babel/issues/10261
                    version: require('@babel/runtime/package.json').version,
                    regenerator: true,
                    // https://babeljs.io/docs/en/babel-plugin-transform-runtime#useesmodules
                    useESModules: true,
                  },
                ],
              ],
            },
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        filename: './index.html',
      }),
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
    },
  });
};
