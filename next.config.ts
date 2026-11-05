import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    optimizePackageImports: ["lucide-react", "react-icons", "framer-motion"],
  },
};

export default nextConfig;
