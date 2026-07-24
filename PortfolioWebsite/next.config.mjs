import { PRODUCTION_SECURITY_HEADERS } from "./scripts/security-headers.mjs";

/** @type {import("next").NextConfig} */
const isDevelopmentServer = process.env.NODE_ENV === "development";
const siteMode = process.env.NEXT_PUBLIC_SITE_MODE === "testing" ? "testing" : "normal";

const nextConfig = {
  distDir: isDevelopmentServer ? `.next-dev-${siteMode}` : ".next",
  reactStrictMode: true,
  typescript: {
    tsconfigPath: isDevelopmentServer ? "tsconfig.json" : "tsconfig.typecheck.json",
  },
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  ...(!isDevelopmentServer
    ? {
      async headers() {
        return [{
          headers: PRODUCTION_SECURITY_HEADERS,
          source: "/:path*",
        }];
      },
    }
    : {}),
};

export default nextConfig;
