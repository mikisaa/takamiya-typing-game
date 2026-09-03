/**
 * Base Typing Game Backend — Players Master Repository & Auto-Resolution
 */

function getEnabledPlayersList(ss) {
  var targetSs = ss || getDatabaseSpreadsheet();
  var sheet = targetSs.getSheetByName(CONFIG.SHEET_NAMES.PLAYERS);
  if (!sheet) {
    return [];
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return [];
  }

  var players = [];
  // 7-column schema: [PlayerID, PlayerName, PlayerNameKey, Enabled, SortOrder, CreatedAt, UpdatedAt]
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var playerId = String(row[0] || "").trim();
    var playerName = String(row[1] || "").trim();
    var enabledVal = row[3];
    var isEnabled = enabledVal === true || String(enabledVal).toUpperCase() === "TRUE" || enabledVal === 1;
    var sortOrder = Number(row[4]) || 999;

    if (playerId && playerName && isEnabled) {
      players.push({
        playerId: playerId,
        playerName: playerName,
        sortOrder: sortOrder
      });
    }
  }

  players.sort(function(a, b) {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return a.playerName.localeCompare(b.playerName);
  });

  return players.map(function(p) {
    return {
      playerId: p.playerId,
      playerName: p.playerName
    };
  });
}

function findPlayerRecord(playerId, ss) {
  var targetSs = ss || getDatabaseSpreadsheet();
  var sheet = targetSs.getSheetByName(CONFIG.SHEET_NAMES.PLAYERS);
  if (!sheet) {
    return null;
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return null;
  }

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var id = String(row[0] || "").trim();
    if (id === playerId) {
      var enabledVal = row[3];
      var isEnabled = enabledVal === true || String(enabledVal).toUpperCase() === "TRUE" || enabledVal === 1;
      return {
        playerId: id,
        playerName: String(row[1] || "").trim(),
        playerNameKey: String(row[2] || "").trim(),
        enabled: isEnabled,
        sortOrder: Number(row[4]) || 999
      };
    }
  }

  return null;
}

function findPlayerByNameKey(nameKey, ss) {
  var targetSs = ss || getDatabaseSpreadsheet();
  var sheet = targetSs.getSheetByName(CONFIG.SHEET_NAMES.PLAYERS);
  if (!sheet) {
    return null;
  }

  SpreadsheetApp.flush();

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return null;
  }

  var data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var rowKey = String(row[2] || "").trim();
    if (rowKey === nameKey) {
      var enabledVal = row[3];
      var isEnabled = enabledVal === true || String(enabledVal).toUpperCase() === "TRUE" || enabledVal === 1;
      return {
        playerId: String(row[0] || "").trim(),
        playerName: String(row[1] || "").trim(),
        playerNameKey: rowKey,
        enabled: isEnabled,
        sortOrder: Number(row[4]) || 999
      };
    }
  }

  return null;
}

function createPlayerRecord(displayName, nameKey, ss) {
  var targetSs = ss || getDatabaseSpreadsheet();
  var sheet = targetSs.getSheetByName(CONFIG.SHEET_NAMES.PLAYERS);
  if (!sheet) {
    ensureSchemaInitialized(targetSs);
    sheet = targetSs.getSheetByName(CONFIG.SHEET_NAMES.PLAYERS);
  }

  var playerId = "PL-" + new Date().getTime() + "-" + Math.floor(1000 + Math.random() * 9000);
  var now = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");

  var newRow = [
    sanitizeFormulaValue(playerId),
    sanitizeFormulaValue(displayName),
    sanitizeFormulaValue(nameKey),
    true,
    9999,
    now,
    now
  ];

  sheet.appendRow(newRow);
  SpreadsheetApp.flush();

  return {
    playerId: playerId,
    playerName: displayName,
    playerNameKey: nameKey,
    enabled: true,
    sortOrder: 9999
  };
}

function migratePlayersSchemaIfNeeded(ss) {
  var targetSs = ss || getDatabaseSpreadsheet();
  var sheet = targetSs.getSheetByName(CONFIG.SHEET_NAMES.PLAYERS);
  if (!sheet) {
    ensureSchemaInitialized(targetSs);
    return;
  }

  var lastCol = sheet.getLastColumn();
  if (lastCol === 6) {
    Logger.log("Migrating Players sheet from 6 to 7 columns (adding PlayerNameKey)...");
    sheet.insertColumnAfter(2); // Insert after col 2 (PlayerName)
    sheet.getRange(1, 3).setValue("PlayerNameKey");

    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var names = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
      var keys = [];
      for (var i = 0; i < names.length; i++) {
        var n = String(names[i][0] || "").trim();
        keys.push([normalizePlayerName(n)]);
      }
      sheet.getRange(2, 3, lastRow - 1, 1).setValues(keys);
    }

    SpreadsheetApp.flush();
    Logger.log("Players sheet migration to 7 columns complete.");
  }

  // Update Meta SchemaVersion to 1.1.0
  var metaSheet = targetSs.getSheetByName(CONFIG.SHEET_NAMES.META);
  if (metaSheet) {
    var metaData = metaSheet.getDataRange().getValues();
    for (var m = 1; m < metaData.length; m++) {
      if (metaData[m][0] === "SchemaVersion") {
        metaSheet.getRange(m + 1, 2).setValue(CONFIG.SCHEMA_VERSION);
        metaSheet.getRange(m + 1, 3).setValue(Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"));
        break;
      }
    }
  }
  SpreadsheetApp.flush();
}
