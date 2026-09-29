/**
 * Run migrations against the Neon database (production).
 * Loads DATABASE_URL from env, applies all pending migrations/*.sql.
 */
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { Pool, types } from "pg";
import { readFileSync } from "node:fs";
import { globSync } from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");

const OID_INT8 = 20;
const OID_DATE = 1082;
const OID_INTERVAL = 1186;
const identity = (v) => v;

types.setTypeParser(OID_INT8, Number);
types.setTypeParser(OID_DATE, identity);
types.setTypeParser(OID_INTERVAL, identity);

const databaseUrl = process.env.DATABASE_URL?.trim();

// Diagnostic logging (no secrets)
console.log("[migrate] DATABASE_URL exists:", !!databaseUrl);
if (databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    console.log("[migrate] protocol:", url.protocol);
    console.log("[migrate] hostname:", url.hostname?.replace(/./g, '*') || 'unknown');
    console.log("[migrate] port:", url.port || 'default');
    console.log("[migrate] database:", url.pathname?.slice(1) || 'unknown');
    console.log("[migrate] search params:", url.search?.slice(0, 100) || 'none');
  } catch (e) {
    console.log("[migrate] DATABASE_URL parse failed:", e.message);
  }
}

if (!databaseUrl) {
  console.error("DATABASE_URL not set — cannot run migrations");
  process.exit(1);
}

console.log("[migrate] Creating connection pool...");
const pool = new Pool({ connectionString: databaseUrl });

pool.on('error', (err) => {
  console.error("[migrate] Unexpected pool error:", err.message);
});

async function main() {
  console.log("[migrate] Testing connection...");
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    console.log("[migrate] _migrations table ready");
  } catch (e) {
    console.error("[migrate] Failed to create _migrations table:", e.message);
    throw e;
  }

  const doneRows = await pool.query("SELECT name FROM _migrations");
  console.log("[migrate] Existing migrations:", doneRows.rows.map(r => r.name).join(', ') || 'none');
  const done = new Set(doneRows.rows.map((r) => r.name));

  const files = globSync("migrations/*.sql", { cwd: root, absolute: true })
    .sort((a, b) => a.localeCompare(b));

  for (const file of files) {
    const name = file.split(/[\\/]/).pop();
    if (name.startsWith("0001_") === false) {
      console.log(`[migrate] Skipping ${name} (not 0001_)`);
      continue;
    }
    if (done.has(name)) {
      console.log(`[migrate] Skipping ${name} (already applied)`);
      continue;
    }

    console.log(`[migrate] Reading migration file: ${name}`);
    const sql = readFileSync(file, "utf-8");
    console.log(`[migrate] Applying migration: ${name}`);
    try {
      await pool.query(sql);
      await pool.query("INSERT INTO _migrations (name) VALUES ($1)", [name]);
      console.log(`[migrate] Applied: ${name}`);
    } catch (e) {
      console.error(`[migrate] Failed to apply ${name}:`, e.message);
      throw e;
    }
  }

  console.log("[migrate] Closing pool...");
  await pool.end();
  console.log("Migrations complete");
}

main().catch((err) => {
  console.error("[migrate] FATAL ERROR:");
  console.error("  message:", err.message);
  console.error("  code:", err.code);
  console.error("  errno:", err.errno);
  console.error("  syscall:", err.syscall);
  console.error("  stack:", err.stack);
  process.exit(1);
});