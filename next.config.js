const CopyPlugin = require('copy-webpack-plugin');

const url = new URL(process.env.NEXTAUTH_URL);

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
    ],
  },
  experimental: {
    webpackBuildWorker: true,
    serverActions: {
      allowedOrigins: ['localhost:3000', url.hostname],
    },
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
