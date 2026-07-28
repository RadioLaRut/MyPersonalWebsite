import fs from "node:fs/promises";

import {
  COMPONENT_DESIGN_CONFIG_FILE,
  writeComponentDesignSourceConfig,
} from "../src/lib/component-design-config.ts";
import {
  parseComponentDesignDocument,
  parseCurrentComponentDesignDocument,
} from "../src/lib/component-design-v4.ts";

const write = process.argv.includes("--write");
const source = await fs.readFile(COMPONENT_DESIGN_CONFIG_FILE, "utf8");
const migrated = parseComponentDesignDocument(JSON.parse(source));

if (!migrated || !parseCurrentComponentDesignDocument(migrated)) {
  throw new Error("ComponentLab 配置无法迁移为严格 V4 文档");
}

const output = `${JSON.stringify(migrated, null, 2)}\n`;
if (source === output) {
  console.log("ComponentLab V4 配置已是最新状态。");
} else if (write) {
  await writeComponentDesignSourceConfig(migrated);
  console.log("已将 ComponentLab 配置迁移为 V4。");
} else {
  console.error(
    "ComponentLab 配置需要迁移为 V4；请运行 npm run migrate:component-lab-v4。",
  );
  process.exitCode = 1;
}
