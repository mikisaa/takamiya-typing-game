import { BACKEND_CONFIG } from "./backendConfig.js";

/**
 * Converts a Date object or ISO date string to "yyyy-MM" in the Asia/Tokyo timezone.
 * @param {Date|string|number} dateOrIsoString
 * @returns {string|null} "yyyy-MM" or null if invalid
 */
export function getJstMonthKey(dateOrIsoString) {
  if (!dateOrIsoString) return null;
  const d = new Date(dateOrIsoString);
  if (isNaN(d.getTime())) return null;

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: BACKEND_CONFIG.TIMEZONE,
    year: "numeric",
    month: "2-digit"
  });
  return formatter.format(d); // Returns "YYYY-MM"
}

/**
 * Returns the current month key "yyyy-MM" in Asia/Tokyo.
 * @returns {string}
 */
export function getCurrentJstMonthKey() {
  return getJstMonthKey(new Date());
}

/**
 * Deterministic 6-level comparator for ranking entries and player best records.
 * 1. Score descending (higher is better)
 * 2. Accuracy descending (higher is better)
 * 3. CorrectCount descending (higher is better)
 * 4. MaxCombo descending (higher is better)
 * 5. PlayedAtServer ascending (earlier is better)
 * 6. ScoreID ascending (deterministic string tie-break)
 *
 * @param {Object} a
 * @param {Object} b
 * @returns {number}
 */
export function compareRankingRecords(a, b) {
  // 1. Score descending
  const scoreA = Number(a.score ?? a.Score ?? 0);
  const scoreB = Number(b.score ?? b.Score ?? 0);
  if (scoreB !== scoreA) {
    return scoreB - scoreA;
  }

  // 2. Accuracy descending
  const accA = Number(a.accuracy ?? a.Accuracy ?? 0);
  const accB = Number(b.accuracy ?? b.Accuracy ?? 0);
  if (accB !== accA) {
    return accB - accA;
  }

  // 3. CorrectCount descending
  const corrA = Number(a.correctCount ?? a.CorrectCount ?? 0);
  const corrB = Number(b.correctCount ?? b.CorrectCount ?? 0);
  if (corrB !== corrA) {
    return corrB - corrA;
  }

  // 4. MaxCombo descending
  const comboA = Number(a.maxCombo ?? a.MaxCombo ?? 0);
  const comboB = Number(b.maxCombo ?? b.MaxCombo ?? 0);
  if (comboB !== comboA) {
    return comboB - comboA;
  }

  // 5. PlayedAtServer ascending (earlier timestamp wins)
  const timeA = new Date(a.playedAtServer ?? a.PlayedAtServer ?? 0).getTime();
  const timeB = new Date(b.playedAtServer ?? b.PlayedAtServer ?? 0).getTime();
  if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
    return timeA - timeB;
  }

  // 6. ScoreID deterministic string ascending
  const idA = String(a.scoreId ?? a.ScoreID ?? "");
  const idB = String(b.scoreId ?? b.ScoreID ?? "");
  return idA.localeCompare(idB);
}

/**
 * Strips internal identifiers and private metadata for public API responses.
 * Principle: RANKING_PLAYER_NAMES_ARE_VISIBLE_TO_ENDPOINT_CALLERS
 * Explicitly excludes: PlayerID, PlayerNameKey, SubmissionID, ScoreID, raw timestamps, AppVersion
 *
 * @param {Object} item
 * @returns {Object} Public ranking entry
 */
export function sanitizeRankingEntry(item) {
  if (!item) return null;
  return {
    rank: Number(item.rank),
    playerName: String(item.playerName || "").trim(),
    score: Number(item.score || 0),
    accuracy: Number((item.accuracy || 0).toFixed(1)),
    correctCount: Number(item.correctCount || 0),
    maxCombo: Number(item.maxCombo || 0)
  };
}

/**
 * Pure ranking calculation function.
 * Aggregates scores table into deterministic player rankings.
 *
 * Rules:
 * - Practice mode excluded (only valid Production scores considered)
 * - Separated strictly by Difficulty
 * - Filtered by Period: MONTHLY (current JST calendar month) or ALL_TIME
 * - Exactly ONE best score per unique (Period × Difficulty × PlayerID)
 * - Group key is PlayerID, not raw name string
 * - Limit applied to entries (default 10)
 * - Optional currentPlayer resolved by targetPlayerId
 *
 * @param {Array<Object>} rawScores Array of score row objects from Scores sheet
 * @param {Array<Object>} [players=[]] Array of player master objects
 * @param {Object} options { period, difficulty, limit, currentMonthKey, targetPlayerId }
 * @returns {Object} Full ranking response payload
 */
