/**
 * Player Name Storage Helper
 * Persists and retrieves the last entered player name from browser localStorage.
 * Migrates legacy `baseTypingGame.lastPlayerName.v1` to `ttg.lastPlayerName.v1`.
 *
 * Security & Classification:
 * - PLAYER_NAME_IS_NOT_AUTHENTICATION
 * - LOCAL_STORAGE_NAME_IS_NOT_A_CREDENTIAL
 * This stored value is strictly a convenience prefill mechanism (UX improvement)
 * and must never be treated as an authentication token, credential, or security identity.
 */

export const STORAGE_KEY_LAST_PLAYER_NAME = "ttg.lastPlayerName.v1";
export const LEGACY_STORAGE_KEY_LAST_PLAYER_NAME = "baseTypingGame.lastPlayerName.v1";

/**
 * Retrieves the last entered player name from browser localStorage.
 * Automatically migrates legacy key if found.
 * @param {Storage} [storage=window.localStorage]
 * @returns {string} Stored player name or empty string
 */
export function getLastPlayerName(storage = window.localStorage) {
  try {
    if (!storage) return "";

    // 1. Check new TTG key first
    const val = storage.getItem(STORAGE_KEY_LAST_PLAYER_NAME);
    if (typeof val === "string" && val.trim() !== "") {
      return val.trim();
    }

    // 2. Fallback: check legacy key and migrate safely
    const oldVal = storage.getItem(LEGACY_STORAGE_KEY_LAST_PLAYER_NAME);
    if (typeof oldVal === "string" && oldVal.trim() !== "") {
      const cleanOld = oldVal.trim();
      try {
        storage.setItem(STORAGE_KEY_LAST_PLAYER_NAME, cleanOld);
        storage.removeItem(LEGACY_STORAGE_KEY_LAST_PLAYER_NAME);
      } catch (writeErr) {
        console.warn("localStorage migration write failed:", writeErr);
      }
      return cleanOld;
    }

    return "";
  } catch (err) {
    // Graceful fallback for privacy modes, security restrictions, or disabled storage
    console.warn("localStorage read failed:", err);
    return "";
  }
}

/**
 * Persists the player name to browser localStorage under the new TTG key.
 * @param {string} name
 * @param {Storage} [storage=window.localStorage]
 */
export function setLastPlayerName(name, storage = window.localStorage) {
  try {
    if (!storage) return;
    const clean = typeof name === "string" ? name.trim() : "";
    if (clean) {
      storage.setItem(STORAGE_KEY_LAST_PLAYER_NAME, clean);
      // Clean up legacy key if it still lingered
      try {
        storage.removeItem(LEGACY_STORAGE_KEY_LAST_PLAYER_NAME);
      } catch {
        // Ignored
      }
    }
  } catch (err) {
    console.warn("localStorage write failed:", err);
  }
}

/**
 * Clears the stored player name from both new and legacy storage keys.
 * @param {Storage} [storage=window.localStorage]
 */
export function clearLastPlayerName(storage = window.localStorage) {
  try {
    if (!storage) return;
    storage.removeItem(STORAGE_KEY_LAST_PLAYER_NAME);
    try {
      storage.removeItem(LEGACY_STORAGE_KEY_LAST_PLAYER_NAME);
    } catch {
      // Ignored
    }
  } catch (err) {
    console.warn("localStorage clear failed:", err);
  }
}
