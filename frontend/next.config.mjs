/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@top1/shared"],
  // Required for minimal Docker production image (HARD-001)
  // Copies only the necessary node_modules subset for running the app
  output: "standalone",
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || process.env.BACKEND_URL || "https://backend-roadmap-api.onrender.com";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: "/health/:path*",
        destination: `${backendUrl}/health/:path*`,
      },
    ];
  },
};

export default nextConfig;

