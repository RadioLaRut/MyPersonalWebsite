import type { PuckComponentType } from "./component-manifest.ts";
import { PUBLIC_RENDERER_MODULE_NAMES } from "./public-renderer-manifest.ts";

type PublicRendererLoaderSourceOptions = {
  functionName: string;
  label: string;
  typesConstantName: string;
};

type WorkAliasSourceEntry = {
  aliases: readonly string[];
  id: string;
};

export function createWorkAliasResolverSource(entries: readonly WorkAliasSourceEntry[]) {
  const aliases = entries
    .flatMap((entry) => entry.aliases.map((alias) => [alias, entry.id] as const))
    .sort(([left], [right]) => left.localeCompare(right));

  return [
    "// 此文件由 scripts/generate-public-runtime.mjs 自动生成，请勿手动修改。",
    "const WORK_ALIAS_TARGETS: Readonly<Record<string, string>> = {",
    ...aliases.map(([alias, target]) => `  ${JSON.stringify(alias)}: ${JSON.stringify(target)},`),
    "};",
    "",
    "export function resolveGeneratedWorkAlias(slug: string): string | null {",
    "  return Object.hasOwn(WORK_ALIAS_TARGETS, slug)",
    "    ? WORK_ALIAS_TARGETS[slug]",
    "    : null;",
    "}",
    "",
  ].join("\n");
}

export function createPublicRendererLoaderSource(
  componentTypes: readonly PuckComponentType[],
  { functionName, label, typesConstantName }: PublicRendererLoaderSourceOptions,
) {
  const loaderEntries = componentTypes.map((type) => (
    `  ${type}: () => import("../public-renderers/${PUBLIC_RENDERER_MODULE_NAMES[type]}"),`
  ));
  const typeEntries = componentTypes.map((type) => `  "${type}",`);

  return [
    "// 此文件由 scripts/generate-public-runtime.mjs 自动生成，请勿手动修改。",
    "import type { ComponentConfig } from \"@puckeditor/core\";",
    "",
    "import type { PuckComponentType } from \"../component-manifest.ts\";",
    "",
    "type PublicRenderer = ComponentConfig[\"render\"];",
    "type PublicRendererModule = { render: PublicRenderer };",
    "type PublicRendererModuleLoader = () => Promise<PublicRendererModule>;",
    "",
    `export const ${typesConstantName} = [`,
    ...typeEntries,
    "] as const satisfies readonly PuckComponentType[];",
    "",
    "const ROUTE_PUBLIC_RENDERER_LOADERS = {",
    ...loaderEntries,
    "} satisfies Partial<Record<PuckComponentType, PublicRendererModuleLoader>>;",
    "",
    `export async function ${functionName}(type: PuckComponentType): Promise<PublicRenderer> {`,
    "  const loader = ROUTE_PUBLIC_RENDERER_LOADERS[type as keyof typeof ROUTE_PUBLIC_RENDERER_LOADERS];",
    "  if (!loader) {",
    `    throw new Error(\`${label} public renderer is stale for Puck component \\\"\${type}\\\"\`);`,
    "  }",
    "",
    "  const rendererModule = await loader();",
    "  return rendererModule.render;",
    "}",
    "",
  ].join("\n");
}
