/**
 * Base Typing Game Backend — Scores Repository & Duplicate Protection
 */

function findScoreBySubmissionId(submissionId, ss) {
  var targetSs = ss || getDatabaseSpreadsheet();
  var sheet = targetSs.getSheetByName(CONFIG.SHEET_NAMES.SCORES);
  if (!sheet) {
    return null;
  }

  // Force spreadsheet to sync any pending buffer writes
  SpreadsheetApp.flush();

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return null;
  }

  // Column 2 is SubmissionID (1-indexed: getRange(row, col, numRows, numCols))
  var submissionValues = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  for (var i = 0; i < submissionValues.length; i++) {
    var val = String(submissionValues[i][0] || "").trim();
    if (val === submissionId) {
      // Return basic record matching existing row
      var fullRow = sheet.getRange(i + 2, 1, 1, CONFIG.SCHEMAS.SCORES_HEADERS.length).getValues()[0];
      return {
        scoreId: fullRow[0],
        submissionId: fullRow[1],
        playerId: fullRow[2],
        playerNameSnapshot: fullRow[3],
        score: fullRow[5]
      };
    }
  }

  return null;
}

function appendScoreRow(scoreData, ss) {
  var targetSs = ss || getDatabaseSpreadsheet();
  var sheet = targetSs.getSheetByName(CONFIG.SHEET_NAMES.SCORES);
  if (!sheet) {
    ensureSchemaInitialized(targetSs);
    sheet = targetSs.getSheetByName(CONFIG.SHEET_NAMES.SCORES);
  }

  // Exact 19 columns mapping:
  // [ScoreID, SubmissionID, PlayerID, PlayerNameSnapshot, Difficulty, Score, CorrectCount,
  //  TypedCharacters, TypingMistakes, MissCount, Accuracy, MaxCombo, WPM, KPM,
  //  ReachedStage, StartedAtClient, FinishedAtClient, PlayedAtServer, AppVersion]
  var row = [
    sanitizeFormulaValue(scoreData.scoreId),
    sanitizeFormulaValue(scoreData.submissionId),
    sanitizeFormulaValue(scoreData.playerId),
    sanitizeFormulaValue(scoreData.playerNameSnapshot),
    sanitizeFormulaValue(scoreData.difficulty),
    scoreData.score,
    scoreData.correctCount,
    scoreData.typedCharacters,
    scoreData.typingMistakes,
    scoreData.missCount,
    scoreData.accuracy,
    scoreData.maxCombo,
    scoreData.wpm,
    scoreData.kpm,
    sanitizeFormulaValue(scoreData.reachedStage),
    sanitizeFormulaValue(scoreData.startedAtClient),
    sanitizeFormulaValue(scoreData.finishedAtClient),
    sanitizeFormulaValue(scoreData.playedAtServer),
    sanitizeFormulaValue(scoreData.appVersion)
  ];

  sheet.appendRow(row);
  // Synchronously flush write to Google Sheets to ensure immediate read consistency across concurrent workers
  SpreadsheetApp.flush();
}
