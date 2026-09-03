import {
  getLastPlayerName,
  setLastPlayerName,
  clearLastPlayerName,
  STORAGE_KEY_LAST_PLAYER_NAME
} from "../src/storage/playerStorage.js";
import { GameSession } from "../src/engine/gameSession.js";
import { GAME_MODES, DIFFICULTY_LEVELS } from "../src/engine/gameState.js";
import { DEFAULT_QUESTIONS } from "../src/data/defaultQuestions.js";
import { BackendClient, BACKEND_WEB_APP_URL } from "../src/api/backendClient.js";

export function runPhase8PlayerAndFrontendTests() {
  console.log("\n=== Testing Phase 8 Free-Entry Player Name, Storage & Frontend Integration ===");
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

  // 1. Mock LocalStorage Implementation
  function createMockStorage() {
    const store = {};
    return {
      getItem: (key) => (key in store ? store[key] : null),
      setItem: (key, value) => { store[key] = String(value); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach((k) => delete store[k]); }
    };
  }

  // 2. Storage Tests (Section 53 & 54)
  console.log("\n--- Testing Browser LocalStorage Memory ---");
  const mockStorage = createMockStorage();

  // Test 2.1: No stored name returns blank
  assert(getLastPlayerName(mockStorage) === "", "No stored name returns empty string");

  // Test 2.2: Saving player name
  setLastPlayerName("山田 太郎", mockStorage);
  assert(getLastPlayerName(mockStorage) === "山田 太郎", "getLastPlayerName retrieves stored name");
  assert(mockStorage.getItem(STORAGE_KEY_LAST_PLAYER_NAME) === "山田 太郎", "Direct storage check matches key");

  // Test 2.3: Name change overwrites stored name (Shared PC scenario)
  setLastPlayerName("鈴木 一郎", mockStorage);
  assert(getLastPlayerName(mockStorage) === "鈴木 一郎", "New name overwrites previous stored name");

  // Test 2.4: Trimming on save
  setLastPlayerName("   田中 誠   ", mockStorage);
  assert(getLastPlayerName(mockStorage) === "田中 誠", "Whitespace trimmed before storing");

  // Test 2.5: Empty/whitespace name does not overwrite with invalid data
  setLastPlayerName("   ", mockStorage);
  assert(getLastPlayerName(mockStorage) === "田中 誠", "Empty string does not overwrite valid stored name");

  // Test 2.6: Clear player name
  clearLastPlayerName(mockStorage);
  assert(getLastPlayerName(mockStorage) === "", "clearLastPlayerName resets to empty");

  // Test 2.7: Graceful failure when storage throws (Privacy/Incognito restrictions)
  const throwingStorage = {
    getItem: () => { throw new Error("SecurityError: Access to localStorage is denied"); },
    setItem: () => { throw new Error("QuotaExceededError"); },
    removeItem: () => { throw new Error("SecurityError"); }
  };
  assert(getLastPlayerName(throwingStorage) === "", "Throws in getItem return safe default without crashing");
  // setLastPlayerName should not throw
  let threw = false;
  try {
    setLastPlayerName("テスト", throwingStorage);
  } catch (e) {
    threw = true;
  }
  assert(!threw, "setLastPlayerName catches exceptions safely");

  // 3. GameSession Player Name & SubmissionID Integration (Section 35, 37, 38)
  console.log("\n--- Testing GameSession Player Name & SubmissionID Integration ---");
  const prodSession = new GameSession({
    mode: GAME_MODES.PRODUCTION,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    questions: DEFAULT_QUESTIONS,
    playerName: "足場 花子"
  });
  assert(prodSession.playerName === "足場 花子", "Production session stores playerName");
  assert(typeof prodSession.submissionId === "string" && prodSession.submissionId.startsWith("SUB-"), "Production session generates SUB- id");

  const prodSummary = prodSession.getSummary();
  assert(prodSummary.playerName === "足場 花子", "Summary contains playerName");
  assert(prodSummary.submissionId === prodSession.submissionId, "Summary contains submissionId");

  // Practice Session: No submissionId, no player name requirement
  const practiceSession = new GameSession({
    mode: GAME_MODES.PRACTICE,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    questions: DEFAULT_QUESTIONS,
    playerName: ""
  });
  assert(practiceSession.submissionId === null, "Practice session has submissionId = null");
  assert(practiceSession.mode === GAME_MODES.PRACTICE, "Practice mode recognized");

  // 4. BackendClient Contract Verification (Section 45 & 46)
  console.log("\n--- Testing BackendClient Configuration ---");
  const client = new BackendClient();
  assert(client.endpointUrl === BACKEND_WEB_APP_URL, "BackendClient points to authoritative Web App URL");
  assert(client.timeoutMs === 12000, "BackendClient has 12s timeout");

  return { passed, failed };
}
