import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fdn2.gsmarena.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
