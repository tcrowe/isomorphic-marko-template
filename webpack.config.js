const path = require("path");
const { DefinePlugin } = require("webpack");
const { NODE_ENV } = process.env;
const isDev = NODE_ENV === "development";
const isPrd = NODE_ENV === "production";
const clientPath = path.join(__dirname, "src", "client.js");
const outputPath = path.join(__dirname, "dist");
const mode = NODE_ENV;

const opts = {
  mode,
  target: "web",
  entry: clientPath,
  output: {
    path: outputPath,
    filename: "client.js"
  },
  module: {
    rules: [
      {
        test: /\.marko/,
        loader: "@marko/webpack/loader"
      }
    ]
  },
  plugins: [new DefinePlugin({ "process.browser": "true" })],
  watch: false,
  cache: isDev,
  performance: {
    hints: false
  },
  stats: {
    assets: false,
    colors: isDev,
    errors: true,
    errorDetails: true,
    hash: false
  }
};

if (isDev === true) {
  opts.devtool = "source-map";
}

if (isPrd === true) {
  opts.optimization = { minimize: true };
}

module.exports = opts;
