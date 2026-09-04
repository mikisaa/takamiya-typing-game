import { BACKEND_CONFIG } from "../backend/shared/backendConfig.js";
import { BackendService } from "../backend/shared/backendService.js";
import { FakeSpreadsheetDb } from "../backend/shared/fakeSpreadsheetDb.js";
import {
  sanitizeSpreadsheetFormula,
  normalizePlayerName,
  sanitizeDisplayName
} from "../backend/shared/backendValidator.js";

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
        { PlayerID: "P001", PlayerName: "佐藤 健一", PlayerNameKey: "佐藤 健一", Enabled: true, SortOrder: 1 },
        { PlayerID: "P002", PlayerName: "鈴木 一郎", PlayerNameKey: "鈴木 一郎", Enabled: true, SortOrder: 2 },
        { PlayerID: "P003", PlayerName: "高橋 誠", PlayerNameKey: "高橋 誠", Enabled: false, SortOrder: 3 }, // Disabled
        { PlayerID: "P004", PlayerName: "田中 太郎", PlayerNameKey: "田中 太郎", Enabled: true, SortOrder: 2 }
      ]
    });
    const service = new BackendService(db);
    return { db, service };
  }

  function getValidPayload(overrides = {}) {
    return {
      submissionId: `SUB-${Date.now()}-${Math.random()}`,
      playerName: "佐藤 健一",
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
      startedAt: "2026-09-04T07:00:00.000Z",
      finishedAt: "2026-09-04T07:01:30.000Z",
      appVersion: "1.0.0",
      ...overrides
    };
  }

  // 1. Schema & Config Definitions
  assert(BACKEND_CONFIG.SERVICE_NAME === "TAKAMIYA_TYPING_GAME_BACKEND", "Service name matches specification");
  assert(BACKEND_CONFIG.SCHEMA_VERSION === "1.1.0", "Schema version is 1.1.0");
  assert(BACKEND_CONFIG.TIMEZONE === "Asia/Tokyo", "Authoritative timezone is Asia/Tokyo");
  assert(BACKEND_CONFIG.SCHEMAS.PLAYERS_HEADERS.length === 7, "Players sheet has 7 columns (including PlayerNameKey)");
  assert(BACKEND_CONFIG.SCHEMAS.PLAYERS_HEADERS[2] === "PlayerNameKey", "Column 3 is PlayerNameKey");
  assert(BACKEND_CONFIG.SCHEMAS.SCORES_HEADERS.length === 19, "Scores sheet has 19 columns");
  assert(BACKEND_CONFIG.SCHEMAS.META_HEADERS.length === 3, "Meta sheet has 3 columns");
  assert(BACKEND_CONFIG.SHEET_NAMES.QUESTIONS === undefined, "Question Master is NOT in Spreadsheet (CSV remains SSOT)");

  // 2. Player Name Normalization Unit Tests
  console.log("\n--- Testing Player Name Normalization & Key Generation ---");
  assert(normalizePlayerName("山田 太郎") === "山田 太郎", "normalize Japanese standard space");
  assert(normalizePlayerName("山田　太郎") === "山田 太郎", "normalize Japanese full-width space to single ASCII space");
  assert(normalizePlayerName("  山田 太郎  ") === "山田 太郎", "trim leading and trailing whitespace");
  assert(normalizePlayerName("山田  　  太郎") === "山田 太郎", "collapse multiple and mixed whitespace into single space");
  assert(normalizePlayerName("ＭＩＫＩ") === "miki", "Unicode NFKC converts full-width alphabet and lowercases");
  assert(normalizePlayerName("Miki") === "miki", "ASCII case normalization (Miki -> miki)");
  assert(normalizePlayerName("MIKI") === "miki", "ASCII case normalization (MIKI -> miki)");
  assert(normalizePlayerName("miki") === "miki", "ASCII case normalization (miki -> miki)");
  assert(normalizePlayerName(" 山田　太郎 ") === normalizePlayerName("山田 太郎"), "Different representations resolve to identical PlayerNameKey");

  // Display Name Sanitization
  assert(sanitizeDisplayName("  山田　太郎  ") === "山田 太郎", "sanitizeDisplayName normalizes spacing while preserving letters");
  assert(sanitizeDisplayName("Miki Tanaka") === "Miki Tanaka", "sanitizeDisplayName preserves original casing for display");

  // 3. Health Operation
  const { db, service } = createTestEnv();
  const healthRes = service.health();
  assert(healthRes.ok === true, "health returns ok=true");
  assert(healthRes.data.service === "TAKAMIYA_TYPING_GAME_BACKEND", "health data contains service name");
  assert(healthRes.data.schemaVersion === "1.1.0", "health data contains schemaVersion 1.1.0");
  assert(healthRes.data.timezone === "Asia/Tokyo", "health data specifies Asia/Tokyo timezone");
  assert(Boolean(healthRes.data.serverTime), "health data contains serverTime");

  // 4. getPlayers Operation
  const playersRes = service.getPlayers();
  assert(playersRes.ok === true, "getPlayers returns ok=true");
  assert(Array.isArray(playersRes.data.players), "getPlayers returns players array");
  assert(playersRes.data.players.length === 3, "getPlayers filters out disabled player P003 (got 3)");
  assert(playersRes.data.players[0].playerId === "P001", "getPlayers sorts correctly (P001 is first)");
  assert(playersRes.data.players.every((p) => p.playerId && p.playerName), "All returned players have playerId and playerName");
  assert(playersRes.data.players.every((p) => p.SortOrder === undefined && p.CreatedAt === undefined), "getPlayers excludes internal row metadata");

  // 5. submitScore — Existing Player Resolution & Success Path
  const validPayload = getValidPayload({ submissionId: "SUB-SUCCESS-001", playerName: "佐藤 健一" });
  const submitRes = service.submitScore(validPayload);
  assert(submitRes.ok === true, "Valid score submission returns ok=true");
  assert(submitRes.data.duplicate === false, "First submission is duplicate=false");
  assert(submitRes.data.scoreId.startsWith("SC-"), "Server generated ScoreID starting with SC-");
  assert(submitRes.data.playerName === "佐藤 健一", "Server-resolved PlayerName returned");
  assert(submitRes.data.score === 18450, "Returned score matches submitted score");
  assert(submitRes.data.player.playerId === "P001", "Resolved to existing PlayerID P001");

  // Verify row appended in Scores table
  const allScores = db.getAllScores();
  assert(allScores.length === 1, "Scores table contains exactly 1 row");
  const row = allScores[0];
  assert(row.SubmissionID === "SUB-SUCCESS-001", "Row has correct SubmissionID");
  assert(row.PlayerID === "P001", "Row has resolved PlayerID P001");
  assert(row.PlayerNameSnapshot === "佐藤 健一", "Row has authoritative PlayerNameSnapshot");
  assert(row.Difficulty === "INTERMEDIATE", "Row has Difficulty INTERMEDIATE");
  assert(row.ReachedStage === "HIGHRISE", "Row has ReachedStage HIGHRISE");
  assert(Boolean(row.PlayedAtServer), "Row has server authoritative timestamp PlayedAtServer");

  // 6. submitScore — Automatic Player Creation on First Input
  console.log("\n--- Testing Automatic Player Creation on First Entry ---");
  const newPlayerPayload = getValidPayload({
    submissionId: "SUB-NEW-PLAYER-001",
    playerName: "足場 太郎"
  });
  const newPlayerRes = service.submitScore(newPlayerPayload);
  assert(newPlayerRes.ok === true, "First-time player submission succeeds");
  assert(newPlayerRes.data.player.playerId.startsWith("PL-"), "Server generated new PlayerID starting with PL-");
  assert(newPlayerRes.data.player.playerName === "足場 太郎", "Server stored display name");
  const createdPlayerInDb = db.findPlayerByNameKey("足場 太郎");
  assert(Boolean(createdPlayerInDb), "Player record added to Players master table");
  assert(createdPlayerInDb.PlayerNameKey === "足場 太郎", "PlayerNameKey correctly stored in master");

  // 7. Cross-Browser Resolution Simulation
  console.log("\n--- Testing Cross-Browser Name Resolution ---");
  // Browser B enters full-width space variant
  const browserBPayload = getValidPayload({
    submissionId: "SUB-BROWSER-B-001",
    playerName: "足場　太郎" // full-width space
  });
  const browserBRes = service.submitScore(browserBPayload);
  assert(browserBRes.ok === true, "Browser B submission with full-width space succeeds");
  assert(browserBRes.data.player.playerId === newPlayerRes.data.player.playerId, "Browser B resolved to SAME PlayerID as Browser A!");
  assert(db.players.length === 5, "No duplicate Player row created in Players sheet (still 5 total)");

  // 8. Idempotent Duplicate Submission Protection
  console.log("\n--- Testing Idempotency & Duplicate Protection ---");
  const dupRes = service.submitScore(validPayload);
  assert(dupRes.ok === true, "Duplicate submission returns ok=true (idempotent)");
  assert(dupRes.data.duplicate === true, "Duplicate submission flag is true");
  assert(dupRes.data.scoreId === submitRes.data.scoreId, "Duplicate submission returns original ScoreID");

  // 9. Mode Enforcement (Reject PRACTICE mode)
  const practicePayload = getValidPayload({ mode: "PRACTICE" });
  const practiceRes = service.submitScore(practicePayload);
  assert(practiceRes.ok === false, "PRACTICE mode submission rejected");
  assert(practiceRes.error.code === BACKEND_CONFIG.ERROR_CODES.PRACTICE_MODE_NOT_RECORDED, "Rejection code is PRACTICE_MODE_NOT_RECORDED");

  // 10. Player Name Validation Negative Tests
  console.log("\n--- Testing Player Name Validation Constraints ---");
  const emptyNameRes = service.submitScore(getValidPayload({ playerName: "" }));
  assert(emptyNameRes.ok === false, "Empty player name rejected");
  assert(emptyNameRes.error.code === BACKEND_CONFIG.ERROR_CODES.INVALID_PLAYER_NAME, "Error code is INVALID_PLAYER_NAME");

  const whitespaceNameRes = service.submitScore(getValidPayload({ playerName: "   　  " }));
  assert(whitespaceNameRes.ok === false, "Whitespace-only player name rejected");
  assert(whitespaceNameRes.error.code === BACKEND_CONFIG.ERROR_CODES.INVALID_PLAYER_NAME, "Error code is INVALID_PLAYER_NAME");

  const longName = "あ".repeat(31);
  const longNameRes = service.submitScore(getValidPayload({ playerName: longName }));
  assert(longNameRes.ok === false, "Player name > 30 characters rejected");
  assert(longNameRes.error.code === BACKEND_CONFIG.ERROR_CODES.INVALID_PLAYER_NAME, "Error code is INVALID_PLAYER_NAME");

  const missingNameRes = service.submitScore(getValidPayload({ playerName: undefined }));
  assert(missingNameRes.ok === false, "Missing playerName parameter rejected");
  assert(missingNameRes.error.code === BACKEND_CONFIG.ERROR_CODES.MISSING_PARAMETER, "Error code is MISSING_PARAMETER");

  // 11. Disabled Player Rejection
  const disabledPlayerRes = service.submitScore(getValidPayload({ playerName: "高橋 誠" })); // P003 is disabled
  assert(disabledPlayerRes.ok === false, "Disabled player name rejected");
  assert(disabledPlayerRes.error.code === BACKEND_CONFIG.ERROR_CODES.PLAYER_DISABLED, "Error code is PLAYER_DISABLED");

  // 12. Difficulty & Stage Validation
  const badDiffRes = service.submitScore(getValidPayload({ difficulty: "EXPERT" }));
  assert(badDiffRes.ok === false, "Invalid difficulty EXPERT rejected");
  assert(badDiffRes.error.code === BACKEND_CONFIG.ERROR_CODES.INVALID_DIFFICULTY, "Rejection code is INVALID_DIFFICULTY");

  const badStageRes = service.submitScore(getValidPayload({ reachedStage: "SPACE_STATION" }));
  assert(badStageRes.ok === false, "Invalid stage SPACE_STATION rejected");
  assert(badStageRes.error.code === BACKEND_CONFIG.ERROR_CODES.INVALID_STAGE, "Rejection code is INVALID_STAGE");

  // 13. Numeric Limits Validation
  assert(service.submitScore(getValidPayload({ score: -100 })).ok === false, "Negative score rejected");
  assert(service.submitScore(getValidPayload({ score: 9999999 })).ok === false, "Absurdly large score rejected");
  assert(service.submitScore(getValidPayload({ score: 100.5 })).ok === false, "Non-integer score rejected");
  assert(service.submitScore(getValidPayload({ accuracy: -5 })).ok === false, "Negative accuracy rejected");
  assert(service.submitScore(getValidPayload({ accuracy: 105 })).ok === false, "Accuracy > 100 rejected");
  assert(service.submitScore(getValidPayload({ accuracy: NaN })).ok === false, "NaN accuracy rejected");
  assert(service.submitScore(getValidPayload({ score: Infinity })).ok === false, "Infinity score rejected");

  // 14. Formula Injection Sanitization
  assert(sanitizeSpreadsheetFormula("NormalName") === "NormalName", "Safe string unchanged");
  assert(sanitizeSpreadsheetFormula("=SUM(A1:A10)") === "'=SUM(A1:A10)", "Leading = escaped with single quote");
  assert(sanitizeSpreadsheetFormula("+cmd|' /C calc'!A0") === "'+cmd|' /C calc'!A0", "Leading + escaped with single quote");
  assert(sanitizeSpreadsheetFormula("-1+1") === "'-1+1", "Leading - escaped with single quote");
  assert(sanitizeSpreadsheetFormula("@SUM(A1:A10)") === "'@SUM(A1:A10)", "Leading @ escaped with single quote");

  // 15. Concurrency Lock Handling
  const lockContentionDb = new FakeSpreadsheetDb({
    players: [{ PlayerID: "P001", PlayerName: "佐藤 健一", PlayerNameKey: "佐藤 健一", Enabled: true }]
  });
  lockContentionDb.acquireLock(); // Lock pre-acquired by another request
  const lockService = new BackendService(lockContentionDb);
  const lockRes = lockService.submitScore(getValidPayload());
  assert(lockRes.ok === false, "Submission rejected when lock cannot be acquired");
  assert(lockRes.error.code === BACKEND_CONFIG.ERROR_CODES.LOCK_TIMEOUT, "Rejection code is LOCK_TIMEOUT");

  return { passed, failed };
}
