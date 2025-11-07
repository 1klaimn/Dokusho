import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 's4.anilist.co',
      },
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net', // <-- ADD THIS NEW HOSTNAME
      },
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net', // For the new landing page image
      },
      {
        protocol: 'https',
        hostname: 'kenmei.co', // <-- ADDED THIS HOSTNAME
      },
      {
        protocol: 'https',
        hostname: 'mangadex.org',
      },
      // You can also add other source domains here as you add them
      {
        protocol: 'https',
        hostname: 'tcbscansonepiece.com',
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "https://super-duper-carnival-wvx9w5pqv7qfvqg9-3000.app.github.dev/dashboard"
      ]
    }
  }
};

export default nextConfig;
