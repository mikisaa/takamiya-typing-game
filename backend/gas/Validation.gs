/**
 * TakamiyaTypingGame Backend — Request Validation
 */

function normalizePlayerName(rawName) {
  if (typeof rawName !== "string") {
    return "";
  }
  // 1. Unicode NFKC normalization (Google Apps Script V8 runtime supports String.prototype.normalize)
  var nfkc = rawName.normalize("NFKC");
  // 2. Trim leading/trailing whitespace
  var trimmed = nfkc.trim();
  // 3. Collapse multiple whitespace and full-width space (\u3000) to single ASCII space
  var collapsed = trimmed.replace(/[\s\u3000]+/g, " ");
  // 4. Case-insensitive normalization for ASCII alphabet
  return collapsed.toLowerCase();
}

function sanitizeDisplayName(rawName) {
  if (typeof rawName !== "string") {
    return "";
  }
  var nfkc = rawName.normalize("NFKC");
  var trimmed = nfkc.trim();
  return trimmed.replace(/[\s\u3000]+/g, " ");
}

function validateScoreSubmissionPayload(data) {
  var limits = CONFIG.LIMITS;
  var codes = CONFIG.ERROR_CODES;

  if (!data || typeof data !== "object") {
    return { valid: false, code: codes.INVALID_REQUEST, message: "Request data must be an object." };
  }

  // SubmissionID
  if (!data.submissionId || typeof data.submissionId !== "string" || !data.submissionId.trim()) {
    return { valid: false, code: codes.MISSING_PARAMETER, message: "Missing or invalid submissionId." };
  }

  // PlayerName (replaces client-supplied playerId)
  if (data.playerName === undefined || data.playerName === null) {
    return { valid: false, code: codes.MISSING_PARAMETER, message: "Missing playerName parameter." };
  }
  if (typeof data.playerName !== "string") {
    return { valid: false, code: codes.INVALID_PLAYER_NAME, message: "Field playerName must be a string." };
  }

  var normalizedKey = normalizePlayerName(data.playerName);
  var displayName = sanitizeDisplayName(data.playerName);

  if (!normalizedKey || !displayName) {
    return { valid: false, code: codes.INVALID_PLAYER_NAME, message: "Player name cannot be empty or whitespace only." };
  }

  // Character length check (Unicode surrogate pair safe using Array.from)
  var charLength = Array.from(displayName).length;
  if (charLength > limits.MAX_PLAYER_NAME_LENGTH) {
    return {
      valid: false,
      code: codes.INVALID_PLAYER_NAME,
      message: "Player name exceeds maximum length of " + limits.MAX_PLAYER_NAME_LENGTH + " characters (got " + charLength + ")."
    };
  }

  // Mode
  if (!data.mode || typeof data.mode !== "string") {
    return { valid: false, code: codes.MISSING_PARAMETER, message: "Missing mode parameter." };
  }
  var upperMode = data.mode.trim().toUpperCase();
  if (upperMode === "PRACTICE") {
    return { valid: false, code: codes.PRACTICE_MODE_NOT_RECORDED, message: "Practice mode scores are not persisted to database." };
  }
  if (CONFIG.ALLOWED_MODES.indexOf(upperMode) === -1) {
    return { valid: false, code: codes.INVALID_REQUEST, message: "Invalid mode. Only PRODUCTION is accepted." };
  }

  // Difficulty
  if (!data.difficulty || typeof data.difficulty !== "string") {
    return { valid: false, code: codes.MISSING_PARAMETER, message: "Missing difficulty parameter." };
  }
  var upperDiff = data.difficulty.trim().toUpperCase();
  if (CONFIG.ALLOWED_DIFFICULTIES.indexOf(upperDiff) === -1) {
    return { valid: false, code: codes.INVALID_DIFFICULTY, message: "Invalid difficulty: " + data.difficulty };
  }

  // Reached Stage
  if (!data.reachedStage || typeof data.reachedStage !== "string") {
    return { valid: false, code: codes.MISSING_PARAMETER, message: "Missing reachedStage parameter." };
  }
  var upperStage = data.reachedStage.trim().toUpperCase();
  if (CONFIG.ALLOWED_STAGES.indexOf(upperStage) === -1) {
    return { valid: false, code: codes.INVALID_STAGE, message: "Invalid reachedStage: " + data.reachedStage };
  }

  function checkNum(val, min, max, name, isInt) {
    if (typeof val !== "number" || isNaN(val) || !isFinite(val)) {
      return { valid: false, code: codes.NUMERIC_OUT_OF_BOUNDS, message: name + " must be a valid finite number." };
    }
    if (isInt && Math.floor(val) !== val) {
      return { valid: false, code: codes.NUMERIC_OUT_OF_BOUNDS, message: name + " must be an integer." };
    }
    if (val < min || val > max) {
      return { valid: false, code: codes.NUMERIC_OUT_OF_BOUNDS, message: name + " out of allowed bounds [" + min + ", " + max + "]." };
    }
    return { valid: true };
  }

  var checks = [
    checkNum(data.score, limits.MIN_SCORE, limits.MAX_SCORE, "score", true),
    checkNum(data.correctCount, limits.MIN_CORRECT_COUNT, limits.MAX_CORRECT_COUNT, "correctCount", true),
    checkNum(data.typedCharacters, limits.MIN_TYPED_CHARACTERS, limits.MAX_TYPED_CHARACTERS, "typedCharacters", true),
    checkNum(data.typingMistakes, limits.MIN_TYPING_MISTAKES, limits.MAX_TYPING_MISTAKES, "typingMistakes", true),
    checkNum(data.missCount, limits.MIN_MISS_COUNT, limits.MAX_MISS_COUNT, "missCount", true),
    checkNum(data.accuracy, limits.MIN_ACCURACY, limits.MAX_ACCURACY, "accuracy", false),
    checkNum(data.maxCombo, limits.MIN_MAX_COMBO, limits.MAX_MAX_COMBO, "maxCombo", true),
    checkNum(data.wpm, limits.MIN_WPM, limits.MAX_WPM, "wpm", false),
    checkNum(data.kpm, limits.MIN_KPM, limits.MAX_KPM, "kpm", false)
  ];

  for (var i = 0; i < checks.length; i++) {
    if (!checks[i].valid) {
      return checks[i];
    }
  }

  return {
    valid: true,
    sanitized: {
      submissionId: data.submissionId.trim(),
      playerName: sanitizeFormulaValue(displayName),
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
      startedAtClient: String(data.startedAt || ""),
      finishedAtClient: String(data.finishedAt || ""),
      appVersion: String(data.appVersion || "1.0.0")
    }
  };
}

