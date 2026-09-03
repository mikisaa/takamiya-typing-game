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
