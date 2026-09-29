import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { readFileSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");

/**
 * Load `.grok/app-env.json` into `process.env` so Vite sees it at dev startup.
 * The platform injects this file in both preview and deploy; locally it's absent,
 * so we fall back to sensible defaults.
 */
try {
  const envPath = resolve(root, ".grok", "app-env.json");
  const raw = readFileSync(envPath, "utf-8");
  const env = JSON.parse(raw);
  for (const [k, v] of Object.entries(env)) {
    if (v !== undefined && v !== null && process.env[k] === undefined) {
      process.env[k] = String(v);
    }
  }
} catch {
  // No .grok/app-env.json (local dev without platform injection) — that's fine.
}

const viteArgs = process.argv.slice(3);
const result = spawnSync("vite", viteArgs, {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: process.env.NODE_ENV ?? "development" },
});
process.exit(result.status ?? 0);