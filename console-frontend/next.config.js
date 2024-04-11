/** @type {import('next').NextConfig} */
const path = require('path');

const { patchWebpackConfig } = require('next-global-css');
const withPlugins = require('next-compose-plugins');

module.exports = withPlugins([], {
  src: path.resolve(__dirname, './src'),
  // Must be synchronized with a const 'basePath' in const/index.js
  basePath: '/web',
  reactStrictMode: true,
  eslint: {
    dirs: ['src', 'mocked-api'],
  },
  webpack(config, options) {
    patchWebpackConfig(config, options);
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    });

    return config;
  }
});
