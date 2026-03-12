import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const [, , siteMode, ...nextArgs] = process.argv;

if (!siteMode || nextArgs.length === 0) {
  console.error("Usage: node scripts/run-next-with-mode.mjs <site-mode> <next-args...>");
  process.exit(1);
}

const nextCliPath = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));

const child = spawn(process.execPath, [nextCliPath, ...nextArgs], {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_PUBLIC_SITE_MODE: siteMode,
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
