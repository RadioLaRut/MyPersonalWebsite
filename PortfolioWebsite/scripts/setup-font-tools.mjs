import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const environmentRoot = path.join(projectRoot, ".cache/font-tools");
const pythonPath = process.platform === "win32"
  ? path.join(environmentRoot, "Scripts/python.exe")
  : path.join(environmentRoot, "bin/python");

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`${command} 执行失败`);
  }
}

if (!fs.existsSync(pythonPath)) {
  fs.mkdirSync(path.dirname(environmentRoot), { recursive: true });
  run(process.env.PYTHON_BIN || "python3", ["-m", "venv", environmentRoot]);
}

run(pythonPath, [
  "-m",
  "pip",
  "install",
  "--disable-pip-version-check",
  "--requirement",
  path.join(projectRoot, "requirements-fonts.txt"),
]);

run(pythonPath, [
  "-c",
  "import fontTools; assert fontTools.__version__ == '4.63.0'; print('FontTools 4.63.0 已就绪')",
]);
