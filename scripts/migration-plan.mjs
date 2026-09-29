/**
 * Migration plan for the embedded PGLite DB (preview / dev).
 * Returns the list of migration files that still need to be applied.
 * The SQL files live in `migrations/*.sql` and are bundled at build time.
 */
export function pendingMigrations(available, done) {
  const doneSet = new Set(done);
  return available
    .filter((name) => !doneSet.has(name))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ name, path: `/migrations/${name}` }));
}