import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['img.clerk.com'], // Allow images from Clerk's domain
  },
  // Ensure API routes are properly handled
  experimental: {
    serverComponentsExternalPackages: ['mammoth', 'pdf-parse', 'xlsx', 'jszip'],
  },
};

export default nextConfig;
