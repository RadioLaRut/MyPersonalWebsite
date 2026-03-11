import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        black: "#000000",
        white: "#ffffff",
        textPrimary: "rgba(255, 255, 255, 0.75)",
        textMuted: "rgba(255, 255, 255, 0.45)",
      },
      fontFamily: {
        sans: ["var(--font-latin-sans)", "var(--font-cjk-sans)", "sans-serif"],
        serif: ["var(--font-cjk-editorial)", "Noto Serif SC", "serif"],
        elegant: ["var(--font-latin-classical)", "serif"],
        display: ["var(--font-latin-gothic)", "var(--font-cjk-editorial)", "serif"],
        mono: ["var(--font-han-yi-qi-hei)", "monospace"],
        body: ["var(--font-latin-sans)", "var(--font-cjk-sans)", "sans-serif"],
        luna: ["var(--font-latin-editorial)", "var(--font-cjk-editorial)", "sans-serif"],
        gothic: ["var(--font-latin-gothic)", "var(--font-cjk-editorial)", "sans-serif"],
        futura: ["var(--font-latin-sans)", "var(--font-cjk-sans)", "sans-serif"],
      },
      aspectRatio: {
        "cinema": "21 / 9",
      },
      letterSpacing: {
        tighter: "-0.05em",
        widest: "0.1em",
      },
      lineHeight: {
        none: "1",
        relaxed: "1.6",
        loose: "1.85",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.22, 1, 0.36, 1)",
        "apple": "cubic-bezier(0.22, 1, 0.36, 1)",
        "fluid": "cubic-bezier(0.8, 0, 0.1, 1)",
      },
      transitionDuration: {
        DEFAULT: "400ms",
      },
    },
  },
  plugins: [],
};
export default config;
