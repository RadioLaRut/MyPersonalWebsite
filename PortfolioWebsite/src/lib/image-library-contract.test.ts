import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const projectRoot = process.cwd();

function readProjectFile(relativePath: string) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

test("图片库读取与上传路由都保留本地编辑访问边界", () => {
  const listingRoute = readProjectFile("src/app/api/image-library/route.ts");
  const uploadRoute = readProjectFile("src/app/api/upload/route.ts");

  assert.match(listingRoute, /export const runtime = "nodejs"/);
  assert.match(
    listingRoute,
    /assertLocalEditorApiAccess\(request\)/,
  );
  assert.match(uploadRoute, /formData\.get\("directory"\)/);
  assert.match(uploadRoute, /DEFAULT_UPLOAD_PUBLIC_DIRECTORY/);
  assert.match(
    uploadRoute,
    /assertLocalEditorApiAccess\(request, \{ requireToken: true \}\)/,
  );
});

test("所有 Puck 图片来源都接入统一资源字段", () => {
  const rootConfig = readProjectFile("src/puck/config.tsx");
  const layoutConfig = readProjectFile(
    "src/puck/config/layout-components.tsx",
  );
  const worksConfig = readProjectFile(
    "src/puck/config/works-components.tsx",
  );
  const consolidatedConfig = readProjectFile(
    "src/puck/config/consolidated-components.tsx",
  );

  assert.match(rootConfig, /image: createImageSourceField\("分享图片\|image"\)/);
  assert.match(
    layoutConfig,
    /src: createImageSourceField\("Image Source"\)/,
  );
  assert.match(
    layoutConfig,
    /imageSrc: createImageSourceField\("Image Source"\)/,
  );
  assert.match(
    consolidatedConfig,
    /\[`col\$\{column\}MediaSrc`\]: createImageSourceField\("可选图片"\)/,
  );
  assert.match(
    worksConfig,
    /unlitSrc: createImageSourceField\("Unlit Source"\)/,
  );
  assert.match(
    worksConfig,
    /litSrc: createImageSourceField\("Lit Source"\)/,
  );
  assert.match(worksConfig, /mode: "media"/);
  assert.match(
    consolidatedConfig,
    /buildImagePickerFieldTriple\("mediaSrc"/,
  );

  for (const configSource of [
    rootConfig,
    layoutConfig,
    worksConfig,
    consolidatedConfig,
  ]) {
    assert.doesNotMatch(
      configSource,
      /(?:src|imageSrc|mediaSrc|litSrc|unlitSrc|col\dMediaSrc|image):\s*\{\s*type:\s*"text"/,
    );
  }
});
