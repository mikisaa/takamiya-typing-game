import { BACKEND_CONFIG } from "../backend/shared/backendConfig.js";
import { BackendService } from "../backend/shared/backendService.js";
import { FakeSpreadsheetDb } from "../backend/shared/fakeSpreadsheetDb.js";
import { sanitizeSpreadsheetFormula } from "../backend/shared/backendValidator.js";

export function runBackendFoundationTests() {
  console.log("\n=== Testing Backend Architecture, Spreadsheet Schema & GAS APIs ===");
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

  // Helper to construct a fresh test environment
  function createTestEnv() {
    const db = new FakeSpreadsheetDb({
      players: [
        { PlayerID: "P001", PlayerName: "佐藤 健一", Enabled: true, SortOrder: 1 },
        { PlayerID: "P002", PlayerName: "鈴木 一郎", Enabled: true, SortOrder: 2 },
        { PlayerID: "P003", PlayerName: "高橋 誠", Enabled: false, SortOrder: 3 }, // Disabled
        { PlayerID: "P004", PlayerName: "田中 太郎", Enabled: true, SortOrder: 2 }
      ]
    });
    const service = new BackendService(db);
    return { db, service };
  }

  function getValidPayload(overrides = {}) {
    return {
      submissionId: `SUB-${Date.now()}-${Math.random()}`,
      playerId: "P001",
      mode: "PRODUCTION",
      difficulty: "INTERMEDIATE",
      score: 18450,
      correctCount: 22,
      typedCharacters: 185,
      typingMistakes: 3,
      missCount: 1,
      accuracy: 98.38,
      maxCombo: 16,
      wpm: 38.5,
      kpm: 192.5,
      reachedStage: "HIGHRISE",
      startedAt: "2026-09-03T00:00:00.000Z",
      finishedAt: "2026-09-03T00:01:30.000Z",
      appVersion: "1.0.0",
      ...overrides
    };
  }

  // 1. Schema & Config Definitions
  assert(BACKEND_CONFIG.SERVICE_NAME === "BASE_TYPING_GAME_BACKEND", "Service name matches specification");
  assert(BACKEND_CONFIG.SCHEMA_VERSION === "1.0.0", "Schema version is 1.0.0");
  assert(BACKEND_CONFIG.TIMEZONE === "Asia/Tokyo", "Authoritative timezone is Asia/Tokyo");
  assert(BACKEND_CONFIG.SCHEMAS.PLAYERS_HEADERS.length === 6, "Players sheet has 6 columns");
  assert(BACKEND_CONFIG.SCHEMAS.SCORES_HEADERS.length === 19, "Scores sheet has 19 columns");
  assert(BACKEND_CONFIG.SCHEMAS.META_HEADERS.length === 3, "Meta sheet has 3 columns");
  assert(BACKEND_CONFIG.SHEET_NAMES.QUESTIONS === undefined, "Question Master is NOT in Spreadsheet (CSV remains SSOT)");

  // 2. Health Operation
  const { db, service } = createTestEnv();
  const healthRes = service.health();
  assert(healthRes.ok === true, "health returns ok=true");
  assert(healthRes.data.service === "BASE_TYPING_GAME_BACKEND", "health data contains service name");
  assert(healthRes.data.schemaVersion === "1.0.0", "health data contains schemaVersion 1.0.0");
  assert(healthRes.data.timezone === "Asia/Tokyo", "health data specifies Asia/Tokyo timezone");
  assert(Boolean(healthRes.data.serverTime), "health data contains serverTime");

  // 3. getPlayers Operation
  const playersRes = service.getPlayers();
  assert(playersRes.ok === true, "getPlayers returns ok=true");
  assert(Array.isArray(playersRes.data.players), "getPlayers returns players array");
  assert(playersRes.data.players.length === 3, "getPlayers filters out disabled player P003 (got 3)");
  assert(playersRes.data.players[0].playerId === "P001", "getPlayers sorts correctly (P001 is first)");
  assert(playersRes.data.players.every((p) => p.playerId && p.playerName), "All returned players have playerId and playerName");
  assert(playersRes.data.players.every((p) => p.SortOrder === undefined && p.CreatedAt === undefined), "getPlayers excludes internal row metadata");

  // 4. submitScore — Success Path
  const validPayload = getValidPayload({ submissionId: "SUB-SUCCESS-001" });
  const submitRes = service.submitScore(validPayload);
  assert(submitRes.ok === true, "Valid score submission returns ok=true");
  assert(submitRes.data.duplicate === false, "First submission is duplicate=false");
  assert(submitRes.data.scoreId.startsWith("SC-"), "Server generated ScoreID starting with SC-");
  assert(submitRes.data.playerName === "佐藤 健一", "Server-resolved PlayerName returned");
  assert(submitRes.data.score === 18450, "Returned score matches submitted score");

  // Verify row appended in Scores table
  const allScores = db.getAllScores();
  assert(allScores.length === 1, "Scores table contains exactly 1 row");
  const row = allScores[0];
  assert(row.SubmissionID === "SUB-SUCCESS-001", "Row has correct SubmissionID");
  assert(row.PlayerID === "P001", "Row has correct PlayerID");
  assert(row.PlayerNameSnapshot === "佐藤 健一", "Row has authoritative PlayerNameSnapshot");
  assert(row.Difficulty === "INTERMEDIATE", "Row has Difficulty INTERMEDIATE");
  assert(row.ReachedStage === "HIGHRISE", "Row has ReachedStage HIGHRISE");
  assert(Boolean(row.PlayedAtServer), "Row has server authoritative timestamp PlayedAtServer");

  // 5. Idempotent Duplicate Submission Protection
  const dupRes = service.submitScore(validPayload);
  assert(dupRes.ok === true, "Duplicate submission returns ok=true (idempotent)");
  assert(dupRes.data.duplicate === true, "Duplicate submission flag is true");
  assert(dupRes.data.scoreId === submitRes.data.scoreId, "Duplicate submission returns original ScoreID");
  assert(db.getAllScores().length === 1, "Scores table still contains only 1 row after duplicate submission");

  // 6. Mode Enforcement (Reject PRACTICE mode)
  const practicePayload = getValidPayload({ mode: "PRACTICE" });
  const practiceRes = service.submitScore(practicePayload);
  assert(practiceRes.ok === false, "PRACTICE mode submission rejected");
  assert(practiceRes.error.code === BACKEND_CONFIG.ERROR_CODES.PRACTICE_MODE_NOT_RECORDED, "Rejection code is PRACTICE_MODE_NOT_RECORDED");
  assert(db.getAllScores().length === 1, "Scores table row count unchanged after rejected PRACTICE submission");

  // 7. Difficulty Validation
  const badDiffRes = service.submitScore(getValidPayload({ difficulty: "EXPERT" }));
  assert(badDiffRes.ok === false, "Invalid difficulty EXPERT rejected");
  assert(badDiffRes.error.code === BACKEND_CONFIG.ERROR_CODES.INVALID_DIFFICULTY, "Rejection code is INVALID_DIFFICULTY");

  // 8. ReachedStage Validation
  const badStageRes = service.submitScore(getValidPayload({ reachedStage: "SPACE_STATION" }));
  assert(badStageRes.ok === false, "Invalid stage SPACE_STATION rejected");
  assert(badStageRes.error.code === BACKEND_CONFIG.ERROR_CODES.INVALID_STAGE, "Rejection code is INVALID_STAGE");

  // 9. Player ID & Status Validation
  const unknownPlayerRes = service.submitScore(getValidPayload({ playerId: "P999" }));
  assert(unknownPlayerRes.ok === false, "Unknown PlayerID rejected");
  assert(unknownPlayerRes.error.code === BACKEND_CONFIG.ERROR_CODES.PLAYER_NOT_FOUND, "Rejection code is PLAYER_NOT_FOUND");

  const disabledPlayerRes = service.submitScore(getValidPayload({ playerId: "P003" }));
  assert(disabledPlayerRes.ok === false, "Disabled PlayerID P003 rejected");
  assert(disabledPlayerRes.error.code === BACKEND_CONFIG.ERROR_CODES.PLAYER_DISABLED, "Rejection code is PLAYER_DISABLED");

  // 10. Numeric Limits Validation
  assert(service.submitScore(getValidPayload({ score: -100 })).ok === false, "Negative score rejected");
  assert(service.submitScore(getValidPayload({ score: 9999999 })).ok === false, "Absurdly large score rejected");
  assert(service.submitScore(getValidPayload({ score: 100.5 })).ok === false, "Non-integer score rejected");
  assert(service.submitScore(getValidPayload({ accuracy: -5 })).ok === false, "Negative accuracy rejected");
  assert(service.submitScore(getValidPayload({ accuracy: 105 })).ok === false, "Accuracy > 100 rejected");
  assert(service.submitScore(getValidPayload({ accuracy: NaN })).ok === false, "NaN accuracy rejected");
  assert(service.submitScore(getValidPayload({ score: Infinity })).ok === false, "Infinity score rejected");

  // 11. Formula Injection Sanitization
  assert(sanitizeSpreadsheetFormula("NormalName") === "NormalName", "Safe string unchanged");
  assert(sanitizeSpreadsheetFormula("=SUM(A1:A10)") === "'=SUM(A1:A10)", "Leading = escaped with single quote");
  assert(sanitizeSpreadsheetFormula("+cmd|' /C calc'!A0") === "'+cmd|' /C calc'!A0", "Leading + escaped with single quote");
  assert(sanitizeSpreadsheetFormula("-1+1") === "'-1+1", "Leading - escaped with single quote");
  assert(sanitizeSpreadsheetFormula("@SUM(A1:A10)") === "'@SUM(A1:A10)", "Leading @ escaped with single quote");

  // 12. Concurrency Lock Handling
  const lockContentionDb = new FakeSpreadsheetDb({
    players: [{ PlayerID: "P001", PlayerName: "佐藤 健一", Enabled: true }]
  });
  lockContentionDb.acquireLock(); // Lock pre-acquired by another request
  const lockService = new BackendService(lockContentionDb);
  const lockRes = lockService.submitScore(getValidPayload());
  assert(lockRes.ok === false, "Submission rejected when lock cannot be acquired");
  assert(lockRes.error.code === BACKEND_CONFIG.ERROR_CODES.LOCK_TIMEOUT, "Rejection code is LOCK_TIMEOUT");

  return { passed, failed };
}
