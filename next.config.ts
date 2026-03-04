import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.imweb.me",
        pathname: "/thumbnail/**",
      },
    ],
  },
};

export default nextConfig;
