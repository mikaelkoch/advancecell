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
if (!databaseUrl) {
  console.error("DATABASE_URL not set — cannot run migrations");
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const doneRows = await pool.query("SELECT name FROM _migrations");
  const done = new Set(doneRows.rows.map((r) => r.name));

  const files = globSync("migrations/*.sql", { cwd: root, absolute: true })
    .sort((a, b) => a.localeCompare(b));

  for (const file of files) {
    const name = file.split(/[\\/]/).pop();
    if (name.startsWith("0001_") === false) continue; // only run 0001_ for now
    if (done.has(name)) continue;

    const sql = readFileSync(file, "utf-8");
    console.log(`Applying migration: ${name}`);
    await pool.query(sql);
    await pool.query("INSERT INTO _migrations (name) VALUES ($1)", [name]);
    console.log(`Applied: ${name}`);
  }

  await pool.end();
  console.log("Migrations complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});