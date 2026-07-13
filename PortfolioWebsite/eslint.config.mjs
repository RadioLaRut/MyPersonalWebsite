import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    files: ["**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  globalIgnores([
    ".next/**",
    ".next.pre-next16/**",
    ".next.failed-*/**",
    ".next-dev-normal/**",
    ".next-dev-testing/**",
    "node_modules.pnpm-backup/**",
    "public/puck-preview.css",
    "next-env.d.ts",
  ]),
]);
