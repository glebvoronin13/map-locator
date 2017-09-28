const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  context: path.resolve(__dirname, "src"),
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({template: './index.html'}),
  ]
};
