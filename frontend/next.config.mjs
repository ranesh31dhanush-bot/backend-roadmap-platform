/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@top1/shared"],
  // Required for minimal Docker production image (HARD-001)
  // Copies only the necessary node_modules subset for running the app
  output: "standalone",
};

export default nextConfig;

