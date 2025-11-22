import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks", "recharts"],
  },
};

export default nextConfig;
