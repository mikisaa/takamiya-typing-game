import { BACKEND_CONFIG } from "./backendConfig.js";

/**
 * Pure Backend Validation & Security Sanitization Functions
 */

export function sanitizeSpreadsheetFormula(value) {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  if (
    trimmed.startsWith("=") ||
    trimmed.startsWith("+") ||
    trimmed.startsWith("-") ||
    trimmed.startsWith("@")
  ) {
    return `'${value}`;
  }
  return value;
}

export function normalizePlayerName(rawName) {
  if (typeof rawName !== "string") {
    return "";
  }
  // 1. Unicode NFKC normalization
  const nfkc = rawName.normalize("NFKC");
  // 2. Trim leading/trailing whitespace
  const trimmed = nfkc.trim();
  // 3. Collapse multiple whitespace and full-width space (\u3000) to single ASCII space
  const collapsed = trimmed.replace(/[\s\u3000]+/g, " ");
  // 4. Case-insensitive normalization for ASCII alphabet
  return collapsed.toLowerCase();
}

export function sanitizeDisplayName(rawName) {
  if (typeof rawName !== "string") {
    return "";
  }
  // NFKC, trim, collapse whitespace, but preserve case
  const nfkc = rawName.normalize("NFKC");
  const trimmed = nfkc.trim();
  return trimmed.replace(/[\s\u3000]+/g, " ");
}

