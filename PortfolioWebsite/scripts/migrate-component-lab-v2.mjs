import fs from "node:fs/promises";
import path from "node:path";

import {
  normalizeComponentDesignDocument,
  parseComponentDesignDocument,
  parseCurrentComponentDesignDocument,
} from "../src/lib/component-design-v2.ts";

const WRITE = process.argv.includes("--write");
const ROOT = process.cwd();
const PAGE_ROOT = path.join(ROOT, "content/pages");
const COMPONENT_DESIGN_FILE = path.join(
  ROOT,
  "content/component-design/component-design.json",
);
const AUXILIARY_CONTENT_FILES = [
  path.join(ROOT, "content/component-design/component-lab-presets.json"),
  path.join(ROOT, "content/component-design/editor-empty-state.json"),
];

const ALIGNMENT_PROPS_BY_COMPONENT = {
  BilibiliEmbed: ["captionAlign"],
  ContactFlashlight: ["taglineSubAlign"],
  EditorialHeader: ["descriptionAlign"],
  EditorialSplit: ["bodyAlign"],
  HeroHeadline: ["subtitleAlign"],
  HeroSection: ["descriptionAlign"],
  HomeEndcapSection: ["descriptionAlign"],
  ImagePanel: ["captionAlign"],
  MetadataListItem: ["align"],
  RichParagraph: ["align"],
  StatementBlock: ["align"],
  TextParagraphBlock: ["align"],
  ThreeColumnSection: [
    "col1BodyAlign",
    "col2BodyAlign",
    "col3BodyAlign",
  ],
  WorksListEntry: ["descriptionAlign"],
};

function isRecord(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function migrateNode(node) {
  if (!isRecord(node) || typeof node.type !== "string" || !isRecord(node.props)) {
    return node;
  }
  const props = node.props;
  for (const key of ALIGNMENT_PROPS_BY_COMPONENT[node.type] ?? []) {
    delete props[key];
  }

  if (node.type === "HeroSection") {
    props.variant = hasText(props.description) ||
        hasText(props.primaryCtaLabel) ||
        hasText(props.secondaryCtaLabel)
      ? "full"
      : "poster";
  }

  if (node.type === "ProjectCoverLink") {
    if (props.variant !== "card") {
      const right = props.align === "right" ||
        (props.align !== "left" &&
          typeof props.index === "number" &&
          props.index % 2 !== 0);
      props.variant = right ? "immersive-right" : "immersive-left";
    }
    delete props.align;
    delete props.index;
    if (
      props.variant === "card" &&
      hasText(props.number) &&
      !props.number.toLowerCase().startsWith("collection")
    ) {
      props.number = `Collection ${props.number}`;
    }
    if (!("prompt" in props)) props.prompt = "Enter";
  }

  if (node.type === "ThreeColumnSection") {
    if (props.variant === "evidence") props.variant = "phase";
    delete props.rhythm;
  }

  if (node.type === "BilibiliEmbed" && !("externalLinkLabel" in props)) {
    props.externalLinkLabel = "在哔哩哔哩观看";
  }

  if (node.type === "ParameterGrid") {
    if (!("mediaAlt" in props)) props.mediaAlt = "PCG Generation Overview";
    if (!("mediaLabel" in props)) {
      props.mediaLabel = "PROCEDURAL GENERATION PREVIEW";
    }
    if (Array.isArray(props.parameters)) {
      props.parameters.forEach((parameter) => {
        if (isRecord(parameter)) delete parameter.descriptionAlign;
      });
    }
  }

  if (node.type === "NextProjectBlock") {
    if (!("eyebrow" in props)) props.eyebrow = "NEXT PROJECT";
    if (!("footerLeft" in props)) {
      props.footerLeft = "© 2026 江承彦 / JIANG CHENGYAN";
    }
    if (!("footerRight" in props)) props.footerRight = "";
  }

  if (node.type === "ContactFlashlight") {
    if (!("clientsHeading" in props)) props.clientsHeading = "Experience History";
    if (!("employmentHeading" in props)) {
      props.employmentHeading = "Creative Direction";
    }
    if (!("contactHeading" in props)) props.contactHeading = "WeChat / Social";
    if (!("emailHeading" in props)) props.emailHeading = "Email / Contact";
  }

  if (node.type === "WorksList" && Array.isArray(props.works)) {
    props.works.forEach((work) => {
      if (isRecord(work)) delete work.descriptionAlign;
    });
  }

  return node;
}

function visit(value) {
  if (Array.isArray(value)) {
    value.forEach(visit);
    return value;
  }
  if (!isRecord(value)) return value;
  migrateNode(value);
  Object.values(value).forEach(visit);
  return value;
}

function migrateContentDocument(value) {
  visit(value);
  if (!isRecord(value) || !isRecord(value.components)) return value;

  for (const [componentType, entry] of Object.entries(value.components)) {
    if (!isRecord(entry) || !isRecord(entry.stressSample)) continue;
    const stressSample = entry.stressSample;
    if (stressSample.kind === "derived" && isRecord(stressSample.props)) {
      migrateNode({ type: componentType, props: stressSample.props });
    }
  }

  return value;
}

async function listJsonFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listJsonFiles(filePath);
    return entry.isFile() && entry.name.endsWith(".json") ? [filePath] : [];
  }));
  return nested.flat();
}

async function migrateJsonFile(filePath, transform = migrateContentDocument) {
  const source = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(source);
  const migrated = transform(parsed);
  const output = `${JSON.stringify(migrated, null, 2)}\n`;
  const changed = source !== output;
  if (changed && WRITE) await fs.writeFile(filePath, output, "utf8");
  return changed;
}

const pageFiles = await listJsonFiles(PAGE_ROOT);
const contentFiles = [...pageFiles, ...AUXILIARY_CONTENT_FILES];
const changedContent = [];
for (const filePath of contentFiles) {
  if (await migrateJsonFile(filePath)) {
    changedContent.push(path.relative(ROOT, filePath));
  }
}

const componentSource = await fs.readFile(COMPONENT_DESIGN_FILE, "utf8");
const componentValue = JSON.parse(componentSource);
const componentDocument = componentValue?.version === 2
  ? normalizeComponentDesignDocument(componentValue)
  : parseComponentDesignDocument(componentValue);
if (!componentDocument) {
  throw new Error("Component design document cannot be migrated");
}
if (!parseCurrentComponentDesignDocument(componentDocument)) {
  throw new Error("Migrated ComponentLab V2 document is not strict");
}
const componentOutput = `${JSON.stringify(componentDocument, null, 2)}\n`;
const componentChanged = componentSource !== componentOutput;
if (componentChanged && WRITE) {
  await fs.writeFile(COMPONENT_DESIGN_FILE, componentOutput, "utf8");
}

const changed = [
  ...(componentChanged
    ? [path.relative(ROOT, COMPONENT_DESIGN_FILE)]
    : []),
  ...changedContent,
];

if (!WRITE && changed.length > 0) {
  console.error(`ComponentLab V2 migration required for ${changed.length} files:`);
  changed.forEach((filePath) => console.error(`- ${filePath}`));
  process.exitCode = 1;
} else {
  console.log(
    changed.length > 0
      ? `Migrated ${changed.length} ComponentLab V2 files.`
      : "ComponentLab V2 content is current.",
  );
}
