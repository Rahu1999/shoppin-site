import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/v1';
// BACKEND_INTERNAL_URL is the direct backend address (never goes through nginx).
// Set this to http://localhost:5000 in production so the rewrite hits the backend
// directly instead of looping back through nginx → Next.js infinitely.
const backendBase =
  process.env.BACKEND_INTERNAL_URL ||
  apiUrl.replace(/\/(?:api\/)?v\d+\/?$/, '');
const uploadsDestination = backendBase + '/uploads/:path*';

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
