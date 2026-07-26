import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import { buildNextArguments } from "./local-dev-host-policy.mjs";

const [, , siteMode, ...nextArgs] = process.argv;

if (!siteMode || nextArgs.length === 0) {
  console.error("Usage: node scripts/run-next-with-mode.mjs <site-mode> <next-args...>");
  process.exit(1);
}

const nextCliPath = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
let effectiveNextArgs;

try {
  effectiveNextArgs = buildNextArguments(siteMode, nextArgs);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Invalid Next.js arguments");
  process.exit(1);
}

const child = spawn(process.execPath, [nextCliPath, ...effectiveNextArgs], {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_PUBLIC_SITE_MODE: siteMode,
  },
});

const fontWatcher = nextArgs[0] === "dev"
  ? spawn(
    process.execPath,
    [fileURLToPath(new URL("./watch-font-subsets.mjs", import.meta.url))],
    {
      stdio: "inherit",
      env: process.env,
    },
  )
  : null;
const publicRuntimeWatcher = nextArgs[0] === "dev"
  ? spawn(
    process.execPath,
    [fileURLToPath(new URL("./watch-public-runtime.mjs", import.meta.url))],
    {
      stdio: "inherit",
      env: process.env,
    },
  )
  : null;
let isShuttingDown = false;

function stopChildren(signal = "SIGTERM") {
  if (isShuttingDown) return;
  isShuttingDown = true;
  fontWatcher?.kill(signal);
  publicRuntimeWatcher?.kill(signal);
  child.kill(signal);
}

process.once("SIGINT", () => stopChildren("SIGINT"));
process.once("SIGTERM", () => stopChildren("SIGTERM"));

fontWatcher?.on("exit", (code, signal) => {
  if (isShuttingDown || signal || code === 0) return;
  console.error(`公开字体监听器异常退出，状态码 ${code ?? 1}`);
  stopChildren();
});

publicRuntimeWatcher?.on("exit", (code, signal) => {
  if (isShuttingDown || signal || code === 0) return;
  console.error(`公开 renderer 清单监听器异常退出，状态码 ${code ?? 1}`);
  stopChildren();
});

child.on("exit", (code, signal) => {
  fontWatcher?.kill("SIGTERM");
  publicRuntimeWatcher?.kill("SIGTERM");
  if (signal) {
    process.exitCode = 1;
    return;
  }

  process.exitCode = code ?? 1;
});
