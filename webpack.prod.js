const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.API_URL': JSON.stringify('http://api.internetofdrums.com/1.0')
    }),
    new UglifyJSPlugin({
      sourceMap: true
    }),
    new ExtractTextPlugin({
      filename: '[name].[contenthash].css'
    })
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader', 'sass-loader', 'postcss-loader']
        })
      }
    ]
  }
});
