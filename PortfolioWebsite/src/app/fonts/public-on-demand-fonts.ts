import localFont from "next/font/local";

const hanYiQiHei = localFont({
  src: [
    { path: "./HYQiHei_40S.ttf", weight: "400", style: "normal" },
    { path: "./HYQiHei_50S.ttf", weight: "500", style: "normal" },
    { path: "./HYQiHei_70S.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-han-yi-qi-hei",
  display: "swap",
  adjustFontFallback: false,
  preload: false,
});

const futura = localFont({
  src: [
    { path: "./Futura Light.otf", weight: "300", style: "normal" },
    { path: "./Futura Regular.ttf", weight: "400", style: "normal" },
    { path: "./Futura Medium.otf", weight: "500", style: "normal" },
  ],
  variable: "--font-futura",
  display: "swap",
  adjustFontFallback: false,
  preload: false,
});

const luna = localFont({
  src: [
    { path: "./LunaITCStd.otf", weight: "400", style: "normal" },
    { path: "./LunaITCStd-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-luna",
  display: "swap",
  adjustFontFallback: false,
  preload: false,
});

const gothic = localFont({
  src: [
    { path: "./itc-serif-gothic-light-588cee8a0bfb1.otf", weight: "300", style: "normal" },
    { path: "./itc-serif-gothic-regular-588cef4e7134b.otf", weight: "400", style: "normal" },
    { path: "./itc-serif-gothic-extra-bold-588cef7e1f5d9.otf", weight: "800", style: "normal" },
    { path: "./itc-serif-gothic-heavy-588d443a778f2.otf", weight: "900", style: "normal" },
  ],
  variable: "--font-gothic",
  display: "swap",
  adjustFontFallback: false,
  preload: false,
});

export const PUBLIC_ON_DEMAND_FONT_VARIABLE_CLASS_NAME = [
  hanYiQiHei.variable,
  futura.variable,
  luna.variable,
  gothic.variable,
].join(" ");