export function validateSubmitScoreRequest(data) {
  const { LIMITS, ERROR_CODES, ALLOWED_MODES, ALLOWED_DIFFICULTIES, ALLOWED_STAGES } = BACKEND_CONFIG;

  if (!data || typeof data !== "object") {
    return { valid: false, code: ERROR_CODES.INVALID_REQUEST, message: "Request data must be an object." };
  }

  // Required SubmissionID
  if (!data.submissionId || typeof data.submissionId !== "string" || !data.submissionId.trim()) {
    return { valid: false, code: ERROR_CODES.MISSING_PARAMETER, message: "Missing or invalid submissionId." };
  }

  // Required PlayerName (replaces client-supplied playerId)
  if (data.playerName === undefined || data.playerName === null) {
    return { valid: false, code: ERROR_CODES.MISSING_PARAMETER, message: "Missing playerName parameter." };
  }
  if (typeof data.playerName !== "string") {
    return { valid: false, code: ERROR_CODES.INVALID_PLAYER_NAME, message: "Field playerName must be a string." };
  }

  const normalizedKey = normalizePlayerName(data.playerName);
  const displayName = sanitizeDisplayName(data.playerName);

  if (!normalizedKey || !displayName) {
    return { valid: false, code: ERROR_CODES.INVALID_PLAYER_NAME, message: "Player name cannot be empty or whitespace only." };
  }

  // Character length check (Unicode surrogate pair safe)
  const charLength = Array.from(displayName).length;
  if (charLength > LIMITS.MAX_PLAYER_NAME_LENGTH) {
    return {
      valid: false,
      code: ERROR_CODES.INVALID_PLAYER_NAME,
      message: `Player name exceeds maximum length of ${LIMITS.MAX_PLAYER_NAME_LENGTH} characters (got ${charLength}).`
    };
  }

  // Mode validation
  if (!data.mode || typeof data.mode !== "string") {
    return { valid: false, code: ERROR_CODES.MISSING_PARAMETER, message: "Missing mode parameter." };
  }
  const upperMode = data.mode.trim().toUpperCase();
  if (upperMode === "PRACTICE") {
    return { valid: false, code: ERROR_CODES.PRACTICE_MODE_NOT_RECORDED, message: "Practice mode scores are not persisted to database." };
  }
  if (!ALLOWED_MODES.includes(upperMode)) {
    return { valid: false, code: ERROR_CODES.INVALID_REQUEST, message: `Invalid game mode: ${data.mode}. Only PRODUCTION is accepted.` };
  }

  // Difficulty validation
  if (!data.difficulty || typeof data.difficulty !== "string") {
    return { valid: false, code: ERROR_CODES.MISSING_PARAMETER, message: "Missing difficulty parameter." };
  }
  const upperDiff = data.difficulty.trim().toUpperCase();
  if (!ALLOWED_DIFFICULTIES.includes(upperDiff)) {
    return { valid: false, code: ERROR_CODES.INVALID_DIFFICULTY, message: `Invalid difficulty: ${data.difficulty}. Allowed: ${ALLOWED_DIFFICULTIES.join(", ")}.` };
  }

  // Reached Stage validation
  if (!data.reachedStage || typeof data.reachedStage !== "string") {
    return { valid: false, code: ERROR_CODES.MISSING_PARAMETER, message: "Missing reachedStage parameter." };
  }
  const upperStage = data.reachedStage.trim().toUpperCase();
  if (!ALLOWED_STAGES.includes(upperStage)) {
    return { valid: false, code: ERROR_CODES.INVALID_STAGE, message: `Invalid reachedStage: ${data.reachedStage}. Allowed: ${ALLOWED_STAGES.join(", ")}.` };
  }

  // Helper for numeric boundary validation
  function validateNumber(val, min, max, name, isInteger = true) {
    if (typeof val !== "number" || isNaN(val) || !isFinite(val)) {
      return { valid: false, code: ERROR_CODES.NUMERIC_OUT_OF_BOUNDS, message: `Field ${name} must be a valid finite number.` };
    }
    if (isInteger && !Number.isInteger(val)) {
      return { valid: false, code: ERROR_CODES.NUMERIC_OUT_OF_BOUNDS, message: `Field ${name} must be an integer.` };
    }
    if (val < min || val > max) {
      return { valid: false, code: ERROR_CODES.NUMERIC_OUT_OF_BOUNDS, message: `Field ${name} (${val}) out of allowed bounds [${min}, ${max}].` };
    }
    return { valid: true };
  }

  // Validate all numeric metric fields
  const scoreCheck = validateNumber(data.score, LIMITS.MIN_SCORE, LIMITS.MAX_SCORE, "score", true);
  if (!scoreCheck.valid) return scoreCheck;

  const correctCheck = validateNumber(data.correctCount, LIMITS.MIN_CORRECT_COUNT, LIMITS.MAX_CORRECT_COUNT, "correctCount", true);
  if (!correctCheck.valid) return correctCheck;

  const charsCheck = validateNumber(data.typedCharacters, LIMITS.MIN_TYPED_CHARACTERS, LIMITS.MAX_TYPED_CHARACTERS, "typedCharacters", true);
  if (!charsCheck.valid) return charsCheck;

  const mistakesCheck = validateNumber(data.typingMistakes, LIMITS.MIN_TYPING_MISTAKES, LIMITS.MAX_TYPING_MISTAKES, "typingMistakes", true);
  if (!mistakesCheck.valid) return mistakesCheck;

  const missCheck = validateNumber(data.missCount, LIMITS.MIN_MISS_COUNT, LIMITS.MAX_MISS_COUNT, "missCount", true);
  if (!missCheck.valid) return missCheck;

  const accCheck = validateNumber(data.accuracy, LIMITS.MIN_ACCURACY, LIMITS.MAX_ACCURACY, "accuracy", false);
  if (!accCheck.valid) return accCheck;

  const comboCheck = validateNumber(data.maxCombo, LIMITS.MIN_MAX_COMBO, LIMITS.MAX_MAX_COMBO, "maxCombo", true);
  if (!comboCheck.valid) return comboCheck;

  const wpmCheck = validateNumber(data.wpm, LIMITS.MIN_WPM, LIMITS.MAX_WPM, "wpm", false);
  if (!wpmCheck.valid) return wpmCheck;

  const kpmCheck = validateNumber(data.kpm, LIMITS.MIN_KPM, LIMITS.MAX_KPM, "kpm", false);
  if (!kpmCheck.valid) return kpmCheck;

  return { valid: true, sanitized: {
    submissionId: sanitizeSpreadsheetFormula(data.submissionId.trim()),
    playerName: sanitizeSpreadsheetFormula(displayName),
    playerNameKey: normalizedKey,
    rawPlayerName: displayName,
    mode: upperMode,
    difficulty: upperDiff,
    score: data.score,
    correctCount: data.correctCount,
    typedCharacters: data.typedCharacters,
    typingMistakes: data.typingMistakes,
    missCount: data.missCount,
    accuracy: Number(data.accuracy.toFixed(2)),
    maxCombo: data.maxCombo,
    wpm: Number(data.wpm.toFixed(1)),
    kpm: Number(data.kpm.toFixed(1)),
    reachedStage: upperStage,
    startedAtClient: data.startedAt ? sanitizeSpreadsheetFormula(String(data.startedAt)) : "",
    finishedAtClient: data.finishedAt ? sanitizeSpreadsheetFormula(String(data.finishedAt)) : "",
    appVersion: data.appVersion ? sanitizeSpreadsheetFormula(String(data.appVersion)) : "1.0.0"
  }};
}

