const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./common');
const ROOT = path.resolve(__dirname, '..');
const nodeExternals = require('webpack-node-externals');

const entry = path.join(ROOT, 'src', 'server', 'index.ts');
console.log(`building bundle with entry point ${entry}`);

module.exports = () => {
  return merge(common, {
    entry,
    target: 'node',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                [
                  '@babel/env',
                  {
                    targets: {
                      node: 'current',
                    },
                  },
                ],
                '@babel/typescript',
                '@babel/react',
              ],
              plugins: [
                '@babel/proposal-class-properties',
                '@babel/proposal-object-rest-spread',
              ],
            },
          },
        },
      ],
    },
    externals: [nodeExternals()],
    node: {
      global: false,
      __filename: false,
      __dirname: false,
    },
  });
};
