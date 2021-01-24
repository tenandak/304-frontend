const merge = require("webpack-merge");
const path = require("path");
const base = require("./base");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");

module.exports = merge(base, {
  entry: "./src/index.js",
  mode: "production",
  output: {
    filename: 'bundle.js',
  },
  devtool: false,
  performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false
          }
        }
      })
    ]
  }
});
