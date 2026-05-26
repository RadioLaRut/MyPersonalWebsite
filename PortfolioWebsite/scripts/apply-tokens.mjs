import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const sourceRoot = path.resolve(process.cwd(), "src");

function walkSync(directory, fileList = []) {
  if (!fs.existsSync(directory)) {
    return fileList;
  }

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".DS_Store" || entry.name.startsWith(".")) {
      continue;
    }

    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walkSync(absolutePath, fileList);
      continue;
    }

    if (absolutePath.endsWith(".ts") || absolutePath.endsWith(".tsx")) {
      fileList.push(absolutePath);
    }
  }

  return fileList;
}

function toProjectRelativePath(filePath) {
  return path.relative(process.cwd(), filePath).split(path.sep).join("/");
}

const files = walkSync(sourceRoot);
let changedFiles = 0;

for (const filePath of files) {
  const original = fs.readFileSync(filePath, "utf8");
  let nextContent = original;

  nextContent = nextContent.replace(/text-white\/(90|80|75|70)(\s|"|'|`|\]|\})/g, "text-textPrimary$2");
  nextContent = nextContent.replace(/text-white\/(60|50|40|30|20)(\s|"|'|`|\]|\})/g, "text-textMuted$2");
  nextContent = nextContent.replace(/leading-\[1\.[89]\]/g, "leading-loose");
  nextContent = nextContent.replace(/leading-\[2(\.2)?\]/g, "leading-loose");
  nextContent = nextContent.replace(/leading-\[1\.[67]\]/g, "leading-relaxed");

  if (nextContent === original) {
    continue;
  }

  fs.writeFileSync(filePath, nextContent, "utf8");
  changedFiles += 1;
  console.log(`Updated ${toProjectRelativePath(filePath)}`);
}

console.log(`Successfully updated ${changedFiles} files with semantic tokens.`);
