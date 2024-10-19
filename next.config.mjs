import * as path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  cleanDistDir: true,
  experimental: {},
  cacheHandler: path.resolve("./cache-handler.js"),
};

export default nextConfig;
