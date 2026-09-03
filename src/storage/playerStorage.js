/**
 * Player Name Storage Helper
 * Persists and retrieves the last entered player name from browser localStorage.
 *
 * Security & Classification:
 * - PLAYER_NAME_IS_NOT_AUTHENTICATION
 * - LOCAL_STORAGE_NAME_IS_NOT_A_CREDENTIAL
 * This stored value is strictly a convenience prefill mechanism (UX improvement)
 * and must never be treated as an authentication token, credential, or security identity.
 */

export const STORAGE_KEY_LAST_PLAYER_NAME = "baseTypingGame.lastPlayerName.v1";

export function getLastPlayerName(storage = window.localStorage) {
  try {
    if (!storage) return "";
    const val = storage.getItem(STORAGE_KEY_LAST_PLAYER_NAME);
    if (typeof val === "string") {
      return val.trim();
    }
    return "";
  } catch (err) {
    // Graceful fallback for privacy modes, security restrictions, or disabled storage
    console.warn("localStorage read failed:", err);
    return "";
  }
}

export function setLastPlayerName(name, storage = window.localStorage) {
  try {
    if (!storage) return;
    const clean = typeof name === "string" ? name.trim() : "";
    if (clean) {
      storage.setItem(STORAGE_KEY_LAST_PLAYER_NAME, clean);
    }
  } catch (err) {
    console.warn("localStorage write failed:", err);
  }
}

export function clearLastPlayerName(storage = window.localStorage) {
  try {
    if (!storage) return;
    storage.removeItem(STORAGE_KEY_LAST_PLAYER_NAME);
  } catch (err) {
    console.warn("localStorage clear failed:", err);
  }
}
