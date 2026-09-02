/**
 * Base Typing Game Backend — Request Validation
 */

function validateScoreSubmissionPayload(data) {
  var limits = CONFIG.LIMITS;
  var codes = CONFIG.ERROR_CODES;

  if (!data || typeof data !== "object") {
    return { valid: false, code: codes.INVALID_REQUEST, message: "Request data must be an object." };
  }

  // String IDs
  if (!data.submissionId || typeof data.submissionId !== "string" || !data.submissionId.trim()) {
    return { valid: false, code: codes.MISSING_PARAMETER, message: "Missing or invalid submissionId." };
  }
  if (!data.playerId || typeof data.playerId !== "string" || !data.playerId.trim()) {
    return { valid: false, code: codes.MISSING_PARAMETER, message: "Missing or invalid playerId." };
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
      playerId: data.playerId.trim(),
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
