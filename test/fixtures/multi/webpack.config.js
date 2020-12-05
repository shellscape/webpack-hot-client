const { resolve } = require('path');

const webpack = require('webpack');

module.exports = [
  {
    resolve: {
      alias: {
        'webpack-hot-client/client': resolve(__dirname, '../../../lib/client')
      }
    },
    context: __dirname,
    entry: [resolve(__dirname, './client.js')],
    mode: 'development',
    output: {
      filename: './output.client.js',
      path: resolve(__dirname)
    },
    plugins: [new webpack.HotModuleReplacementPlugin()]
  },
  {
    resolve: {
      alias: {
        'webpack-hot-client/client': resolve(__dirname, '../../../lib/client')
      }
    },
    context: __dirname,
    entry: [resolve(__dirname, './server.js')],
    mode: 'development',
    output: {
      filename: './output.server.js',
      path: resolve(__dirname)
    },
    plugins: [new webpack.HotModuleReplacementPlugin()]
  }
];
