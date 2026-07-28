import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PRODUCTION_SECURITY_HEADERS } from "./scripts/security-headers.mjs";

/** @type {import("next").NextConfig} */
const isDevelopmentServer = process.env.NODE_ENV === "development";
const siteMode = process.env.NEXT_PUBLIC_SITE_MODE === "testing" ? "testing" : "normal";
const projectRoot = dirname(fileURLToPath(import.meta.url));
const productionToolFontStub = fileURLToPath(
  new URL("./src/app/fonts/full-fonts.stub.ts", import.meta.url),
);
const productionComponentDesignProviderStub = fileURLToPath(
  new URL(
    "./src/components/layout/production-stubs/ComponentDesignProvider.tsx",
    import.meta.url,
  ),
);
const productionFontLabGlobalVarsStub = fileURLToPath(
  new URL(
    "./src/components/layout/production-stubs/FontLabGlobalVars.tsx",
    import.meta.url,
  ),
);

const nextConfig = {
  distDir: isDevelopmentServer ? `.next-dev-${siteMode}` : ".next",
  reactStrictMode: true,
  typescript: {
    tsconfigPath: isDevelopmentServer ? "tsconfig.json" : "tsconfig.typecheck.json",
  },
  turbopack: {
    root: projectRoot,
  },
  webpack(config, { webpack }) {
    if (!isDevelopmentServer) {
      const productionToolReplacements = [
        {
          replacement: productionToolFontStub,
          request:
            /(?:@\/app\/fonts\/full-fonts|[/\\]src[/\\]app[/\\]fonts[/\\]full-fonts\.ts)$/u,
        },
        {
          replacement: productionComponentDesignProviderStub,
          request:
            /(?:@\/components\/layout\/ComponentDesignProvider|[/\\]src[/\\]components[/\\]layout[/\\]ComponentDesignProvider\.tsx)$/u,
        },
        {
          replacement: productionFontLabGlobalVarsStub,
          request:
            /(?:@\/components\/layout\/FontLabGlobalVars|[/\\]src[/\\]components[/\\]layout[/\\]FontLabGlobalVars\.tsx)$/u,
        },
      ];

      for (const { replacement, request } of productionToolReplacements) {
        config.plugins.push(
          new webpack.NormalModuleReplacementPlugin(request, replacement),
        );
      }
    }
    return config;
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
