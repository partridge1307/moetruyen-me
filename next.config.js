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
};

module.exports = nextConfig;
