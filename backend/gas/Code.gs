/**
 * Base Typing Game Backend — Main Entry Point Router
 * Google Apps Script Web App
 */

function doGet(e) {
  try {
    var op = (e && e.parameter && e.parameter.op) ? String(e.parameter.op).trim() : "health";

    if (op === "health") {
      return createSuccessResponse({
        service: CONFIG.SERVICE_NAME,
        schemaVersion: CONFIG.SCHEMA_VERSION,
        timezone: CONFIG.TIMEZONE,
        serverTime: Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX")
      });
    }

    if (op === "getPlayers") {
      var players = getEnabledPlayersList();
      return createSuccessResponse({
        players: players
      });
    }

    return createErrorResponse(CONFIG.ERROR_CODES.INVALID_REQUEST, "Unknown GET operation: " + op);
  } catch (err) {
    return createErrorResponse(CONFIG.ERROR_CODES.INTERNAL_ERROR, "Server error processing GET request: " + err.message);
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createErrorResponse(CONFIG.ERROR_CODES.INVALID_REQUEST, "Empty POST request body.");
    }

    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return createErrorResponse(CONFIG.ERROR_CODES.INVALID_REQUEST, "Malformed JSON request body.");
    }

    var op = payload.op ? String(payload.op).trim() : "";
    if (op !== "submitScore") {
      return createErrorResponse(CONFIG.ERROR_CODES.INVALID_REQUEST, "Unsupported POST operation: " + op);
    }

    return handleSubmitScoreOperation(payload.data || payload);
  } catch (err) {
    return createErrorResponse(CONFIG.ERROR_CODES.INTERNAL_ERROR, "Server error processing POST request: " + err.message);
  }
}

function handleSubmitScoreOperation(data) {
  // 1. Validation
  var valResult = validateScoreSubmissionPayload(data);
  if (!valResult.valid) {
    return createErrorResponse(valResult.code, valResult.message);
  }

  var sanitized = valResult.sanitized;
  var ss = getDatabaseSpreadsheet();

  // 2. Validate Player in Master
  var playerRecord = findPlayerRecord(sanitized.playerId, ss);
  if (!playerRecord) {
    return createErrorResponse(CONFIG.ERROR_CODES.PLAYER_NOT_FOUND, "Player with ID '" + sanitized.playerId + "' not found in master.");
  }
  if (!playerRecord.enabled) {
    return createErrorResponse(CONFIG.ERROR_CODES.PLAYER_DISABLED, "Player '" + playerRecord.playerName + "' is disabled.");
  }

  // 3. Early Idempotent Duplicate Check
  var existingBeforeLock = findScoreBySubmissionId(sanitized.submissionId, ss);
  if (existingBeforeLock) {
    return createSuccessResponse({
      duplicate: true,
      scoreId: existingBeforeLock.scoreId,
      submissionId: existingBeforeLock.submissionId,
      message: "Score with this submissionId already recorded."
    });
  }

  // 4. Lock Acquisition
  var lock = LockService.getScriptLock();
  var lockAcquired = false;
  try {
    lockAcquired = lock.tryLock(CONFIG.LIMITS.LOCK_TIMEOUT_MS);
  } catch (lockErr) {
    lockAcquired = false;
  }

  if (!lockAcquired) {
    return createErrorResponse(CONFIG.ERROR_CODES.LOCK_TIMEOUT, "Server is busy processing concurrent score submissions. Please retry.");
  }

  try {
    // 5. Duplicate Re-Check Under Lock
    var existingInLock = findScoreBySubmissionId(sanitized.submissionId, ss);
    if (existingInLock) {
      return createSuccessResponse({
        duplicate: true,
        scoreId: existingInLock.scoreId,
        submissionId: existingInLock.submissionId,
        message: "Score with this submissionId already recorded."
      });
    }

    // 6. Generate Server ScoreID & Tokyo Timestamp
    var now = new Date();
    var scoreId = "SC-" + now.getTime() + "-" + Math.floor(1000 + Math.random() * 9000);
    var playedAtServer = Utilities.formatDate(now, CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");

    sanitized.scoreId = scoreId;
    sanitized.playerNameSnapshot = playerRecord.playerName;
    sanitized.playedAtServer = playedAtServer;

    // 7. Append Row
    appendScoreRow(sanitized, ss);

    // 8. Success Response
    return createSuccessResponse({
      scoreId: scoreId,
      duplicate: false,
      playerName: playerRecord.playerName,
      score: sanitized.score,
      difficulty: sanitized.difficulty,
      playedAt: playedAtServer
    });
  } finally {
    // 9. Always Release Lock
    try {
      lock.releaseLock();
    } catch (e) {
      // Ignore release error
    }
  }
}

/**
 * Admin Setup Function — Can be executed directly in Apps Script Editor to trigger OAuth
 * authorization and initialize the spreadsheet schema + test player.
 */
function adminInitDatabase() {
  var ss = getDatabaseSpreadsheet();
  ensureSchemaInitialized(ss);

  // Delete default empty sheet if custom sheets exist
  var defaultSheet = ss.getSheetByName("シート1") || ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {
      Logger.log("Notice: default sheet could not be deleted: " + e.message);
    }
  }

  // Seed test player if Players sheet only has header row
  var playersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.PLAYERS);
  if (playersSheet && playersSheet.getLastRow() <= 1) {
    var now = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
    playersSheet.appendRow(["TEST001", "TEST PLAYER", true, 9999, now, now]);
  }

  Logger.log("Database initialized successfully for Spreadsheet ID: " + ss.getId());
  return "OK";
}

