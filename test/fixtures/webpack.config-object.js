const path = require('path');

const webpack = require('webpack');
const TimeFixPlugin = require('time-fix-plugin');

module.exports = {
  resolve: {
    alias: {
      'webpack-hot-client/client': path.resolve(__dirname, '../../client')
    }
  },
  context: __dirname,
  devtool: 'source-map',
  entry: {
    main: ['./app.js']
  },
  output: {
    filename: './output.js',
    path: path.resolve(__dirname)
  },
  optimization: {
    moduleIds: 'named'
  },
  plugins: [new webpack.HotModuleReplacementPlugin(), new TimeFixPlugin()]
};
