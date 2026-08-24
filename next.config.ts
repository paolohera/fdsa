import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jufbcimikxndolevpime.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // AVIF first, WebP fallback — both are auto-negotiated per browser by
    // Next's image optimizer, so this just sets preference order.
    formats: ["image/avif", "image/webp"],
  },
  // Gzip/Brotli compression for served assets — on by default on Vercel,
  // but explicit here so it's not accidentally lost if deploy target changes.
  compress: true,
};

export default nextConfig;