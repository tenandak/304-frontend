const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
var dotenv = require('dotenv').config({path: __dirname + '/.env'});

module.exports = env => {
  return {
  entry: "./src/index.js",
  output: {
    filename: 'bundle.js',
  },
  mode: "development",
  devtool: "eval-source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: [/\.vert$/, /\.frag$/],
        use: "raw-loader"
      },
      {
        test: /\.(gif|png|jpe?g|svg|xml)$/i,
        use: "file-loader"
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin({
      root: path.resolve(__dirname, "../")
    }),
    new webpack.DefinePlugin({
      'process.env' : JSON.stringify(dotenv.parsed),
    }),
    new HtmlWebpackPlugin({
      template: "./dist/index.html"
    })
  ]
  };
}
