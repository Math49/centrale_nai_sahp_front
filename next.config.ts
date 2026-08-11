import type { NextConfig } from 'next';

const configuration: NextConfig = {
  reactStrictMode: true,

  output: 'standalone',

  eslint: { ignoreDuringBuilds: true },

  async headers() {
    return [
      {
        source: '/runtime-config.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
    ];
  },
};

export default configuration;
