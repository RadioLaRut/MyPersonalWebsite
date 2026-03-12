/** @type {import('next').NextConfig} */
const isDevelopmentServer = process.env.NODE_ENV === "development";
const siteMode = process.env.NEXT_PUBLIC_SITE_MODE === "testing" ? "testing" : "normal";

const nextConfig = {
  distDir: isDevelopmentServer ? `.next-dev-${siteMode}` : ".next",
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      const ignorePattern = "**/content/pages/**";
      const currentIgnored = config.watchOptions?.ignored;

      const normalizedIgnored = Array.isArray(currentIgnored)
        ? currentIgnored.filter((entry) => typeof entry === "string" && entry.length > 0)
        : typeof currentIgnored === "string" && currentIgnored.length > 0
          ? [currentIgnored]
          : [];

      if (!normalizedIgnored.includes(ignorePattern)) {
        normalizedIgnored.push(ignorePattern);
      }

      config.watchOptions = {
        ...(config.watchOptions ?? {}),
        ignored: normalizedIgnored,
      };
    }

    return config;
  },
};

export default nextConfig;
