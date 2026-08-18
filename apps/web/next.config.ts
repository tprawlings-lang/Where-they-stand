import type { NextConfig } from "next";

const nextConfig: NextConfig = { transpilePackages: ["@where-they-stand/ui", "@where-they-stand/issue-definitions", "@where-they-stand/election-data"] };
export default nextConfig;
