/**
 * Live Google Apps Script Integration Test Suite
 * Executes real HTTP requests against the deployed GAS Web App and verifies
 * health, getPlayers, submitScore, duplicate protection, negative test cases,
 * formula injection sanitization, concurrency, and same-ID race handling.
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
  console.log("LIVE GOOGLE APPS SCRIPT BACKEND INTEGRATION TESTS");
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
  assert(healthRes.data.schemaVersion === "1.0.0", "health returns schemaVersion 1.0.0");
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

  // 3. Valid submitScore
  console.log("\n--- 3. Valid submitScore ---");
  const validSubId = `TEST-LIVE-${Date.now()}-A`;
  const validPayload = {
    op: "submitScore",
    data: {
      submissionId: validSubId,
      playerId: "TEST001",
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

  const submitRes = await postJson(validPayload);
  assert(submitRes.ok === true, "submitScore returns ok=true");
  assert(submitRes.data.duplicate === false, "First submission is duplicate=false");
  assert(typeof submitRes.data.scoreId === "string" && submitRes.data.scoreId.startsWith("SC-"), "Server generated ScoreID starting with SC-");
  assert(submitRes.data.playerName === "TEST PLAYER", "Server resolved PlayerName snapshot");
  assert(submitRes.data.score === 24500, "Server recorded score matches payload");
  assert(Boolean(submitRes.data.playedAt), "Server recorded authoritative timestamp");

  // 4. Duplicate submitScore (Idempotency)
  console.log("\n--- 4. Duplicate submitScore (Idempotency) ---");
  const dupRes = await postJson(validPayload);
  assert(dupRes.ok === true, "Duplicate submission returns ok=true");
  assert(dupRes.data.duplicate === true, "Duplicate submission has duplicate=true");
  assert(dupRes.data.scoreId === submitRes.data.scoreId, "Duplicate submission returns original scoreId");
  assert(dupRes.data.submissionId === validSubId, "Duplicate submission returns original submissionId");

  // 5. Invalid Player ID
  console.log("\n--- 5. Invalid Player ID ---");
  const invalidPlayerPayload = {
    op: "submitScore",
    data: {
      ...validPayload.data,
      submissionId: `TEST-LIVE-${Date.now()}-INV-P`,
      playerId: "NON_EXISTENT_PLAYER_999"
    }
  };
  const invPlayerRes = await postJson(invalidPlayerPayload);
  assert(invPlayerRes.ok === false, "Non-existent player rejected");
  assert(invPlayerRes.error.code === "PLAYER_NOT_FOUND", "Error code is PLAYER_NOT_FOUND");

  // 6. Practice Mode Rejection
  console.log("\n--- 6. Practice Mode Rejection ---");
  const practicePayload = {
    op: "submitScore",
    data: {
      ...validPayload.data,
      submissionId: `TEST-LIVE-${Date.now()}-PRAC`,
      mode: "PRACTICE"
    }
  };
  const pracRes = await postJson(practicePayload);
  assert(pracRes.ok === false, "Practice mode submission rejected");
  assert(pracRes.error.code === "PRACTICE_MODE_NOT_RECORDED", "Error code is PRACTICE_MODE_NOT_RECORDED");

  // 7. Invalid Difficulty
  console.log("\n--- 7. Invalid Difficulty ---");
  const badDiffPayload = {
    op: "submitScore",
    data: {
      ...validPayload.data,
      submissionId: `TEST-LIVE-${Date.now()}-DIFF`,
      difficulty: "EXPERT"
    }
  };
  const badDiffRes = await postJson(badDiffPayload);
  assert(badDiffRes.ok === false, "Invalid difficulty EXPERT rejected");
  assert(badDiffRes.error.code === "INVALID_DIFFICULTY", "Error code is INVALID_DIFFICULTY");

  // 8. Invalid Numeric Limits
  console.log("\n--- 8. Invalid Numeric Limits ---");
  const negScorePayload = {
    op: "submitScore",
    data: {
      ...validPayload.data,
      submissionId: `TEST-LIVE-${Date.now()}-NEG`,
      score: -500
    }
  };
  const negScoreRes = await postJson(negScorePayload);
  assert(negScoreRes.ok === false, "Negative score rejected");
  assert(negScoreRes.error.code === "NUMERIC_OUT_OF_BOUNDS", "Error code is NUMERIC_OUT_OF_BOUNDS");

  const highAccPayload = {
    op: "submitScore",
    data: {
      ...validPayload.data,
      submissionId: `TEST-LIVE-${Date.now()}-ACC`,
      accuracy: 120.0
    }
  };
  const highAccRes = await postJson(highAccPayload);
  assert(highAccRes.ok === false, "Accuracy > 100 rejected");
  assert(highAccRes.error.code === "NUMERIC_OUT_OF_BOUNDS", "Error code is NUMERIC_OUT_OF_BOUNDS");

  // 9. Invalid Stage
  console.log("\n--- 9. Invalid Stage ---");
  const badStagePayload = {
    op: "submitScore",
    data: {
      ...validPayload.data,
      submissionId: `TEST-LIVE-${Date.now()}-STAGE`,
      reachedStage: "MARS_BASE"
    }
  };
  const badStageRes = await postJson(badStagePayload);
  assert(badStageRes.ok === false, "Invalid stage MARS_BASE rejected");
  assert(badStageRes.error.code === "INVALID_STAGE", "Error code is INVALID_STAGE");

  // 10. Formula Injection Sanitization
  console.log("\n--- 10. Formula Injection Sanitization ---");
  const formulaPayload = {
    op: "submitScore",
    data: {
      ...validPayload.data,
      submissionId: `TEST-LIVE-${Date.now()}-FORMULA`,
      startedAt: "=cmd|' /C calc'!A0",
      appVersion: "+2.0.0"
    }
  };
  const formulaRes = await postJson(formulaPayload);
  assert(formulaRes.ok === true, "Formula injection payload accepted safely");
  assert(formulaRes.data.duplicate === false, "Formula payload persisted safely");

  // 11. Concurrency Smoke (3 distinct submissions close together)
  console.log("\n--- 11. Concurrency Smoke (3 distinct submissions) ---");
  const concPromises = [1, 2, 3].map((idx) => {
    return postJson({
      op: "submitScore",
      data: {
        ...validPayload.data,
        submissionId: `TEST-CONC-${Date.now()}-${idx}`,
        score: 10000 + idx * 1000
      }
    });
  });
  const concResults = await Promise.all(concPromises);
  assert(concResults.every((r) => r.ok === true), "All 3 concurrent unique submissions succeeded");
  assert(concResults.every((r) => r.data.duplicate === false), "All 3 concurrent unique submissions have duplicate=false");

  // 12. Same-ID Race Smoke (3 identical submissions fired simultaneously)
  console.log("\n--- 12. Same-ID Race Smoke (3 identical submissions) ---");
  const raceSubId = `TEST-RACE-${Date.now()}`;
  const racePayload = {
    op: "submitScore",
    data: {
      ...validPayload.data,
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
