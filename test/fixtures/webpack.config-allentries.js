const path = require('path');

const TimeFixPlugin = require('time-fix-plugin');

module.exports = {
  resolve: {
    alias: {
      'webpack-hot-client/client': path.resolve(__dirname, '../../client')
    }
  },
  optimization: {
    moduleIds: 'deterministic'
  },
  context: __dirname,
  devtool: 'source-map',
  entry: {
    main: ['./app.js'],
    server: ['./sub/client']
  },
  output: {
    filename: './output.js',
    path: path.resolve(__dirname)
  },
  plugins: [new TimeFixPlugin()]
};