/**
 * Validates query parameters for getRankings operation.
 * @param {Object} query
 * @returns {{ valid: boolean, code?: string, message?: string, sanitized?: Object }}
 */
export function validateGetRankingsQuery(query = {}) {
  const { ERROR_CODES, ALLOWED_PERIODS, ALLOWED_DIFFICULTIES, LIMITS } = BACKEND_CONFIG;

  if (!query || typeof query !== "object") {
    return { valid: false, code: ERROR_CODES.INVALID_REQUEST, message: "Query parameters must be an object." };
  }

  // Period
  const rawPeriod = query.period ? String(query.period).trim().toUpperCase() : "MONTHLY";
  if (!ALLOWED_PERIODS.includes(rawPeriod)) {
    return {
      valid: false,
      code: ERROR_CODES.INVALID_PERIOD,
      message: `Invalid period: ${query.period}. Allowed: ${ALLOWED_PERIODS.join(", ")}.`
    };
  }

  // Difficulty
  const rawDiff = query.difficulty ? String(query.difficulty).trim().toUpperCase() : "BEGINNER";
  if (!ALLOWED_DIFFICULTIES.includes(rawDiff)) {
    return {
      valid: false,
      code: ERROR_CODES.INVALID_DIFFICULTY,
      message: `Invalid difficulty: ${query.difficulty}. Allowed: ${ALLOWED_DIFFICULTIES.join(", ")}.`
    };
  }

  // Limit (default 10, bounds 1..100)
  let limit = LIMITS.DEFAULT_RANKING_LIMIT;
  if (query.limit !== undefined && query.limit !== null && String(query.limit).trim() !== "") {
    const numLimit = Number(query.limit);
    if (!Number.isInteger(numLimit) || numLimit < LIMITS.MIN_RANKING_LIMIT || numLimit > LIMITS.MAX_RANKING_LIMIT) {
      return {
        valid: false,
        code: ERROR_CODES.INVALID_LIMIT,
        message: `Field limit must be an integer between ${LIMITS.MIN_RANKING_LIMIT} and ${LIMITS.MAX_RANKING_LIMIT}.`
      };
    }
    limit = numLimit;
  }

  // Optional Player Name
  let playerName = null;
  let playerNameKey = null;
  if (query.playerName !== undefined && query.playerName !== null && String(query.playerName).trim() !== "") {
    if (typeof query.playerName !== "string") {
      return {
        valid: false,
        code: ERROR_CODES.INVALID_PLAYER_NAME,
        message: "Field playerName must be a string."
      };
    }

    const trimmed = query.playerName.trim();
    const charLen = Array.from(trimmed).length;
    if (charLen > LIMITS.MAX_PLAYER_NAME_LENGTH) {
      return {
        valid: false,
        code: ERROR_CODES.INVALID_PLAYER_NAME,
        message: `Player name exceeds maximum length of ${LIMITS.MAX_PLAYER_NAME_LENGTH} characters.`
      };
    }

    playerName = sanitizeDisplayName(query.playerName);
    playerNameKey = normalizePlayerName(query.playerName);
  }

  return {
    valid: true,
    sanitized: {
      period: rawPeriod,
      difficulty: rawDiff,
      limit: limit,
      playerName: playerName,
      playerNameKey: playerNameKey
    }
  };
}

