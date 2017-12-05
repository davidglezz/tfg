const fs = require('fs');
const path = require('path');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const { NoEmitOnErrorsPlugin } = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');


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
  "target": "node",
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
    /*new UglifyJsPlugin({
      uglifyOptions: {
        ie8: false,
        ecma: 8,
        parse: {},
        mangle: true,
        output: {
          comments: false,
          beautify: false
        },
        compress: true,
        warnings: false
      }
    })*/
  ],
  "node": {
    "fs": "empty",
    "global": true,
    "crypto": "empty",
    "tls": "empty",
    "net": "empty",
    "util": false,
    "process": true,
    "module": false,
    "clearImmediate": false,
    "setImmediate": false
  },
  "externals": [
    {/*
      "sntp": true,
      "kcors": true,
      "dns": true,
      "dgram": true,
      "koa": true,
      "koa-multer": true,
      "koa-router": true,
      "koa-bodyparser": true,
      "multer": true,
    */},
  ]
};
