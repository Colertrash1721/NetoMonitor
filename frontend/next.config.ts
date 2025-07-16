import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/session',
        destination: 'http://128.85.27.70:8082/api/session',
      },
      {
        source: '/api/socket',
        destination: 'http://128.85.27.70:8082/api/socket',
      },
    ];
  },
};

export default nextConfig;