export function aggregateRankings(rawScores = [], players = [], options = {}) {
  const {
    period = "MONTHLY",
    difficulty = "BEGINNER",
    limit = BACKEND_CONFIG.LIMITS.DEFAULT_RANKING_LIMIT,
    currentMonthKey = getCurrentJstMonthKey(),
    targetPlayerId = null
  } = options;

  // Build quick player master lookup map (PlayerID -> latest PlayerName)
  const playerMap = new Map();
  if (Array.isArray(players)) {
    for (const p of players) {
      const pId = String(p.PlayerID || p.playerId || "").trim();
      const pName = String(p.PlayerName || p.playerName || "").trim();
      if (pId && pName) {
        playerMap.set(pId, pName);
      }
    }
  }

  // 1. Filter valid production scores matching difficulty and period
  const candidateScores = [];
  for (const row of rawScores) {
    if (!row || typeof row !== "object") continue;

    const rowDifficulty = String(row.Difficulty || row.difficulty || "").trim().toUpperCase();
    if (rowDifficulty !== difficulty) continue;

    const playerId = String(row.PlayerID || row.playerId || "").trim();
    if (!playerId) continue;

    const playedAt = row.PlayedAtServer || row.playedAtServer;
    if (period === "MONTHLY") {
      const scoreMonthKey = getJstMonthKey(playedAt);
      if (scoreMonthKey !== currentMonthKey) {
        continue;
      }
    }

    // Standardize object fields
    candidateScores.push({
      scoreId: row.ScoreID || row.scoreId || "",
      submissionId: row.SubmissionID || row.submissionId || "",
      playerId: playerId,
      playerNameSnapshot: row.PlayerNameSnapshot || row.playerNameSnapshot || "",
      difficulty: rowDifficulty,
      score: Number(row.Score ?? row.score ?? 0),
      correctCount: Number(row.CorrectCount ?? row.correctCount ?? 0),
      typedCharacters: Number(row.TypedCharacters ?? row.typedCharacters ?? 0),
      typingMistakes: Number(row.TypingMistakes ?? row.typingMistakes ?? 0),
      missCount: Number(row.MissCount ?? row.missCount ?? 0),
      accuracy: Number(row.Accuracy ?? row.accuracy ?? 0),
      maxCombo: Number(row.MaxCombo ?? row.maxCombo ?? 0),
      playedAtServer: playedAt
    });
  }

  // 2. Group by PlayerID to pick exactly ONE best score per player
  const playerBestMap = new Map();
  for (const score of candidateScores) {
    const pId = score.playerId;
    if (!playerBestMap.has(pId)) {
      playerBestMap.set(pId, score);
    } else {
      const existingBest = playerBestMap.get(pId);
      // Compare existing best vs this candidate. If candidate is better (negative value), replace.
      if (compareRankingRecords(score, existingBest) < 0) {
        playerBestMap.set(pId, score);
      }
    }
  }

  // 3. Sort all best player records deterministically
  const rankedPlayers = Array.from(playerBestMap.values());
  rankedPlayers.sort(compareRankingRecords);

  // 4. Assign 1-indexed sequential ranks and resolve display name
  const rankedEntries = rankedPlayers.map((item, index) => {
    const resolvedName = playerMap.get(item.playerId) || item.playerNameSnapshot || "PLAYER";
    return {
      rank: index + 1,
      playerId: item.playerId,
      playerName: resolvedName,
      score: item.score,
      accuracy: item.accuracy,
      correctCount: item.correctCount,
      maxCombo: item.maxCombo
    };
  });

  // 5. Resolve currentPlayer if targetPlayerId is provided
  let currentPlayerEntry = null;
  if (targetPlayerId) {
    const found = rankedEntries.find((e) => e.playerId === targetPlayerId);
    if (found) {
      currentPlayerEntry = sanitizeRankingEntry(found);
    }
  }

  // 6. Slice entries to limit and sanitize
  const limitedEntries = rankedEntries.slice(0, Math.max(1, limit)).map(sanitizeRankingEntry);

  return {
    period,
    difficulty,
    monthKey: currentMonthKey,
    timezone: BACKEND_CONFIG.TIMEZONE,
    totalPlayers: rankedEntries.length,
    entries: limitedEntries,
    currentPlayer: currentPlayerEntry,
    generatedAtServer: new Date().toISOString()
  };
}
