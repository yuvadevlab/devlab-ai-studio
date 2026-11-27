/**
 * @file apps/web/src/lib/jwt.ts
 * @description Edge-safe JWT expiration check without React runtime dependencies.
 * @module @devlab-ai-studio/web/lib/jwt
 */

/** Returns true if a JWT token is malformed or past its `exp` claim. */
export function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return true;
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded)) as { exp?: number };
    if (typeof payload.exp !== "number") return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}
