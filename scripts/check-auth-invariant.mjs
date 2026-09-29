/**
 * Auth invariant check - ensures auth config is valid.
 */
const env = (key) => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

const authDisabled = env("VITE_AUTH_ENABLED") === "false";

const grokClientId = env("GROK_AUTH_CLIENT_ID");
const grokClientSecret = env("GROK_AUTH_CLIENT_SECRET");

const authConfigured = !authDisabled && Boolean(grokClientId && grokClientSecret);

console.log("Auth check:");
console.log("  VITE_AUTH_ENABLED:", env("VITE_AUTH_ENABLED") ?? "unset (defaults to true)");
console.log("  Auth disabled:", authDisabled);
console.log("  GROK_AUTH_CLIENT_ID:", grokClientId ? "set" : "unset");
console.log("  GROK_AUTH_CLIENT_SECRET:", grokClientSecret ? "set" : "unset");
console.log("  Auth configured (federated):", authConfigured);

if (!authConfigured && !env("DATABASE_URL")) {
  console.warn("WARNING: Auth is not configured and no DATABASE_URL is set.");
  console.warn("Email/password auth is enabled but needs DATABASE_URL for production.");
}

console.log("Auth invariant check passed");
process.exit(0);