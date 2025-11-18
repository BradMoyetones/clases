import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next"

const withMDX = createMDX({
  // customise the config file path
  // configPath: "source.config.ts"
});

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withMDX(nextConfig);

