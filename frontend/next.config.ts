import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/v1';
// Strip /api/v1 or /v1 suffix to get the bare origin, then append /uploads/:path*
// e.g. 'https://steelkitchen.in/api/v1' → 'https://steelkitchen.in/uploads/:path*'
// e.g. 'http://localhost:5000/v1'         → 'http://localhost:5000/uploads/:path*'
const uploadsDestination = apiUrl.replace(/\/(?:api\/)?v\d+\/?$/, '') + '/uploads/:path*';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '**',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: uploadsDestination,
      },
    ];
  },
};

export default nextConfig;
