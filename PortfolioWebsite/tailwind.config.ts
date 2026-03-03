import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        black: "#000000",
        white: "#ffffff",
      },
      fontFamily: {
        sans: ["var(--font-futura)", "Futura", "sans-serif"],
        serif: ["var(--font-noto-serif)", "Noto Serif SC", "serif"],
        display: ["var(--font-noto-serif)", "Noto Serif SC", "serif"],
        mono: ["var(--font-han-yi-qi-hei)", "HanYiQiHei", "monospace"],
        body: ["var(--font-futura)", "Futura", "sans-serif"],
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
        loose: "1.8",
      },
    },
  },
  plugins: [],
};
export default config;
