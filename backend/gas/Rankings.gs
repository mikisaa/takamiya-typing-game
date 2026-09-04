/**
 * TakamiyaTypingGame Backend — Rankings Repository & Public Endpoint
 * Google Apps Script Environment
 */

function handleGetRankingsOperation(params) {
  // 1. Validate query parameters
  var valResult = validateGetRankingsQuery(params);
  if (!valResult.valid) {
    return createErrorResponse(valResult.code, valResult.message);
  }

  var sanitized = valResult.sanitized;
  var ss = getDatabaseSpreadsheet();

  // 2. Resolve optional target player by normalized name
  var targetPlayerId = null;
  if (sanitized.playerNameKey) {
    var playerRecord = findPlayerByNameKey(sanitized.playerNameKey, ss);
    if (playerRecord) {
      targetPlayerId = playerRecord.playerId;
    }
  }

  // 3. Batch read Players master to map PlayerID -> authoritative PlayerName
  var playerMap = {};
  var playersSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.PLAYERS);
  if (playersSheet && playersSheet.getLastRow() > 1) {
    var playersData = playersSheet.getDataRange().getValues();
    // Headers: [PlayerID, PlayerName, PlayerNameKey, Enabled, SortOrder, CreatedAt, UpdatedAt]
    for (var p = 1; p < playersData.length; p++) {
      var pRow = playersData[p];
      var pId = String(pRow[0] || "").trim();
      var pName = String(pRow[1] || "").trim();
      if (pId && pName) {
        playerMap[pId] = pName;
      }
    }
  }

  // 4. Batch read Scores table (single Range Read to avoid N+1)
  var scoresSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.SCORES);
  var rawScores = [];
  if (scoresSheet && scoresSheet.getLastRow() > 1) {
    rawScores = scoresSheet.getDataRange().getValues();
  }

  var currentMonthKey = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM");

  // Header index mapping from CONFIG.SCHEMAS.SCORES_HEADERS
  // [ScoreID(0), SubmissionID(1), PlayerID(2), PlayerNameSnapshot(3), Difficulty(4),
  //  Score(5), CorrectCount(6), TypedCharacters(7), TypingMistakes(8), MissCount(9),
  //  Accuracy(10), MaxCombo(11), WPM(12), KPM(13), ReachedStage(14),
  //  StartedAtClient(15), FinishedAtClient(16), PlayedAtServer(17), AppVersion(18)]

  var candidateScores = [];
  for (var i = 1; i < rawScores.length; i++) {
    var row = rawScores[i];
    if (!row || row.length < 6) continue;

    var rowDiff = String(row[4] || "").trim().toUpperCase();
    if (rowDiff !== sanitized.difficulty) {
      continue;
    }

    var playerId = String(row[2] || "").trim();
    if (!playerId) {
      continue;
    }

    var playedAtRaw = row[17];
    var scoreDate = null;
    if (playedAtRaw instanceof Date) {
      scoreDate = playedAtRaw;
    } else if (playedAtRaw) {
      scoreDate = new Date(playedAtRaw);
    }

    if (sanitized.period === "MONTHLY") {
      if (!scoreDate || isNaN(scoreDate.getTime())) {
        continue;
      }
      var scoreMonth = Utilities.formatDate(scoreDate, CONFIG.TIMEZONE, "yyyy-MM");
      if (scoreMonth !== currentMonthKey) {
        continue;
      }
    }

    candidateScores.push({
      scoreId: String(row[0] || ""),
      submissionId: String(row[1] || ""),
      playerId: playerId,
      playerNameSnapshot: String(row[3] || ""),
      difficulty: rowDiff,
      score: Number(row[5]) || 0,
      correctCount: Number(row[6]) || 0,
      accuracy: Number(row[10]) || 0,
      maxCombo: Number(row[11]) || 0,
      playedAtServer: scoreDate ? scoreDate.getTime() : 0
    });
  }

  // 5. Comparator for 6-level ranking order
  function gasCompareScores(a, b) {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (b.accuracy !== a.accuracy) {
      return b.accuracy - a.accuracy;
    }
    if (b.correctCount !== a.correctCount) {
      return b.correctCount - a.correctCount;
    }
    if (b.maxCombo !== a.maxCombo) {
      return b.maxCombo - a.maxCombo;
    }
    if (a.playedAtServer !== b.playedAtServer) {
      return a.playedAtServer - b.playedAtServer;
    }
    return String(a.scoreId || "").localeCompare(String(b.scoreId || ""));
  }

  // 6. Group by PlayerID to pick exactly ONE best score per player
  var playerBestMap = {};
  for (var c = 0; c < candidateScores.length; c++) {
    var candidate = candidateScores[c];
    var candPlayerId = candidate.playerId;
    if (!playerBestMap[candPlayerId]) {
      playerBestMap[candPlayerId] = candidate;
    } else {
      var existing = playerBestMap[candPlayerId];
      if (gasCompareScores(candidate, existing) < 0) {
        playerBestMap[candPlayerId] = candidate;
      }
    }
  }

  // 7. Sort aggregated best scores deterministically
  var rankedPlayers = [];
  for (var key in playerBestMap) {
    if (playerBestMap.hasOwnProperty(key)) {
      rankedPlayers.push(playerBestMap[key]);
    }
  }
  rankedPlayers.sort(gasCompareScores);

  // 8. Assign 1-indexed sequential ranks and resolve display names
  var rankedEntries = [];
  for (var r = 0; r < rankedPlayers.length; r++) {
    var item = rankedPlayers[r];
    var displayName = playerMap[item.playerId] || item.playerNameSnapshot || "PLAYER";
    rankedEntries.push({
      rank: r + 1,
      playerId: item.playerId,
      playerName: displayName,
      score: item.score,
      accuracy: Number(item.accuracy.toFixed(1)),
      correctCount: item.correctCount,
      maxCombo: item.maxCombo
    });
  }

  // 9. Resolve currentPlayer if requested
  var currentPlayerEntry = null;
  if (targetPlayerId) {
    for (var cp = 0; cp < rankedEntries.length; cp++) {
      if (rankedEntries[cp].playerId === targetPlayerId) {
        currentPlayerEntry = {
          rank: rankedEntries[cp].rank,
          playerName: rankedEntries[cp].playerName,
          score: rankedEntries[cp].score,
          accuracy: rankedEntries[cp].accuracy,
          correctCount: rankedEntries[cp].correctCount,
          maxCombo: rankedEntries[cp].maxCombo
        };
        break;
      }
    }
  }

  // 10. Slice entries to limit and sanitize (data minimization)
  var limitedEntries = [];
  var limitCount = Math.min(sanitized.limit, rankedEntries.length);
  for (var e = 0; e < limitCount; e++) {
    limitedEntries.push({
      rank: rankedEntries[e].rank,
      playerName: rankedEntries[e].playerName,
      score: rankedEntries[e].score,
      accuracy: rankedEntries[e].accuracy,
      correctCount: rankedEntries[e].correctCount,
      maxCombo: rankedEntries[e].maxCombo
    });
  }

  return createSuccessResponse({
    period: sanitized.period,
    difficulty: sanitized.difficulty,
    monthKey: currentMonthKey,
    timezone: CONFIG.TIMEZONE,
    totalPlayers: rankedEntries.length,
    entries: limitedEntries,
    currentPlayer: currentPlayerEntry,
    generatedAtServer: Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX")
  });
}
