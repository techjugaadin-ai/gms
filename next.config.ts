import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static optimization
  reactStrictMode: true,
  
  // Optimize for production
  poweredByHeader: false,
  
  // Security headers
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },

  // Only allow dev origins in development
  ...(process.env.NODE_ENV === "development" && {
    allowedDevOrigins: ['192.168.1.2', 'localhost'],
  }),
};

export default nextConfig;
