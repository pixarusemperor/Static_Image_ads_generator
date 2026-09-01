import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ["@resvg/resvg-js"],
  outputFileTracingExcludes: {
    '*': [
      './Ad_bible/**',
      './Ad_bible*/**',
      './TYPE OF ADS SAMPLE/**',
      './TYPE OF ADS SAMPLE*/**',
      './data/**',
    ],
  },
};

export default nextConfig;
