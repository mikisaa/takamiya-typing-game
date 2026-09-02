import { calculateAllowedTime, getDifficultyConfig, normalizeDifficultyKey } from "../src/engine/timingEngine.js";
import { GAME_CONFIG } from "../src/config/gameConfig.js";

export function runTimingEngineTests() {
  console.log("\n=== Testing Dynamic Timing Engine ===");
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

  // Test 1: Normalization of difficulty keys
  assert(normalizeDifficultyKey("beginner") === "beginner", "normalize 'beginner'");
  assert(normalizeDifficultyKey("BEGINNER") === "beginner", "normalize 'BEGINNER'");
  assert(normalizeDifficultyKey("初級") === "beginner", "normalize '初級'");
  assert(normalizeDifficultyKey("中級") === "intermediate", "normalize '中級'");
  assert(normalizeDifficultyKey("上級") === "advanced", "normalize '上級'");

  // Test 2: Beginner median calculation (6 characters)
  // formula: 3.0 + 6 / 2.0 = 6.0
  const begTime = calculateAllowedTime("beginner", 6);
  assert(begTime === 6.0, `Beginner (6 chars): expected 6.0s, got ${begTime}s`);

  // Test 3: Intermediate median calculation (14 characters)
  // formula: 2.0 + 14 / 3.2 = 6.375 -> rounded to 6.38
  const intTime = calculateAllowedTime("intermediate", 14);
  assert(intTime === 6.38, `Intermediate (14 chars): expected 6.38s, got ${intTime}s`);

  // Test 4: Advanced median calculation (52 characters)
  // formula: 1.5 + 52 / 4.5 = 13.0555... -> rounded to 13.06
  const advTime = calculateAllowedTime("advanced", 52);
  assert(advTime === 13.06, `Advanced (52 chars): expected 13.06s, got ${advTime}s`);

  // Test 5: Advanced max calculation (76 characters)
  // formula: 1.5 + 76 / 4.5 = 18.3888... -> rounded to 18.39
  const advMaxTime = calculateAllowedTime("advanced", 76);
  assert(advMaxTime === 18.39, `Advanced (76 chars): expected 18.39s, got ${advMaxTime}s`);

  // Test 6: Min allowed time clamp
  // Beginner (1 char): 3.0 + 1/2.0 = 3.5 -> clamped to minAllowedTime 4.0
  const begClampMin = calculateAllowedTime("beginner", 1);
  assert(begClampMin === 4.0, `Beginner min clamp: expected 4.0s, got ${begClampMin}s`);

  // Test 7: Max allowed time clamp
  // Beginner (30 chars): 3.0 + 30/2.0 = 18.0 -> clamped to maxAllowedTime 12.0
  const begClampMax = calculateAllowedTime("beginner", 30);
  assert(begClampMax === 12.0, `Beginner max clamp: expected 12.0s, got ${begClampMax}s`);

  // Test 8: Preserved difficulty hierarchy on same character count (20 keystrokes)
  // Beginner: 3.0 + 20/2.0 = 13.0 -> clamped to 12.0s
  // Intermediate: 2.0 + 20/3.2 = 8.25s
  // Advanced: 1.5 + 20/4.5 = 5.94s
  const tBeg = calculateAllowedTime("beginner", 20);
  const tInt = calculateAllowedTime("intermediate", 20);
  const tAdv = calculateAllowedTime("advanced", 20);

  assert(tBeg === 12.0, `Beginner for 20 chars is 12.0s (got ${tBeg})`);
  assert(tInt === 8.25, `Intermediate for 20 chars is 8.25s (got ${tInt})`);
  assert(tAdv === 5.94, `Advanced for 20 chars is 5.94s (got ${tAdv})`);
  assert(tBeg > tInt && tInt > tAdv, `Difficulty hierarchy preserved: Beginner (${tBeg}s) > Intermediate (${tInt}s) > Advanced (${tAdv}s)`);

  // Test 9: Practice mode multiplier (1.5x)
  const prodTime = calculateAllowedTime("intermediate", 14, false);
  const pracTime = calculateAllowedTime("intermediate", 14, true);
  const expectedPrac = Number((6.375 * 1.5).toFixed(2)); // 9.56
  assert(pracTime === expectedPrac, `Practice mode is 1.5x production: prod=${prodTime}s, practice=${pracTime}s (expected ${expectedPrac}s)`);

  // Test 10: Error handling on invalid difficulty
  try {
    calculateAllowedTime("unknown_diff", 10);
    assert(false, "Should throw on unknown difficulty");
  } catch (err) {
    assert(err.message.includes("Unknown difficulty"), `Rejected unknown difficulty: ${err.message}`);
  }

  // Test 11: Error handling on invalid keystrokes (0 or negative or NaN)
  try {
    calculateAllowedTime("beginner", 0);
    assert(false, "Should throw on 0 keystrokes");
  } catch (err) {
    assert(err.message.includes("Invalid effectiveKeystrokes"), `Rejected 0 keystrokes: ${err.message}`);
  }

  try {
    calculateAllowedTime("beginner", -5);
    assert(false, "Should throw on negative keystrokes");
  } catch (err) {
    assert(err.message.includes("Invalid effectiveKeystrokes"), `Rejected negative keystrokes: ${err.message}`);
  }

  return { passed, failed };
}
