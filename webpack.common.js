const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const dotenv = require('dotenv').config();

const devMode = process.env.NODE_ENV !== 'production';
const APP_DIR = path.resolve(__dirname, './src');
const BUILD_DIR = path.resolve(__dirname, './build');

/** env variables from config.js */
const CONFIG = process.env.CONFIG || 'config.js';
const envConfig = require('./' + CONFIG);
const userConfig = {};
const userFeatures = {};

for (const k in envConfig) {
  userConfig[k] = JSON.stringify(envConfig[k]);
}

for (const k in envConfig['features']) {
  userFeatures[k] = JSON.stringify(envConfig['features'][k]);
}

// Para no publicar el token que deja hacer peticiones desde cualquier URL, lo escondemos en el .env y sólo lo usamos en desarrollo.
// El que dejamos público en config.js tiene restricciones para que sólo se pueda usar desde cerosetenta.uniandes.edu.co
userConfig.MAPBOX_TOKEN = devMode ? JSON.stringify(dotenv.parsed.MAPBOX_TOKEN) : userConfig.MAPBOX_TOKEN;

const config = {
  entry: {
    index: `${APP_DIR}/index.jsx`,
  },
  output: {
    path: BUILD_DIR,
    filename: 'js/[name].[chunkhash].js',
  },
  module: {
    rules: [
      {
        test: /\.js(x)?$/,
        exclude: /node_modules/,
        include: `${APP_DIR}`,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(eot|svg|otf|ttf|woff|woff2|png)$/,
        use: {
          loader: 'file-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        ...userConfig,
      },
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: './index.html',
    }),
  ],
};

if (process.env.WEBPACK_ANALYZE === 'true') {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  config.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = config;
