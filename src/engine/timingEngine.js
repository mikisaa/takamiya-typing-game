import { GAME_CONFIG } from "../config/gameConfig.js";

/**
 * Normalizes difficulty key to lowercase canonical form (beginner, intermediate, advanced)
 * @param {string} key
 * @returns {string}
 */
export function normalizeDifficultyKey(key) {
  if (typeof key !== "string") {
    throw new Error(`Invalid difficulty type: expected string, got ${typeof key}`);
  }
  const normalized = key.trim().toLowerCase();
  if (normalized === "初級") return "beginner";
  if (normalized === "中級") return "intermediate";
  if (normalized === "上級") return "advanced";
  return normalized;
}

/**
 * Gets difficulty configuration object from GAME_CONFIG
 * @param {string} difficultyKey
 * @param {object} [config=GAME_CONFIG]
 * @returns {object}
 */
export function getDifficultyConfig(difficultyKey, config = GAME_CONFIG) {
  const normKey = normalizeDifficultyKey(difficultyKey);
  const diffConfig = config?.difficulties?.[normKey];
  if (!diffConfig) {
    const validKeys = Object.keys(config?.difficulties || {}).join(", ");
    throw new Error(`Unknown difficulty: "${difficultyKey}" (valid: ${validKeys})`);
  }
  return diffConfig;
}

/**
 * Dynamic Timing Engine
 * Calculates allowed forklift travel time for a single question based on difficulty and effective keystrokes.
 *
 * Formula:
 *   rawAllowedTime = reactionAllowance + (effectiveKeystrokes / targetKps)
 *   allowedTime = Math.min(Math.max(rawAllowedTime, minAllowedTime), maxAllowedTime)
 *   if (isPractice) allowedTime = allowedTime * practiceMultiplier
 *
 * @param {string} difficultyKey - "beginner" | "intermediate" | "advanced" (case-insensitive)
 * @param {number} effectiveKeystrokes - number of canonical keystrokes required
 * @param {boolean} [isPractice=false] - whether in practice mode
 * @param {object} [config=GAME_CONFIG] - game config object
 * @returns {number} allowed time in seconds (rounded to 2 decimal places)
 */
export function calculateAllowedTime(difficultyKey, effectiveKeystrokes, isPractice = false, config = GAME_CONFIG) {
  if (typeof effectiveKeystrokes !== "number" || !Number.isFinite(effectiveKeystrokes) || effectiveKeystrokes <= 0) {
    throw new Error(`Invalid effectiveKeystrokes: must be a positive finite number, got ${effectiveKeystrokes}`);
  }

  const diffConfig = getDifficultyConfig(difficultyKey, config);
  const { targetKps, reactionAllowance, minAllowedTime, maxAllowedTime } = diffConfig;

  if (typeof targetKps !== "number" || targetKps <= 0) {
    throw new Error(`Invalid targetKps in config for difficulty "${difficultyKey}"`);
  }

  // 1. Calculate raw allowed time
  const rawAllowedTime = reactionAllowance + (effectiveKeystrokes / targetKps);

  // 2. Clamp between min and max allowed time
  let allowedTime = Math.min(Math.max(rawAllowedTime, minAllowedTime), maxAllowedTime);

  // 3. Apply practice mode multiplier if practice
  if (isPractice) {
    const multiplier = config?.practiceMultiplier ?? 1.5;
    allowedTime = allowedTime * multiplier;
  }

  // 4. Return deterministic value rounded to 2 decimal places
  return Number(allowedTime.toFixed(2));
}
