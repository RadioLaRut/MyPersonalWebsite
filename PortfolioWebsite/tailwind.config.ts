import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/puck/**/*.{js,ts,jsx,tsx,mdx}",
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
        sans: ["var(--font-futura)", "var(--font-han-yi-qi-hei)", "sans-serif"],
        serif: ["var(--font-noto-serif)", "Noto Serif SC", "serif"],
        display: ["var(--font-gothic)", "var(--font-noto-serif)", "serif"],
        mono: ["var(--font-han-yi-qi-hei)", "monospace"],
        body: ["var(--font-futura)", "var(--font-noto-serif)", "sans-serif"],
        luna: ["var(--font-luna)", "var(--font-noto-serif)", "sans-serif"],
        gothic: ["var(--font-gothic)", "var(--font-noto-serif)", "sans-serif"],
        futura: ["var(--font-futura)", "var(--font-han-yi-qi-hei)", "sans-serif"],
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
