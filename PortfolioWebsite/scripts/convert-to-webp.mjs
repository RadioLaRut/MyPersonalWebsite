import { execSync } from 'child_process';
import { existsSync, readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join, extname, basename, dirname } from 'path';

const IMAGES_DIR = new URL('../public/images', import.meta.url).pathname;
const SRC_DIR = new URL('../src', import.meta.url).pathname;
const CONTENT_DIR = new URL('../content', import.meta.url).pathname;
const CWEBP = '/usr/local/bin/cwebp';
const QUALITY = 85;
const SKIP_FILES = ['placeholder-16-9-1772675072147-5143c516.jpg'];

// 递归收集所有 png/jpg/jpeg 文件
function collectImages(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectImages(full));
    } else if (/\.(png|jpg|jpeg)$/i.test(entry) && !SKIP_FILES.includes(entry)) {
      results.push(full);
    }
  }
  return results;
}

// 用 cwebp 转换单张图片，返回是否成功
function convertToWebp(src) {
  const dest = src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  if (existsSync(dest)) {
    console.log(`已存在，跳过: ${basename(dest)}`);
    return { src, dest, success: true, skipped: true };
  }
  try {
    execSync(`"${CWEBP}" -q ${QUALITY} "${src}" -o "${dest}"`, { stdio: 'pipe' });
    // 验证输出文件确实存在且大小 > 0
    if (existsSync(dest) && statSync(dest).size > 0) {
      console.log(`转换成功: ${basename(src)} -> ${basename(dest)}`);
      return { src, dest, success: true, skipped: false };
    } else {
      console.error(`转换失败（输出文件无效）: ${src}`);
      return { src, dest, success: false };
    }
  } catch (e) {
    console.error(`转换失败: ${src}\n${e.message}`);
    return { src, dest, success: false };
  }
}

// 替换文件内容中的图片引用
function replaceInFile(filePath, conversions) {
  let content = readFileSync(filePath, 'utf-8');
  let changed = false;
  for (const { src, dest, success } of conversions) {
    if (!success) continue;
    // 提取 /images/... 相对路径部分
    const relSrc = src.replace(/.*\/public/, '').replace(/\.(png|jpg|jpeg)$/i, (ext) => ext);
    const relDest = dest.replace(/.*\/public/, '');
    // 替换所有出现的原路径（含扩展名，大小写不敏感）
    const escaped = relSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    if (regex.test(content)) {
      content = content.replace(regex, relDest);
      changed = true;
    }
  }
  if (changed) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`已更新引用: ${filePath.replace(/.*PortfolioWebsite\//, '')}`);
  }
}

// 递归收集代码文件
function collectCodeFiles(dir, exts) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectCodeFiles(full, exts));
    } else if (exts.includes(extname(entry))) {
      results.push(full);
    }
  }
  return results;
}

// 主流程
const images = collectImages(IMAGES_DIR);
console.log(`\n找到 ${images.length} 张图片，开始转换...\n`);

const conversions = images.map(convertToWebp);
const succeeded = conversions.filter(c => c.success);
const failed = conversions.filter(c => !c.success);

console.log(`\n转换完成: ${succeeded.length} 成功, ${failed.length} 失败`);

if (failed.length > 0) {
  console.error('\n以下文件转换失败，将跳过其代码替换:');
  failed.forEach(c => console.error(' -', c.src));
}

console.log('\n开始替换代码引用...\n');
const codeFiles = [
  ...collectCodeFiles(SRC_DIR, ['.ts', '.tsx', '.js', '.jsx']),
  ...collectCodeFiles(CONTENT_DIR, ['.json']),
];

for (const file of codeFiles) {
  replaceInFile(file, conversions);
}

console.log('\n全部完成。');
