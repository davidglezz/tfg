const fs = require('fs');
const path = require('path');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const { NoEmitOnErrorsPlugin } = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  "resolve": {
    "extensions": [".ts",".js"],
    "modules": ["./node_modules"],
    "symlinks": true,
    "mainFields": [
      "module",
      "main"
    ]
  },
  "resolveLoader": {
    "modules": [
      "./node_modules"
    ]
  },
  "entry": "./src/app.ts",
  "output": {
    "path": path.join(process.cwd(), "dist"),
    "filename": "apiserver.bundle.js"
  },
  "module": {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  },
  "plugins": [
    //new NoEmitOnErrorsPlugin(),
    new ProgressPlugin(),
    /*new CircularDependencyPlugin({
      "exclude": /(\\|\/)node_modules(\\|\/)/,
      "failOnError": false
    }),*/
    // new UglifyJSPlugin()
  ],
  "node": {
    "fs": "empty",
    "global": true,
    "crypto": "empty",
    "tls": "empty",
    "net": "empty",
    "process": true,
    "module": false,
    "clearImmediate": false,
    "setImmediate": false
  },
  "externals": [
    {
      "sntp": true, // a is not external
      "kcors": true,
      "dns": true,
      "dgram": true,
      "koa": true,
      "koa-multer": true,
      "koa-router": true,
      "koa-bodyparser": true,
      "multer": true,
    },
  ]
};
