import withPlaiceholder from '@plaiceholder/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.moetruyen.net'],
  },
};

export default withPlaiceholder(nextConfig);
