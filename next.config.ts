import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "panhara.sgp1.digitaloceanspaces.com",
        port: "",
        pathname: "/tsport_products/**",
      },
    ],
  },
};

export default nextConfig;
