/**
 * Base Typing Game Backend — Players Master Repository
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
  // Row 0 is header: [PlayerID, PlayerName, Enabled, SortOrder, CreatedAt, UpdatedAt]
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var playerId = String(row[0] || "").trim();
    var playerName = String(row[1] || "").trim();
    var enabledVal = row[2];
    var isEnabled = enabledVal === true || String(enabledVal).toUpperCase() === "TRUE" || enabledVal === 1;
    var sortOrder = Number(row[3]) || 999;

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
      var enabledVal = row[2];
      var isEnabled = enabledVal === true || String(enabledVal).toUpperCase() === "TRUE" || enabledVal === 1;
      return {
        playerId: id,
        playerName: String(row[1] || "").trim(),
        enabled: isEnabled,
        sortOrder: Number(row[3]) || 999
      };
    }
  }

  return null;
}
