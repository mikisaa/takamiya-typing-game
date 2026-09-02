import { GameSession } from "../src/engine/gameSession.js";
import { GAME_STATES, GAME_MODES, DIFFICULTY_LEVELS } from "../src/engine/gameState.js";
import { DEFAULT_QUESTIONS } from "../src/data/defaultQuestions.js";

export function runTimerTests() {
  console.log("\n=== Testing Timers (Global & Per-Question Forklift) ===");
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

  // Test 1: Global Timer countdown in Production
  const sessionProd = new GameSession({
    mode: GAME_MODES.PRODUCTION,
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    questions: DEFAULT_QUESTIONS
  });
  sessionProd.startPlaying();

  assert(sessionProd.globalTimeRemaining === 90, "Global Timer starts at 90.0s in Production");
  sessionProd.tick(5.0);
  assert(Number(sessionProd.globalTimeRemaining.toFixed(1)) === 85.0, "Global Timer decrements by 5.0s (at 85.0s)");

  // Test 2: Forklift Progress formula
  const initialProg = sessionProd.getForkliftProgress();
  assert(initialProg >= 0 && initialProg <= 1.0, `Initial forklift progress is normalized (${initialProg})`);

  // Test 3: Per-Question Timer timeout triggers MISS
  const remain = sessionProd.perQuestionTimeRemaining;
  sessionProd.tick(remain + 0.1); // Tick past remaining time
  assert(sessionProd.state === GAME_STATES.MISS_FEEDBACK, "Per-question timeout transitions to MISS_FEEDBACK");
  assert(sessionProd.missCount === 1, "Miss count incremented to 1");

  // In Intermediate, penalty is 4s.
  assert(sessionProd.globalTimeRemaining < 85.0 - 4.0, "Global timer received difficulty miss penalty");

  // Advance past feedback delay to spawn next question in PLAYING state
  sessionProd.tick(1.0);
  assert(sessionProd.state === GAME_STATES.PLAYING, "Next question spawned in PLAYING state");

  // Test 4: Global Timer reaching 0 triggers RESULT
  sessionProd.tick(100.0); // Advance past remaining global time
  assert(sessionProd.globalTimeRemaining === 0, "Global timer clamped to 0");
  assert(sessionProd.state === GAME_STATES.RESULT, "Global timer expiration transitions state to RESULT");

  // Test 5: Practice mode timer behavior
  const sessionPrac = new GameSession({
    mode: GAME_MODES.PRACTICE,
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    questions: DEFAULT_QUESTIONS
  });
  sessionPrac.startPlaying();

  const pracAllowed = sessionPrac.perQuestionAllowedTime;
  assert(pracAllowed > 0, "Practice allowed time is positive");

  // Ticking in practice increments elapsed time without game over
  sessionPrac.tick(120.0);
  assert(sessionPrac.state !== GAME_STATES.RESULT, "Practice mode does not trigger game over on long elapsed time");

  return { passed, failed };
}
