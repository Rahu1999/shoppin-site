import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/v1';
// If apiUrl is 'https://steelkitchen.in/api/v1', destination becomes 'https://steelkitchen.in/api/uploads/:path*'
// If apiUrl is 'http://localhost:5000/v1', destination becomes 'http://localhost:5000/uploads/:path*'
const uploadsDestination = apiUrl.replace(/\/v1\/?$/, '') + '/uploads/:path*';

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
        protocol: 'https',
        hostname: '**', // Allow any hostname for remote images since we don't know the exact production domain
      }
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
