import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const watchTargets = [
  path.join(projectRoot, "content/pages"),
  path.join(projectRoot, "content/component-design"),
  path.join(projectRoot, "content/font-lab"),
  path.join(projectRoot, "content/fonts"),
  path.join(projectRoot, "src/lib/public-copy.ts"),
];
let timer = null;
let running = false;
let pending = false;

function synchronize() {
  if (running) {
    pending = true;
    return;
  }
  running = true;
  const child = spawn(
    process.execPath,
    [path.join(projectRoot, "scripts/generate-font-subsets.mjs")],
    { cwd: projectRoot, stdio: "inherit" },
  );
  child.on("exit", () => {
    running = false;
    if (pending) {
      pending = false;
      synchronize();
    }
  });
}

function queueSynchronize() {
  if (timer !== null) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    synchronize();
  }, 750);
}

const watchers = watchTargets
  .filter((target) => fs.existsSync(target))
  .map((target) => fs.watch(
    target,
    fs.statSync(target).isDirectory() ? { recursive: true } : undefined,
    queueSynchronize,
  ));

console.log("公开字体监听器已启动。");

function close() {
  if (timer !== null) clearTimeout(timer);
  watchers.forEach((watcher) => watcher.close());
}

process.once("SIGINT", close);
process.once("SIGTERM", close);
