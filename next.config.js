/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone",          // Lean Docker build — only runtime + used deps end up in the image
};

module.exports = nextConfig;
