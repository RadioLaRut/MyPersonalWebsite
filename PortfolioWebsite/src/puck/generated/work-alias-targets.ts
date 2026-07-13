// 此文件由 scripts/generate-public-runtime.mjs 自动生成，请勿手动修改。
const WORK_ALIAS_TARGETS: Readonly<Record<string, string>> = {
  "holy-tank": "wow-otto",
  "im-explod-with-u": "im-explode",
  "pcg-town": "houdini-pcg",
  "penguin-trading-company": "penguin",
};

export function resolveGeneratedWorkAlias(slug: string): string | null {
  return WORK_ALIAS_TARGETS[slug] ?? null;
}
