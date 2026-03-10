import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/test",
        destination: "/apply",
        permanent: true,
      },
    ];
  },
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
