import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/v1';
// In production, default to the local backend port so the rewrite proxies
// internally (Next.js → backend on 5000) instead of looping back through nginx.
// Override with BACKEND_INTERNAL_URL if backend runs on a different address.
const backendBase =
  process.env.BACKEND_INTERNAL_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'http://localhost:5000'
    : apiUrl.replace(/\/(?:api\/)?v\d+\/?$/, ''));
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
