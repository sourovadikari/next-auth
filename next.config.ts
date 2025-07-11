import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // FIX: dangerouslyAllowSVG should be a top-level property under 'images',
    // not inside the 'remotePatterns' array.
    dangerouslyAllowSVG: true, // This line is now in the correct place
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**', // Allows any path on placehold.co
      },
      // You can add other domains here if you use images from different sources
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      //   port: '',
      //   pathname: '/my-images/**',
      // },
    ],
  },
};

export default nextConfig;
