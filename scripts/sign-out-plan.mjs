/**
 * Sign-out sequence for the preview (bearer token) and deployed (cookie) paths.
 * Exported as a function so it can be unit-tested without a browser.
 */
export async function runPreSignInSignOut({ livePreview, hasBearer, requestSignOut, clearToken }) {
  // Clear any prior session so switching providers actually switches identity.
  if (livePreview) {
    // In preview, local clear is sufficient
    clearToken();
  } else {
    await requestSignOut();
  }
}

export async function runSignOut({ livePreview, hasBearer, requestSignOut, clearToken, redirect }) {
  // 1. Clear local state first
  if (livePreview && hasBearer) {
    clearToken();
  }

  // 2. Ask server to clear cookie (deployed) — may fail if session already gone
  try {
    await requestSignOut();
  } catch (e) {
    // Deployed: if server says session gone, that's fine — we redirect anyway
    console.warn("Sign-out request failed (session may already be gone):", e?.message);
  }

  // 3. Clear local bearer token
  clearToken();

  // 4. Redirect
  redirect();
}