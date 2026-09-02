import { GameSession } from "../src/engine/gameSession.js";
import { GAME_STATES, GAME_MODES, DIFFICULTY_LEVELS } from "../src/engine/gameState.js";
import { DEFAULT_QUESTIONS } from "../src/data/defaultQuestions.js";

export function runTimerTests() {
  console.log("\n=== Testing Timers & Typing Mistake Penalties ===");
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
  sessionProd.tick(1.0);
  assert(Number(sessionProd.globalTimeRemaining.toFixed(1)) === 89.0, "Global Timer decrements by 1.0s (at 89.0s)");

  // Test 2: Forklift Progress formula
  const initialProg = sessionProd.getForkliftProgress();
  assert(initialProg >= 0 && initialProg <= 1.0, `Initial forklift progress is normalized (${initialProg})`);

  // Test 3: Per-Question Timer timeout triggers MISS
  const globalBefore = sessionProd.globalTimeRemaining;
  const remain = sessionProd.perQuestionTimeRemaining;
  sessionProd.tick(remain + 0.1); // Tick past remaining time
  assert(sessionProd.state === GAME_STATES.MISS_FEEDBACK, "Per-question timeout transitions to MISS_FEEDBACK");
  assert(sessionProd.missCount === 1, "Miss count incremented to 1");

  // In Intermediate, penalty is 4s.
  assert(sessionProd.globalTimeRemaining <= globalBefore - 4.0, "Global timer received difficulty miss penalty");

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
  sessionPrac.tick(120.0);
  assert(sessionPrac.state !== GAME_STATES.RESULT, "Practice mode does not trigger game over on long elapsed time");

  // --- Test 6: Typing Mistake Timer Penalties by Difficulty in Production ---
  // Beginner (-0.50s)
  const sessBeg = new GameSession({
    mode: GAME_MODES.PRODUCTION,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    questions: DEFAULT_QUESTIONS
  });
  sessBeg.startPlaying();
  const begBefore = sessBeg.globalTimeRemaining;
  const resBeg = sessBeg.handleInput("!"); // intentional wrong key
  assert(resBeg.accepted === false, "Wrong key rejected in Beginner");
  assert(Number((begBefore - sessBeg.globalTimeRemaining).toFixed(2)) === 0.50, "Beginner typing mistake penalizes -0.50s");

  // Intermediate (-0.75s)
  const sessInt = new GameSession({
    mode: GAME_MODES.PRODUCTION,
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    questions: DEFAULT_QUESTIONS
  });
  sessInt.startPlaying();
  const intBefore = sessInt.globalTimeRemaining;
  const resInt = sessInt.handleInput("!");
  assert(resInt.accepted === false, "Wrong key rejected in Intermediate");
  assert(Number((intBefore - sessInt.globalTimeRemaining).toFixed(2)) === 0.75, "Intermediate typing mistake penalizes -0.75s");

  // Advanced (-1.00s)
  const sessAdv = new GameSession({
    mode: GAME_MODES.PRODUCTION,
    difficulty: DIFFICULTY_LEVELS.ADVANCED,
    questions: DEFAULT_QUESTIONS
  });
  sessAdv.startPlaying();
  const advBefore = sessAdv.globalTimeRemaining;
  const resAdv = sessAdv.handleInput("!");
  assert(resAdv.accepted === false, "Wrong key rejected in Advanced");
  assert(Number((advBefore - sessAdv.globalTimeRemaining).toFixed(2)) === 1.00, "Advanced typing mistake penalizes -1.00s");

  // Practice mode: No timer penalty
  const sessPracTypo = new GameSession({
    mode: GAME_MODES.PRACTICE,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    questions: DEFAULT_QUESTIONS
  });
  sessPracTypo.startPlaying();
  const pracTimeBefore = sessPracTypo.globalTimeRemaining;
  const resPrac = sessPracTypo.handleInput("!");
  assert(resPrac.accepted === false, "Wrong key rejected in Practice");
  assert(sessPracTypo.globalTimeRemaining === pracTimeBefore, "Practice mode does not deduct timer on mistake");
  assert(sessPracTypo.typingMistakeCount === 1, "Practice mode tracks typingMistakeCount");

  // Accepted variant: NO timer penalty
  const sessVariant = new GameSession({
    mode: GAME_MODES.PRODUCTION,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    questions: [{ id: "TEST_ZI", difficulty: "BEGINNER", displayText: "じ", reading: "じ", canonicalTarget: "JI", effectiveKeystrokes: 2 }]
  });
  sessVariant.startPlaying();
  const varBefore = sessVariant.globalTimeRemaining;
  const resVar = sessVariant.handleInput("z"); // Valid alternate variant
  assert(resVar.accepted === true, "Variant 'z' accepted for 'じ'");
  assert(sessVariant.globalTimeRemaining === varBefore, "Accepted variant does NOT deduct timer");

  // Timer clamp to 0 and finish on mistake
  const sessNearEnd = new GameSession({
    mode: GAME_MODES.PRODUCTION,
    difficulty: DIFFICULTY_LEVELS.ADVANCED,
    questions: DEFAULT_QUESTIONS
  });
  sessNearEnd.startPlaying();
  sessNearEnd.globalTimeRemaining = 0.5; // less than 1.0s penalty
  sessNearEnd.handleInput("!");
  assert(sessNearEnd.globalTimeRemaining === 0, "Timer clamped to 0s on penalty");
  assert(sessNearEnd.state === GAME_STATES.RESULT, "Session finished to RESULT when timer reaches 0 from mistake penalty");

  return { passed, failed };
}
