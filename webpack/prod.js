const merge = require("webpack-merge");
const path = require("path");
const base = require("./base");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = merge(base, {
  entry: "./src/index.js",
  mode: "production",
  output: {
    filename: 'main.js',
  },
  devtool: false,
  performance: {
    maxEntrypointSize: 9000000,
    maxAssetSize: 9000000
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
