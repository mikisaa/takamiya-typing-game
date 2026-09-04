import {
  getJstMonthKey,
  getCurrentJstMonthKey,
  compareRankingRecords,
  sanitizeRankingEntry,
  aggregateRankings
} from "../backend/shared/rankingCore.js";
import { BACKEND_CONFIG } from "../backend/shared/backendConfig.js";
import { validateGetRankingsQuery } from "../backend/shared/backendValidator.js";
import { BackendService } from "../backend/shared/backendService.js";
import { FakeSpreadsheetDb } from "../backend/shared/fakeSpreadsheetDb.js";

export function runRankingCoreTests() {
  console.log("\n=== Testing Ranking Core, Deterministic Comparator & Data Minimization ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  PASS: ${message}`);
      passed++;
    } else {
      console.error(`  FAIL: ${message}`);
      failed++;
    }
  }

  // 1. JST Month Formatting
  console.log("\n--- Testing JST Month Key Extraction ---");
  const sepFirst = new Date("2026-09-01T00:00:00+09:00");
  const sepLast = new Date("2026-09-30T23:59:59.999+09:00");
  const augLastJst = new Date("2026-08-31T23:59:59+09:00"); // 2026-08 in JST
  const octFirstJst = new Date("2026-10-01T00:00:00+09:00"); // 2026-10 in JST

  assert(getJstMonthKey(sepFirst) === "2026-09", "September 1 JST is 2026-09");
  assert(getJstMonthKey(sepLast) === "2026-09", "September 30 JST is 2026-09");
  assert(getJstMonthKey(augLastJst) === "2026-08", "August 31 23:59 JST is 2026-08");
  assert(getJstMonthKey(octFirstJst) === "2026-10", "October 1 00:00 JST is 2026-10");
  assert(getJstMonthKey(null) === null, "Null date returns null");
  assert(getJstMonthKey("invalid-date") === null, "Invalid date returns null");
  console.log("  PASS: JST Month Key boundaries correctly calculated");

  // 2. Deterministic Comparator Verification across all 6 levels
  console.log("\n--- Testing Deterministic 6-Level Comparator ---");
  // Level 1: Score desc
  const r1 = { score: 20000, accuracy: 90, correctCount: 20, maxCombo: 10, playedAtServer: "2026-09-02T10:00:00Z", scoreId: "SC-1" };
  const r2 = { score: 18000, accuracy: 99, correctCount: 30, maxCombo: 20, playedAtServer: "2026-09-01T10:00:00Z", scoreId: "SC-2" };
  assert(compareRankingRecords(r1, r2) < 0, "Higher score wins regardless of other metrics");

  // Level 2: Same score, accuracy desc
  const r3 = { score: 18000, accuracy: 95.0, correctCount: 20, maxCombo: 10, playedAtServer: "2026-09-02T10:00:00Z", scoreId: "SC-3" };
  const r4 = { score: 18000, accuracy: 98.0, correctCount: 15, maxCombo: 5, playedAtServer: "2026-09-02T10:00:00Z", scoreId: "SC-4" };
  assert(compareRankingRecords(r4, r3) < 0, "Same score: higher accuracy wins");

  // Level 3: Same score & accuracy, correctCount desc
  const r5 = { score: 18000, accuracy: 98.0, correctCount: 25, maxCombo: 5, playedAtServer: "2026-09-02T10:00:00Z", scoreId: "SC-5" };
  const r6 = { score: 18000, accuracy: 98.0, correctCount: 20, maxCombo: 15, playedAtServer: "2026-09-02T10:00:00Z", scoreId: "SC-6" };
  assert(compareRankingRecords(r5, r6) < 0, "Same score and accuracy: higher correctCount wins");

  // Level 4: Same score, accuracy, correctCount: maxCombo desc
  const r7 = { score: 18000, accuracy: 98.0, correctCount: 25, maxCombo: 18, playedAtServer: "2026-09-02T10:00:00Z", scoreId: "SC-7" };
  const r8 = { score: 18000, accuracy: 98.0, correctCount: 25, maxCombo: 12, playedAtServer: "2026-09-02T10:00:00Z", scoreId: "SC-8" };
  assert(compareRankingRecords(r7, r8) < 0, "Same score, acc, corr: higher maxCombo wins");

  // Level 5: Same score, accuracy, correctCount, maxCombo: earlier PlayedAtServer wins
  const r9 = { score: 18000, accuracy: 98.0, correctCount: 25, maxCombo: 18, playedAtServer: "2026-09-01T10:00:00Z", scoreId: "SC-9" };
  const r10 = { score: 18000, accuracy: 98.0, correctCount: 25, maxCombo: 18, playedAtServer: "2026-09-02T10:00:00Z", scoreId: "SC-10" };
  assert(compareRankingRecords(r9, r10) < 0, "Earlier timestamp wins on tie");

  // Level 6: Exactly identical stats & timestamp: ScoreID ascending deterministic
  const r11 = { score: 18000, accuracy: 98.0, correctCount: 25, maxCombo: 18, playedAtServer: "2026-09-01T10:00:00Z", scoreId: "SC-AAA" };
  const r12 = { score: 18000, accuracy: 98.0, correctCount: 25, maxCombo: 18, playedAtServer: "2026-09-01T10:00:00Z", scoreId: "SC-BBB" };
  assert(compareRankingRecords(r11, r12) < 0, "ScoreID ascending deterministic tie-break");
  console.log("  PASS: All 6 tie-break comparator levels verified");

  // 3. One Best Record Per Player & Leaderboard Anti-Spam
  console.log("\n--- Testing Single Best Score Per Player & Anti-Spam Grouping ---");
  const testScores = [
    { ScoreID: "S1", PlayerID: "P001", PlayerNameSnapshot: "山田 太郎", Difficulty: "BEGINNER", Score: 12000, Accuracy: 95, CorrectCount: 15, MaxCombo: 10, PlayedAtServer: "2026-09-01T10:00:00+09:00" },
    { ScoreID: "S2", PlayerID: "P001", PlayerNameSnapshot: "山田 太郎", Difficulty: "BEGINNER", Score: 18000, Accuracy: 98, CorrectCount: 25, MaxCombo: 15, PlayedAtServer: "2026-09-02T10:00:00+09:00" },
    { ScoreID: "S3", PlayerID: "P001", PlayerNameSnapshot: "山田 太郎", Difficulty: "BEGINNER", Score: 14000, Accuracy: 96, CorrectCount: 18, MaxCombo: 12, PlayedAtServer: "2026-09-03T10:00:00+09:00" },
    { ScoreID: "S4", PlayerID: "P002", PlayerNameSnapshot: "佐藤 花子", Difficulty: "BEGINNER", Score: 16000, Accuracy: 99, CorrectCount: 22, MaxCombo: 18, PlayedAtServer: "2026-09-01T12:00:00+09:00" }
  ];

  const players = [
    { PlayerID: "P001", PlayerName: "山田 太郎" },
    { PlayerID: "P002", PlayerName: "佐藤 花子" }
  ];

  const rankingRes = aggregateRankings(testScores, players, { period: "MONTHLY", difficulty: "BEGINNER", currentMonthKey: "2026-09" });
  assert(rankingRes.entries.length === 2, "Exactly 2 players in ranking despite 4 score submissions");
  assert(rankingRes.entries[0].playerName === "山田 太郎" && rankingRes.entries[0].score === 18000, "P001's best score (18000) selected for rank 1");
  assert(rankingRes.entries[1].playerName === "佐藤 花子" && rankingRes.entries[1].score === 16000, "P002's best score (16000) selected for rank 2");
  assert(rankingRes.totalPlayers === 2, "totalPlayers is 2");
  console.log("  PASS: Single best score per player selected; no leaderboard spam");

  // 4. Monthly vs All-Time Filtering
  console.log("\n--- Testing Monthly vs All-Time Period Separation ---");
  const multiMonthScores = [
    { ScoreID: "M1", PlayerID: "P001", PlayerNameSnapshot: "山田 太郎", Difficulty: "BEGINNER", Score: 25000, Accuracy: 99, CorrectCount: 30, MaxCombo: 25, PlayedAtServer: "2026-08-15T10:00:00+09:00" }, // Past month
    { ScoreID: "M2", PlayerID: "P001", PlayerNameSnapshot: "山田 太郎", Difficulty: "BEGINNER", Score: 15000, Accuracy: 95, CorrectCount: 20, MaxCombo: 15, PlayedAtServer: "2026-09-05T10:00:00+09:00" }, // Current month
    { ScoreID: "M3", PlayerID: "P002", PlayerNameSnapshot: "佐藤 花子", Difficulty: "BEGINNER", Score: 20000, Accuracy: 97, CorrectCount: 25, MaxCombo: 20, PlayedAtServer: "2026-08-20T10:00:00+09:00" }  // Past month
  ];

  const monthlyRes = aggregateRankings(multiMonthScores, players, { period: "MONTHLY", difficulty: "BEGINNER", currentMonthKey: "2026-09" });
  assert(monthlyRes.entries.length === 1, "Only 1 player recorded in 2026-09");
  assert(monthlyRes.entries[0].playerName === "山田 太郎" && monthlyRes.entries[0].score === 15000, "Monthly ranking contains only current month score (15000)");

  const allTimeRes = aggregateRankings(multiMonthScores, players, { period: "ALL_TIME", difficulty: "BEGINNER" });
  assert(allTimeRes.entries.length === 2, "All-time contains both players");
  assert(allTimeRes.entries[0].playerName === "山田 太郎" && allTimeRes.entries[0].score === 25000, "All-time selects P001's all-time high (25000) from previous month");
  assert(allTimeRes.entries[1].playerName === "佐藤 花子" && allTimeRes.entries[1].score === 20000, "All-time includes P002 (20000)");
  console.log("  PASS: Monthly strictly filters by JST month; All-Time spans all records");

  // 5. Difficulty Isolation
  console.log("\n--- Testing Difficulty Isolation ---");
  const diffScores = [
    { ScoreID: "D1", PlayerID: "P001", PlayerNameSnapshot: "山田 太郎", Difficulty: "BEGINNER", Score: 5000, Accuracy: 90, CorrectCount: 10, MaxCombo: 5, PlayedAtServer: "2026-09-05T10:00:00+09:00" },
    { ScoreID: "D2", PlayerID: "P001", PlayerNameSnapshot: "山田 太郎", Difficulty: "ADVANCED", Score: 22000, Accuracy: 99, CorrectCount: 30, MaxCombo: 25, PlayedAtServer: "2026-09-05T11:00:00+09:00" }
  ];

  const begRanking = aggregateRankings(diffScores, players, { period: "ALL_TIME", difficulty: "BEGINNER" });
  assert(begRanking.entries.length === 1 && begRanking.entries[0].score === 5000, "Beginner ranking has only beginner score");

  const advRanking = aggregateRankings(diffScores, players, { period: "ALL_TIME", difficulty: "ADVANCED" });
  assert(advRanking.entries.length === 1 && advRanking.entries[0].score === 22000, "Advanced ranking has only advanced score");

  const intRanking = aggregateRankings(diffScores, players, { period: "ALL_TIME", difficulty: "INTERMEDIATE" });
  assert(intRanking.entries.length === 0, "Intermediate ranking is empty");
  console.log("  PASS: Difficulties are strictly isolated");

  // 6. Cross-Browser PlayerID Grouping
  console.log("\n--- Testing Cross-Browser PlayerID Aggregation ---");
  const crossBrowserScores = [
    { ScoreID: "CB1", PlayerID: "P001", PlayerNameSnapshot: "yamada", Difficulty: "BEGINNER", Score: 11000, Accuracy: 90, CorrectCount: 12, MaxCombo: 8, PlayedAtServer: "2026-09-01T10:00:00+09:00" },
    { ScoreID: "CB2", PlayerID: "P001", PlayerNameSnapshot: "YAMADA", Difficulty: "BEGINNER", Score: 17500, Accuracy: 98, CorrectCount: 24, MaxCombo: 16, PlayedAtServer: "2026-09-02T10:00:00+09:00" },
    { ScoreID: "CB3", PlayerID: "P001", PlayerNameSnapshot: "山田　太郎", Difficulty: "BEGINNER", Score: 13000, Accuracy: 92, CorrectCount: 15, MaxCombo: 10, PlayedAtServer: "2026-09-03T10:00:00+09:00" }
  ];
  const cbRanking = aggregateRankings(crossBrowserScores, [{ PlayerID: "P001", PlayerName: "山田 太郎" }], { period: "MONTHLY", difficulty: "BEGINNER", currentMonthKey: "2026-09" });
  assert(cbRanking.entries.length === 1, "Scores with same PlayerID aggregated into single entry");
  assert(cbRanking.entries[0].score === 17500, "Highest score among all browser submissions adopted");
  console.log("  PASS: Cross-browser submissions for same PlayerID aggregate into 1 entry");

  // 7. Limit & Current Player Inside/Outside Top 10
  console.log("\n--- Testing Ranking Limit & Current Player Resolution ---");
  const fifteenScores = [];
  const fifteenPlayers = [];
  for (let i = 1; i <= 15; i++) {
    const pId = `P${String(i).padStart(3, "0")}`;
    const pName = `プレイヤー${i}`;
    fifteenPlayers.push({ PlayerID: pId, PlayerName: pName });
    fifteenScores.push({
      ScoreID: `SC-${i}`,
      PlayerID: pId,
      PlayerNameSnapshot: pName,
      Difficulty: "BEGINNER",
      Score: 1000 * (16 - i), // P001 has 15000 (rank 1), P015 has 1000 (rank 15)
      Accuracy: 95.0,
      CorrectCount: 20,
      MaxCombo: 10,
      PlayedAtServer: "2026-09-04T10:00:00+09:00"
    });
  }

  // Query with limit 10, target P003 (rank 3 - inside TOP 10)
  const insideRes = aggregateRankings(fifteenScores, fifteenPlayers, {
    period: "MONTHLY",
    difficulty: "BEGINNER",
    limit: 10,
    currentMonthKey: "2026-09",
    targetPlayerId: "P003"
  });
  assert(insideRes.entries.length === 10, "Entries truncated to limit 10");
  assert(insideRes.totalPlayers === 15, "totalPlayers is 15");
  assert(insideRes.currentPlayer !== null, "currentPlayer is returned");
  assert(insideRes.currentPlayer.rank === 3, "currentPlayer rank is 3");
  assert(insideRes.currentPlayer.score === 13000, "currentPlayer score is 13000");

  // Query with limit 10, target P015 (rank 15 - outside TOP 10)
  const outsideRes = aggregateRankings(fifteenScores, fifteenPlayers, {
    period: "MONTHLY",
    difficulty: "BEGINNER",
    limit: 10,
    currentMonthKey: "2026-09",
    targetPlayerId: "P015"
  });
  assert(outsideRes.entries.length === 10, "Entries still top 10");
  assert(outsideRes.currentPlayer !== null, "currentPlayer returned even when outside top 10");
  assert(outsideRes.currentPlayer.rank === 15, "currentPlayer rank is correctly 15");
  assert(outsideRes.currentPlayer.score === 1000, "currentPlayer score is 1000");

  // Target unknown player
  const unknownRes = aggregateRankings(fifteenScores, fifteenPlayers, {
    period: "MONTHLY",
    difficulty: "BEGINNER",
    limit: 10,
    currentMonthKey: "2026-09",
    targetPlayerId: "NON_EXISTENT_PLAYER"
  });
  assert(unknownRes.currentPlayer === null, "Unknown target player returns null currentPlayer");
  console.log("  PASS: Limit 10, totalPlayers 15, and currentPlayer inside/outside top 10 verified");

  // 8. Public Data Minimization
  console.log("\n--- Testing Public Data Minimization & Privacy Boundary ---");
  const sanitized = sanitizeRankingEntry({
    rank: 1,
    playerId: "P001",
    playerNameKey: "yamada",
    submissionId: "SUB-12345",
    scoreId: "SC-9999",
    playerName: "山田 太郎",
    score: 18000,
    accuracy: 98.43,
    correctCount: 25,
    maxCombo: 19,
    playedAtServer: "2026-09-04T10:00:00Z",
    appVersion: "1.0.0"
  });

  assert(sanitized.rank === 1, "rank present");
  assert(sanitized.playerName === "山田 太郎", "playerName present");
  assert(sanitized.score === 18000, "score present");
  assert(sanitized.accuracy === 98.4, "accuracy rounded to 1 decimal");
  assert(sanitized.correctCount === 25, "correctCount present");
  assert(sanitized.maxCombo === 19, "maxCombo present");

  assert(sanitized.playerId === undefined, "playerId stripped");
  assert(sanitized.playerNameKey === undefined, "playerNameKey stripped");
  assert(sanitized.submissionId === undefined, "submissionId stripped");
  assert(sanitized.scoreId === undefined, "scoreId stripped");
  assert(sanitized.playedAtServer === undefined, "playedAtServer stripped");
  assert(sanitized.appVersion === undefined, "appVersion stripped");
  console.log("  PASS: Public ranking data minimized; internal keys and timestamps stripped");

  // 9. Query Validation
  console.log("\n--- Testing Query Parameter Validation ---");
  assert(validateGetRankingsQuery({}).valid === true, "Empty query defaults successfully");
  assert(validateGetRankingsQuery({ period: "MONTHLY", difficulty: "BEGINNER" }).valid === true, "Valid query succeeds");
  assert(validateGetRankingsQuery({ period: "ALL_TIME", difficulty: "ADVANCED", limit: 50 }).valid === true, "Valid custom limit succeeds");

  const invPeriod = validateGetRankingsQuery({ period: "YEARLY" });
  assert(invPeriod.valid === false && invPeriod.code === BACKEND_CONFIG.ERROR_CODES.INVALID_PERIOD, "YEARLY period rejected");

  const invDiff = validateGetRankingsQuery({ difficulty: "MASTER" });
  assert(invDiff.valid === false && invDiff.code === BACKEND_CONFIG.ERROR_CODES.INVALID_DIFFICULTY, "MASTER difficulty rejected");

  const invLimit0 = validateGetRankingsQuery({ limit: 0 });
  assert(invLimit0.valid === false && invLimit0.code === BACKEND_CONFIG.ERROR_CODES.INVALID_LIMIT, "Limit 0 rejected");

  const invLimit101 = validateGetRankingsQuery({ limit: 101 });
  assert(invLimit101.valid === false && invLimit101.code === BACKEND_CONFIG.ERROR_CODES.INVALID_LIMIT, "Limit > 100 rejected");

  const invLimitFloat = validateGetRankingsQuery({ limit: 5.5 });
  assert(invLimitFloat.valid === false && invLimitFloat.code === BACKEND_CONFIG.ERROR_CODES.INVALID_LIMIT, "Fractional limit rejected");

  const longName = "A".repeat(31);
  const invName = validateGetRankingsQuery({ playerName: longName });
  assert(invName.valid === false && invName.code === BACKEND_CONFIG.ERROR_CODES.INVALID_PLAYER_NAME, "Player name > 30 chars rejected");
  console.log("  PASS: Query validation strictly enforces period, difficulty, limit, and name rules");

  // 10. BackendService getRankings Integration
  console.log("\n--- Testing BackendService.getRankings Integration ---");
  const fakeDb = new FakeSpreadsheetDb({
    players: [
      { PlayerID: "P001", PlayerName: "佐藤 健", PlayerNameKey: "佐藤 健", Enabled: true, SortOrder: 1 },
      { PlayerID: "P002", PlayerName: "高宮 太郎", PlayerNameKey: "高宮 太郎", Enabled: true, SortOrder: 2 }
    ],
    scores: [
      { ScoreID: "S101", SubmissionID: "SUB-1", PlayerID: "P001", PlayerNameSnapshot: "佐藤 健", Difficulty: "BEGINNER", Score: 18500, Accuracy: 99.0, CorrectCount: 28, MaxCombo: 20, PlayedAtServer: "2026-09-01T10:00:00+09:00" },
      { ScoreID: "S102", SubmissionID: "SUB-2", PlayerID: "P002", PlayerNameSnapshot: "高宮 太郎", Difficulty: "BEGINNER", Score: 16200, Accuracy: 96.5, CorrectCount: 22, MaxCombo: 14, PlayedAtServer: "2026-09-02T10:00:00+09:00" }
    ]
  });
  const service = new BackendService(fakeDb);

  const res = service.getRankings({ period: "MONTHLY", difficulty: "BEGINNER", playerName: "高宮　太郎", currentMonthKey: "2026-09" });
  assert(res.ok === true, "service.getRankings returns ok=true");
  assert(res.data.entries.length === 2, "2 entries returned");
  assert(res.data.entries[0].playerName === "佐藤 健" && res.data.entries[0].rank === 1, "Satoh is rank 1");
  assert(res.data.entries[1].playerName === "高宮 太郎" && res.data.entries[1].rank === 2, "Takamiya is rank 2");
  assert(res.data.currentPlayer !== null, "Current player resolved via normalized name");
  assert(res.data.currentPlayer.rank === 2, "Current player is rank 2");
  assert(res.data.currentPlayer.score === 16200, "Current player score is 16200");
  console.log("  PASS: BackendService getRankings resolves target player by normalized name and returns full payload");

  // 11. Empty Scores Database
  console.log("\n--- Testing Empty Scores Table Handling ---");
  const emptyDb = new FakeSpreadsheetDb({ players: [], scores: [] });
  const emptyService = new BackendService(emptyDb);
  const emptyRes = emptyService.getRankings({ period: "MONTHLY", difficulty: "BEGINNER" });
  assert(emptyRes.ok === true, "Empty scores returns ok=true");
  assert(emptyRes.data.entries.length === 0, "entries is empty array");
  assert(emptyRes.data.totalPlayers === 0, "totalPlayers is 0");
  assert(emptyRes.data.currentPlayer === null, "currentPlayer is null");
  console.log("  PASS: Empty database returns clean empty ranking without errors");

  return { passed, failed };
}

