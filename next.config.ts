import type { NextConfig } from 'next';

const configuration: NextConfig = {
  reactStrictMode: true,

  output: 'standalone',

  eslint: { ignoreDuringBuilds: true },
};

export default configuration;
