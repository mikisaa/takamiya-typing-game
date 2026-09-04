/**
 * Live Google Apps Script Integration Test Suite (Phase 8 Revised)
 * Tests real HTTP requests against deployed GAS Web App with free-entry player name,
 * auto-creation, cross-browser normalization, and concurrency.
 */

const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzdPNsWV5kNdtpsF91jkca3lkJSLdVxG_2Ux8V5a5f1kMWLJmogiUG8mzbSiRk3S3xeeQ/exec";

async function postJson(payload) {
  const res = await fetch(GAS_WEB_APP_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

async function getJson(params) {
  const url = `${GAS_WEB_APP_URL}?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url);
  return await res.json();
}

async function runLiveTests() {
  console.log("==================================================");
  console.log("LIVE GOOGLE APPS SCRIPT BACKEND INTEGRATION TESTS (PHASE 8)");
  console.log("Endpoint:", GAS_WEB_APP_URL);
  console.log("==================================================");

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

  // 1. Health Endpoint
  console.log("\n--- 1. Health Endpoint ---");
  const healthRes = await getJson({ op: "health" });
  assert(healthRes.ok === true, "health returns ok=true");
  assert(healthRes.data.service === "BASE_TYPING_GAME_BACKEND", "health returns service name");
  assert(healthRes.data.schemaVersion === "1.1.0", "health returns schemaVersion 1.1.0");
  assert(healthRes.data.timezone === "Asia/Tokyo", "health returns timezone Asia/Tokyo");
  assert(Boolean(healthRes.data.serverTime), "health returns serverTime");

  // 2. getPlayers Endpoint
  console.log("\n--- 2. getPlayers Endpoint ---");
  const playersRes = await getJson({ op: "getPlayers" });
  assert(playersRes.ok === true, "getPlayers returns ok=true");
  assert(Array.isArray(playersRes.data.players), "getPlayers returns players array");
  assert(playersRes.data.players.some((p) => p.playerId === "TEST001"), "TEST001 player exists");
  assert(playersRes.data.players.every((p) => p.playerId && p.playerName), "All players have playerId and playerName");
  assert(playersRes.data.players.every((p) => p.SortOrder === undefined && p.CreatedAt === undefined), "getPlayers does not leak internal row metadata");

  // 3. First-Time Player Submission (Auto-Creates Player)
  console.log("\n--- 3. First-Time Player Submission & Auto-Creation ---");
  const uniqueSuffix = Date.now();
  const testPlayerA = `佐藤 テスト${uniqueSuffix}`;
  const validSubIdA = `TEST-LIVE-${uniqueSuffix}-A`;
  const validPayloadA = {
    op: "submitScore",
    data: {
      submissionId: validSubIdA,
      playerName: testPlayerA,
      mode: "PRODUCTION",
      difficulty: "INTERMEDIATE",
      score: 24500,
      correctCount: 28,
      typedCharacters: 210,
      typingMistakes: 2,
      missCount: 0,
      accuracy: 99.06,
      maxCombo: 25,
      wpm: 42.0,
      kpm: 210.0,
      reachedStage: "TOKYO_TOWER",
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      appVersion: "1.0.0"
    }
  };

  const submitResA = await postJson(validPayloadA);
  assert(submitResA.ok === true, "submitScore returns ok=true");
  assert(submitResA.data.duplicate === false, "First submission is duplicate=false");
  assert(typeof submitResA.data.scoreId === "string" && submitResA.data.scoreId.startsWith("SC-"), "Server generated ScoreID starting with SC-");
  assert(submitResA.data.playerName === testPlayerA, "Server recorded PlayerName snapshot");
  assert(typeof submitResA.data.player?.playerId === "string" && submitResA.data.player.playerId.startsWith("PL-"), "Server auto-created new PlayerID starting with PL-");
  assert(submitResA.data.score === 24500, "Server recorded score matches payload");
  assert(Boolean(submitResA.data.playedAt), "Server recorded authoritative timestamp");

  const createdPlayerId = submitResA.data.player.playerId;

  // 4. Cross-Browser Simulation: Full-Width Space Resolution
  console.log("\n--- 4. Cross-Browser Space-Variant Resolution ---");
  // Test with Japanese full-width space: `佐藤　テスト<suffix>`
  const testPlayerB = `佐藤　テスト${uniqueSuffix}`;
  const validSubIdB = `TEST-LIVE-${uniqueSuffix}-B`;
  const validPayloadB = {
    op: "submitScore",
    data: {
      ...validPayloadA.data,
      submissionId: validSubIdB,
      playerName: testPlayerB,
      score: 25000
    }
  };

  const submitResB = await postJson(validPayloadB);
  assert(submitResB.ok === true, "Browser B submission returns ok=true");
  assert(submitResB.data.player.playerId === createdPlayerId, `Browser B resolved to SAME PlayerID (${createdPlayerId})!`);
  assert(submitResB.data.duplicate === false, "Browser B with distinct submissionId is recorded as separate score");

  // 5. Duplicate submitScore (Idempotency)
  console.log("\n--- 5. Duplicate submitScore (Idempotency) ---");
  const dupRes = await postJson(validPayloadA);
  assert(dupRes.ok === true, "Duplicate submission returns ok=true");
  assert(dupRes.data.duplicate === true, "Duplicate submission has duplicate=true");
  assert(dupRes.data.scoreId === submitResA.data.scoreId, "Duplicate submission returns original scoreId");
  assert(dupRes.data.submissionId === validSubIdA, "Duplicate submission returns original submissionId");

  // 6. Player Name Validation on Live Endpoint
  console.log("\n--- 6. Player Name Validation ---");
  const emptyNameRes = await postJson({
    op: "submitScore",
    data: { ...validPayloadA.data, submissionId: `TEST-INV-${Date.now()}-1`, playerName: "" }
  });
  assert(emptyNameRes.ok === false, "Empty player name rejected");
  assert(emptyNameRes.error.code === "INVALID_PLAYER_NAME", "Error code is INVALID_PLAYER_NAME");

  const whitespaceNameRes = await postJson({
    op: "submitScore",
    data: { ...validPayloadA.data, submissionId: `TEST-INV-${Date.now()}-2`, playerName: "   　  " }
  });
  assert(whitespaceNameRes.ok === false, "Whitespace-only player name rejected");
  assert(whitespaceNameRes.error.code === "INVALID_PLAYER_NAME", "Error code is INVALID_PLAYER_NAME");

  const longNameRes = await postJson({
    op: "submitScore",
    data: { ...validPayloadA.data, submissionId: `TEST-INV-${Date.now()}-3`, playerName: "あ".repeat(31) }
  });
  assert(longNameRes.ok === false, "Overly long player name rejected");
  assert(longNameRes.error.code === "INVALID_PLAYER_NAME", "Error code is INVALID_PLAYER_NAME");

  // 7. Practice Mode Rejection
  console.log("\n--- 7. Practice Mode Rejection ---");
  const pracRes = await postJson({
    op: "submitScore",
    data: { ...validPayloadA.data, submissionId: `TEST-PRAC-${Date.now()}`, mode: "PRACTICE" }
  });
  assert(pracRes.ok === false, "Practice mode submission rejected");
  assert(pracRes.error.code === "PRACTICE_MODE_NOT_RECORDED", "Error code is PRACTICE_MODE_NOT_RECORDED");

  // 8. Invalid Difficulty
  console.log("\n--- 8. Invalid Difficulty ---");
  const badDiffRes = await postJson({
    op: "submitScore",
    data: { ...validPayloadA.data, submissionId: `TEST-DIFF-${Date.now()}`, difficulty: "EXPERT" }
  });
  assert(badDiffRes.ok === false, "Invalid difficulty EXPERT rejected");
  assert(badDiffRes.error.code === "INVALID_DIFFICULTY", "Error code is INVALID_DIFFICULTY");

  // 9. Concurrency Smoke (3 distinct submissions with same playerName)
  console.log("\n--- 9. Concurrency Smoke (3 submissions for same player) ---");
  const concPromises = [1, 2, 3].map((idx) => {
    return postJson({
      op: "submitScore",
      data: {
        ...validPayloadA.data,
        submissionId: `TEST-CONC-${Date.now()}-${idx}`,
        score: 10000 + idx * 1000
      }
    });
  });
  const concResults = await Promise.all(concPromises);
  assert(concResults.every((r) => r.ok === true), "All 3 concurrent unique submissions succeeded");
  assert(concResults.every((r) => r.data.player?.playerId === createdPlayerId), "All concurrent submissions resolved to the same PlayerID");

  // 10. Same-ID Race Smoke (3 identical submissions fired simultaneously)
  console.log("\n--- 10. Same-ID Race Smoke (3 identical submissions) ---");
  const raceSubId = `TEST-RACE-${Date.now()}`;
  const racePayload = {
    op: "submitScore",
    data: {
      ...validPayloadA.data,
      submissionId: raceSubId,
      score: 33330
    }
  };
  const racePromises = [1, 2, 3].map(() => postJson(racePayload));
  const raceResults = await Promise.all(racePromises);
  const successCount = raceResults.filter((r) => r.ok && !r.data.duplicate).length;
  const dupCount = raceResults.filter((r) => r.ok && r.data.duplicate).length;
  assert(raceResults.every((r) => r.ok === true), "All 3 race requests returned ok=true");
  assert(successCount === 1, `Exactly 1 race submission created new score (got ${successCount})`);
  assert(dupCount === 2, `Remaining 2 race submissions returned duplicate=true (got ${dupCount})`);
  assert(raceResults.every((r) => r.data.scoreId === raceResults[0].data.scoreId), "All race submissions returned the identical scoreId");

  // 11. Phase 9 Live Ranking Backend Acceptance
  console.log("\n--- 11. Phase 9 Live Ranking Backend Acceptance ---");
  const rankingPlayer = `順位テスト${uniqueSuffix}`;
  
  // Submit multiple scores for same player with different values
  console.log("  Submitting 3 test scores for one player to verify best-score aggregation...");
  const rankSub1 = await postJson({
    op: "submitScore",
    data: {
      ...validPayloadA.data,
      submissionId: `TEST-RANK-${uniqueSuffix}-1`,
      playerName: rankingPlayer,
      difficulty: "BEGINNER",
      score: 11000,
      accuracy: 94.0,
      correctCount: 15,
      maxCombo: 8
    }
  });
  assert(rankSub1.ok === true, "First test score submission succeeded");

  const rankSub2 = await postJson({
    op: "submitScore",
    data: {
      ...validPayloadA.data,
      submissionId: `TEST-RANK-${uniqueSuffix}-2`,
      playerName: rankingPlayer,
      difficulty: "BEGINNER",
      score: 22500, // High score
      accuracy: 98.5,
      correctCount: 26,
      maxCombo: 20
    }
  });
  assert(rankSub2.ok === true, "Second test score submission (best: 22500) succeeded");

  const rankSub3 = await postJson({
    op: "submitScore",
    data: {
      ...validPayloadA.data,
      submissionId: `TEST-RANK-${uniqueSuffix}-3`,
      playerName: rankingPlayer,
      difficulty: "BEGINNER",
      score: 15000, // Intermediate score
      accuracy: 96.0,
      correctCount: 20,
      maxCombo: 12
    }
  });
  assert(rankSub3.ok === true, "Third test score submission succeeded");

  // Fetch MONTHLY BEGINNER ranking with currentPlayer query
  console.log("  Querying live getRankings (MONTHLY, BEGINNER)...");
  const rankMonthlyRes = await getJson({
    op: "getRankings",
    period: "MONTHLY",
    difficulty: "BEGINNER",
    limit: 10,
    playerName: rankingPlayer
  });

  assert(rankMonthlyRes.ok === true, "getRankings returns ok=true");
  assert(rankMonthlyRes.data.period === "MONTHLY", "Response period is MONTHLY");
  assert(rankMonthlyRes.data.difficulty === "BEGINNER", "Response difficulty is BEGINNER");
  assert(Boolean(rankMonthlyRes.data.monthKey), "Response has monthKey (e.g. 2026-09)");
  assert(rankMonthlyRes.data.timezone === "Asia/Tokyo", "Response timezone is Asia/Tokyo");
  assert(Array.isArray(rankMonthlyRes.data.entries), "entries is an Array");
  assert(typeof rankMonthlyRes.data.totalPlayers === "number", "totalPlayers is a number");

  // Verify best-record rule & anti-spam: exactly ONE entry for rankingPlayer with score 22500
  const playerEntries = rankMonthlyRes.data.entries.filter((e) => e.playerName === rankingPlayer);
  assert(playerEntries.length === 1, "Player appears exactly ONCE in ranking entries despite 3 submissions");
  assert(playerEntries[0].score === 22500, `Player's best score (22500) is adopted (got ${playerEntries[0].score})`);
  assert(playerEntries[0].accuracy === 98.5, "Player's best accuracy is adopted");

  // Verify currentPlayer resolution
  assert(rankMonthlyRes.data.currentPlayer !== null, "currentPlayer is returned");
  assert(rankMonthlyRes.data.currentPlayer.playerName === rankingPlayer, "currentPlayer playerName matches");
  assert(rankMonthlyRes.data.currentPlayer.score === 22500, "currentPlayer score is 22500");
  assert(typeof rankMonthlyRes.data.currentPlayer.rank === "number", "currentPlayer has numeric rank");

  // Verify data minimization: no internal IDs or timestamps leaked in public ranking
  const firstEntry = rankMonthlyRes.data.entries[0];
  assert(firstEntry.playerId === undefined, "playerId is NOT in public ranking entry");
  assert(firstEntry.submissionId === undefined, "submissionId is NOT in public ranking entry");
  assert(firstEntry.scoreId === undefined, "scoreId is NOT in public ranking entry");
  assert(firstEntry.playedAtServer === undefined, "playedAtServer is NOT in public ranking entry");
  assert(firstEntry.appVersion === undefined, "appVersion is NOT in public ranking entry");

  // Query ALL_TIME BEGINNER
  console.log("  Querying live getRankings (ALL_TIME, BEGINNER)...");
  const rankAllTimeRes = await getJson({
    op: "getRankings",
    period: "ALL_TIME",
    difficulty: "BEGINNER",
    limit: 10
  });
  assert(rankAllTimeRes.ok === true, "ALL_TIME getRankings returns ok=true");
  assert(rankAllTimeRes.data.period === "ALL_TIME", "Response period is ALL_TIME");
  assert(rankAllTimeRes.data.entries.length >= 1, "ALL_TIME entries contains at least 1 record");

  // Query other difficulties (INTERMEDIATE, ADVANCED)
  console.log("  Querying live getRankings for INTERMEDIATE and ADVANCED...");
  const rankIntRes = await getJson({ op: "getRankings", period: "MONTHLY", difficulty: "INTERMEDIATE" });
  assert(rankIntRes.ok === true, "INTERMEDIATE ranking returns ok=true");
  const rankAdvRes = await getJson({ op: "getRankings", period: "MONTHLY", difficulty: "ADVANCED" });
  assert(rankAdvRes.ok === true, "ADVANCED ranking returns ok=true");

  // Query validation rejection
  console.log("  Verifying server-side query parameter validation rejection...");
  const invPeriodRes = await getJson({ op: "getRankings", period: "YEARLY" });
  assert(invPeriodRes.ok === false && invPeriodRes.error.code === "INVALID_PERIOD", "Invalid period YEARLY safely rejected");

  const invDiffRes = await getJson({ op: "getRankings", difficulty: "EXPERT" });
  assert(invDiffRes.ok === false && invDiffRes.error.code === "INVALID_DIFFICULTY", "Invalid difficulty EXPERT safely rejected");

  const invLimitRes = await getJson({ op: "getRankings", limit: 0 });
  assert(invLimitRes.ok === false && invLimitRes.error.code === "INVALID_LIMIT", "Limit 0 safely rejected");

  console.log("\n==================================================");
  console.log(`LIVE TESTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runLiveTests().catch((err) => {
  console.error("Live test failed with fatal error:", err);
  process.exit(1);
});
