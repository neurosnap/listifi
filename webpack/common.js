const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.json'],
    plugins: [new TsconfigPathsPlugin()],
  },
};
