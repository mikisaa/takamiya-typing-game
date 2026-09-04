/**
 * TakamiyaTypingGame Backend — Spreadsheet Management & Formula Protection
 */

function getDatabaseSpreadsheet() {
  var spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!spreadsheetId) {
    throw new Error("Missing SPREADSHEET_ID in Script Properties. Please configure the target Spreadsheet ID.");
  }
  return SpreadsheetApp.openById(spreadsheetId);
}

function sanitizeFormulaValue(value) {
  if (typeof value !== "string") {
    return value;
  }
  var trimmed = value.trim();
  if (
    trimmed.indexOf("=") === 0 ||
    trimmed.indexOf("+") === 0 ||
    trimmed.indexOf("-") === 0 ||
    trimmed.indexOf("@") === 0
  ) {
    return "'" + value;
  }
  return value;
}

function ensureSchemaInitialized(ss) {
  var targetSs = ss || getDatabaseSpreadsheet();

  // 1. Players Sheet
  var playersSheet = targetSs.getSheetByName(CONFIG.SHEET_NAMES.PLAYERS);
  if (!playersSheet) {
    playersSheet = targetSs.insertSheet(CONFIG.SHEET_NAMES.PLAYERS);
    playersSheet.appendRow(CONFIG.SCHEMAS.PLAYERS_HEADERS);
    playersSheet.setFrozenRows(1);
  }

  // 2. Scores Sheet
  var scoresSheet = targetSs.getSheetByName(CONFIG.SHEET_NAMES.SCORES);
  if (!scoresSheet) {
    scoresSheet = targetSs.insertSheet(CONFIG.SHEET_NAMES.SCORES);
    scoresSheet.appendRow(CONFIG.SCHEMAS.SCORES_HEADERS);
    scoresSheet.setFrozenRows(1);
  }

  // 3. Meta Sheet
  var metaSheet = targetSs.getSheetByName(CONFIG.SHEET_NAMES.META);
  if (!metaSheet) {
    metaSheet = targetSs.insertSheet(CONFIG.SHEET_NAMES.META);
    metaSheet.appendRow(CONFIG.SCHEMAS.META_HEADERS);
    metaSheet.setFrozenRows(1);
    var now = new Date().toISOString();
    metaSheet.appendRow(["SchemaVersion", CONFIG.SCHEMA_VERSION, now]);
    metaSheet.appendRow(["AppVersion", "1.0.0", now]);
    metaSheet.appendRow(["CreatedAt", now, now]);
  }
}
