import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.14'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "www.slovenscinakzk.com",
      }
    ],
  },
};

export default nextConfig;
