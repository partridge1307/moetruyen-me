const CopyPlugin = require('copy-webpack-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.moetruyen.net',
        port: '',
        pathname: '/*/**',
      },
      process.env.NODE_ENV === 'development'
        ? {
            protocol: 'https',
            hostname: 'sin1.contabostorage.com',
            port: '',
            pathname: '/*/**',
          }
        : {},
    ],
  },
  experimental: {
    webpackBuildWorker: true,
  },
  webpack: (config) => {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: 'node_modules/node-unrar-js/esm/js/*.wasm',
            to: 'static/public/[name][ext]',
          },
        ],
      })
    );

    return config;
  },
};

module.exports = nextConfig;
