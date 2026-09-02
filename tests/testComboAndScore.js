import {
  getComboMultiplier,
  calculateQuestionScore,
  calculateFinalScore,
  calculateAccuracy,
  calculateTypingSpeed
} from "../src/engine/scoreCalculator.js";
import { GameSession } from "../src/engine/gameSession.js";
import { GAME_MODES, DIFFICULTY_LEVELS } from "../src/engine/gameState.js";
import { DEFAULT_QUESTIONS } from "../src/data/defaultQuestions.js";

export function runComboAndScoreTests() {
  console.log("\n=== Testing Combo, Scoring Formula & Metrics ===");
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

  // Test 1: Combo multipliers
  assert(getComboMultiplier(0) === 1.0, "0 combo -> 1.0x multiplier");
  assert(getComboMultiplier(9) === 1.0, "9 combo -> 1.0x multiplier");
  assert(getComboMultiplier(10) === 1.2, "10 combo -> 1.2x multiplier");
  assert(getComboMultiplier(19) === 1.2, "19 combo -> 1.2x multiplier");
  assert(getComboMultiplier(20) === 1.5, "20 combo -> 1.5x multiplier");
  assert(getComboMultiplier(30) === 1.8, "30 combo -> 1.8x multiplier");
  assert(getComboMultiplier(50) === 2.0, "50 combo -> 2.0x multiplier");

  // Test 2: Single question score
  const score1 = calculateQuestionScore(10, 10);
  assert(score1 === 1200, `10 chars at combo 10: expected 1200, got ${score1}`);

  // Test 3: Final score calculation with time bonus & miss penalty
  const final1 = calculateFinalScore({
    accumulatedQuestionScore: 5000,
    remainingSeconds: 30,
    missCount: 2
  });
  assert(final1 === 6460, `Final score: expected 6460, got ${final1}`);

  // Minimum score clamp
  const clampedFinal = calculateFinalScore({
    accumulatedQuestionScore: 0,
    remainingSeconds: 0,
    missCount: 100
  });
  assert(clampedFinal === 0, "Final score clamped to >= 0");

  // Test 4: Accuracy calculation & formatting
  assert(calculateAccuracy(100, 0) === 100.0, "100 chars, 0 mistakes = 100%");
  assert(calculateAccuracy(90, 10) === 90.0, "90 chars, 10 mistakes = 90%");
  assert(calculateAccuracy(0, 0) === 100.0, "0 attempts defaults to 100%");
  assert(calculateAccuracy(49, 1) === 98.0, "49 chars, 1 mistake = 98.0%");

  // Test 5: Typing speed (WPM / KPM)
  const speed = calculateTypingSpeed(300, 60);
  assert(speed.kpm === 300, `KPM expected 300, got ${speed.kpm}`);
  assert(speed.wpm === 60.0, `WPM expected 60.0, got ${speed.wpm}`);

  // Test 6: In-Session Metrics & Summary Model (Production)
  const session = new GameSession({
    mode: GAME_MODES.PRODUCTION,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    questions: DEFAULT_QUESTIONS
  });
  session.startPlaying();

  // Type 1st char correctly
  const q = session.currentQuestion;
  const firstChar = q.canonicalTarget[0].toLowerCase();
  const res1 = session.handleInput(firstChar);
  assert(res1.accepted === true, "Valid first key accepted");

  // Complete entire question
  for (let i = 1; i < q.canonicalTarget.length; i++) {
    session.handleInput(q.canonicalTarget[i].toLowerCase());
  }

  assert(session.correctCount === 1, "Correct count is 1 after completion");
  assert(session.currentCombo === 1, "Combo is 1 after first success");

  // Type wrong key on next question
  session.tick(0.6); // advance to PLAYING
  const wrongRes = session.handleInput("!");
  assert(wrongRes.accepted === false, "Wrong key rejected");
  assert(session.typingMistakeCount === 1, "Mistake count is 1");
  assert(session.currentCombo === 0, "Combo reset to 0 upon typing mistake");

  // Summary model verification
  const prodSummary = session.getSummary();
  assert(typeof prodSummary.accuracy === "object", "Summary accuracy is an object");
  assert(typeof prodSummary.accuracy.percent === "number", "Summary accuracy.percent is a valid number");
  assert(typeof prodSummary.accuracyPercent === "number", "Summary accuracyPercent is a valid number");
  assert(!isNaN(prodSummary.accuracy.percent), "Summary accuracy.percent is not NaN");

  // Test 7: Practice mode summary accuracy verification
  const pracSess = new GameSession({
    mode: GAME_MODES.PRACTICE,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    questions: DEFAULT_QUESTIONS
  });
  pracSess.startPlaying();
  const pracSummary = pracSess.getSummary();
  assert(pracSummary.accuracy.percent === 100.0, "Initial practice accuracy is 100.0%");
  assert(typeof pracSummary.accuracyPercent === "number", "Practice accuracyPercent is number");

  return { passed, failed };
}