function validateGetRankingsQuery(params) {
  var limits = CONFIG.LIMITS;
  var codes = CONFIG.ERROR_CODES;

  if (!params || typeof params !== "object") {
    return { valid: false, code: codes.INVALID_REQUEST, message: "Query parameters must be an object." };
  }

  // Period
  var rawPeriod = params.period ? String(params.period).trim().toUpperCase() : "MONTHLY";
  if (CONFIG.ALLOWED_PERIODS.indexOf(rawPeriod) === -1) {
    return {
      valid: false,
      code: codes.INVALID_PERIOD,
      message: "Invalid period: " + params.period + ". Allowed: " + CONFIG.ALLOWED_PERIODS.join(", ") + "."
    };
  }

  // Difficulty
  var rawDiff = params.difficulty ? String(params.difficulty).trim().toUpperCase() : "BEGINNER";
  if (CONFIG.ALLOWED_DIFFICULTIES.indexOf(rawDiff) === -1) {
    return {
      valid: false,
      code: codes.INVALID_DIFFICULTY,
      message: "Invalid difficulty: " + params.difficulty + ". Allowed: " + CONFIG.ALLOWED_DIFFICULTIES.join(", ") + "."
    };
  }

  // Limit (default 10, bounds 1..100)
  var limit = limits.DEFAULT_RANKING_LIMIT;
  if (params.limit !== undefined && params.limit !== null && String(params.limit).trim() !== "") {
    var numLimit = Number(params.limit);
    if (isNaN(numLimit) || Math.floor(numLimit) !== numLimit || numLimit < limits.MIN_RANKING_LIMIT || numLimit > limits.MAX_RANKING_LIMIT) {
      return {
        valid: false,
        code: codes.INVALID_LIMIT,
        message: "Field limit must be an integer between " + limits.MIN_RANKING_LIMIT + " and " + limits.MAX_RANKING_LIMIT + "."
      };
    }
    limit = numLimit;
  }

  // Optional Player Name
  var playerName = null;
  var playerNameKey = null;
  if (params.playerName !== undefined && params.playerName !== null && String(params.playerName).trim() !== "") {
    if (typeof params.playerName !== "string") {
      return {
        valid: false,
        code: codes.INVALID_PLAYER_NAME,
        message: "Field playerName must be a string."
      };
    }

    var trimmed = params.playerName.trim();
    var charLen = Array.from(trimmed).length;
    if (charLen > limits.MAX_PLAYER_NAME_LENGTH) {
      return {
        valid: false,
        code: codes.INVALID_PLAYER_NAME,
        message: "Player name exceeds maximum length of " + limits.MAX_PLAYER_NAME_LENGTH + " characters."
      };
    }

    playerName = sanitizeDisplayName(params.playerName);
    playerNameKey = normalizePlayerName(params.playerName);
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

