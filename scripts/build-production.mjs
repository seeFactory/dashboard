import { spawnSync } from "node:child_process";

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const apiBase = process.env.VITE_SEEFACTORY_API_BASE || process.env.VITE_API_BASE || "https://api.seefactory.xyz/api/v1";

const env = {
  ...process.env,
  VITE_SEEFACTORY_API_BASE: apiBase,
  VITE_API_BASE: apiBase
};

const result = spawnSync(pnpm, ["build"], {
  stdio: "inherit",
  env,
  shell: process.platform === "win32"
});

if (result.status !== 0) {
  if (result.error) {
    console.error(result.error);
  }
  process.exit(result.status || 1);
}
