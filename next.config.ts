import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next"
import path from "path";
const withMDX = createMDX({
  // customise the config file path
  // configPath: "source.config.ts"
});

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, '..'),
  },
  /* config options here */
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withMDX(nextConfig);

