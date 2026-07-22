import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import {
  PAGE_DOCUMENT_VERSION,
  validatePageReferences,
} from "../src/lib/page-document-contract.ts";
import { preparePageDocumentMigration } from "../src/lib/page-document-migration.ts";

const contentRoot = path.resolve(process.cwd(), "content/pages");
const publicRoot = path.resolve(process.cwd(), "public");

const DESCRIPTION_BY_SLUG = {
  about: "灯光、技术美术与游戏设计方向的个人介绍、实践重点和联系方式。",
  index: "让氛围、系统与落地流程共同服务体验，汇集灯光、技术美术与游戏设计作品。",
  works: "灯光研究、互动叙事、系统设计与技术美术项目的完整作品索引。",
  "works/epic-stage": "围绕舞台空间、角色关系与即时演算展开的灯光叙事概念设计。",
  "works/holy-tank": "以敌意建筑为议题的交互叙事游戏，探索空间规则、社会排斥与玩家选择。",
  "works/houdini-pcg": "基于 Houdini 与 Unreal Engine 的程序化小镇生成管线及生产工具设计。",
  "works/im-explode": "以射击后坐力作为唯一移动方式的多人对抗游戏与物理系统设计。",
  "works/insight": "围绕舆情监管、信息操控与个人伦理选择展开的互动叙事游戏。",
  "works/lighting-portfolio": "围绕镜头构图、时间变化与空间情绪展开的电影化灯光研究归档。",
  "works/lighting-portfolio/collection-1": "基于现有资产独立完成构图、镜头推进与电影化灯光塑形的系列练习。",
  "works/lighting-portfolio/collection-2": "围绕同一站台场景在白昼、黄昏与夜晚之间的色温、可读性与情绪切换练习。",
  "works/lighting-portfolio/collection-3": "以西部场景为基础，测试双重构图下的景深关系、天气层次与远景照明。",
  "works/lighting-portfolio/collection-4": "日常的 Unreal Engine 写实环境、氛围塑造与打光专项练习。",
  "works/penguin": "从核心循环、跨专业协作到 Unreal Engine 生产工作流的完整游戏项目实践。",
  "works/prometheus": "以潜行拍摄为核心机制的游戏设计、关卡节奏与视觉引导实践。",
  "works/slay-the-virus": "将卡牌构筑与有限空间排布结合的 Roguelike 卡牌游戏设计。",
  "works/wow-otto": "围绕敌意建筑议题展开的轨迹球交互叙事体验。",
};

async function listJsonFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listJsonFiles(absolutePath);
    return entry.isFile() && entry.name.endsWith(".json") ? [absolutePath] : [];
  }));
  return nested.flat().sort();
}

function slugFromFile(filePath) {
  const relative = path.relative(contentRoot, filePath).replaceAll(path.sep, "/");
  return relative.replace(/\.json$/i, "");
}

async function writeAtomically(filePath, document, lineEnding) {
  const temporaryPath = `${filePath}.${randomUUID()}.tmp`;
  const serialized = `${JSON.stringify(document, null, 2).replace(/\n/g, lineEnding)}${lineEnding}`;
  try {
    await fs.writeFile(temporaryPath, serialized, "utf8");
    await fs.rename(temporaryPath, filePath);
  } finally {
    await fs.unlink(temporaryPath).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });
  }
}

const files = await listJsonFiles(contentRoot);
const preparedDocuments = await Promise.all(files.map(async (filePath) => {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  const slug = slugFromFile(filePath);
  const migration = preparePageDocumentMigration(parsed, {
    description: DESCRIPTION_BY_SLUG[slug],
  });
  const { document } = migration;
  const referenceIssues = validatePageReferences(document, publicRoot);
  if (referenceIssues.length > 0) {
    throw new Error(`${slug}: ${referenceIssues.map((issue) => `${issue.path} ${issue.message}`).join("; ")}`);
  }

  return {
    document,
    filePath,
    lineEnding: raw.includes("\r\n") ? "\r\n" : "\n",
    migrated: migration.migrated,
  };
}));

const migrations = preparedDocuments.filter((entry) => entry.migrated);
for (const migration of migrations) {
  await writeAtomically(
    migration.filePath,
    migration.document,
    migration.lineEnding,
  );
}

console.log(
  `Validated ${files.length} page documents; migrated ${migrations.length} to PageDocument v${PAGE_DOCUMENT_VERSION}.`,
);
