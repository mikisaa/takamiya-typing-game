import { GAME_STATES, GAME_MODES, DIFFICULTY_LEVELS, isValidStateTransition } from "../src/engine/gameState.js";
import { GameSession } from "../src/engine/gameSession.js";
import { DEFAULT_QUESTIONS } from "../src/data/defaultQuestions.js";

export function runGameStateTests() {
  console.log("\n=== Testing Game State Machine & Session Lifecycle ===");
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

  // Test 1: State transition validator
  assert(isValidStateTransition(GAME_STATES.TITLE, GAME_STATES.SETUP) === true, "TITLE -> SETUP is valid");
  assert(isValidStateTransition(GAME_STATES.SETUP, GAME_STATES.READY) === true, "SETUP -> READY is valid");
  assert(isValidStateTransition(GAME_STATES.READY, GAME_STATES.PLAYING) === true, "READY -> PLAYING is valid");
  assert(isValidStateTransition(GAME_STATES.PLAYING, GAME_STATES.SUCCESS_FEEDBACK) === true, "PLAYING -> SUCCESS_FEEDBACK is valid");
  assert(isValidStateTransition(GAME_STATES.PLAYING, GAME_STATES.MISS_FEEDBACK) === true, "PLAYING -> MISS_FEEDBACK is valid");
  assert(isValidStateTransition(GAME_STATES.PLAYING, GAME_STATES.RESULT) === true, "PLAYING -> RESULT is valid");
  assert(isValidStateTransition(GAME_STATES.RESULT, GAME_STATES.TITLE) === true, "RESULT -> TITLE is valid");
  assert(isValidStateTransition(GAME_STATES.RESULT, GAME_STATES.READY) === true, "RESULT -> READY (Replay) is valid");

  // Invalid transitions
  assert(isValidStateTransition(GAME_STATES.TITLE, GAME_STATES.PLAYING) === false, "TITLE -> PLAYING is invalid");
  assert(isValidStateTransition(GAME_STATES.TITLE, GAME_STATES.RESULT) === false, "TITLE -> RESULT is invalid");
  assert(isValidStateTransition(GAME_STATES.READY, GAME_STATES.RESULT) === false, "READY -> RESULT is invalid");

  // Test 2: GameSession Lifecycle
  const session = new GameSession({
    mode: GAME_MODES.PRODUCTION,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    questions: DEFAULT_QUESTIONS
  });

  assert(session.state === GAME_STATES.SETUP, "Initial state is SETUP");
  assert(session.globalTimeRemaining === 90, "Initial Global Timer is 90s");

  session.startReady();
  assert(session.state === GAME_STATES.READY, "State transitioned to READY");
  assert(session.readyCountdown === 3.0, "Ready countdown initialized to 3.0s");

  // Tick ready countdown by 3.1s
  session.tick(3.1);
  assert(session.state === GAME_STATES.PLAYING, "Ready countdown finished -> PLAYING");
  assert(session.currentQuestion !== null, "Current question spawned");
  assert(session.perQuestionAllowedTime > 0, "Per-question allowed time initialized");
  assert(session.perQuestionTimeRemaining === session.perQuestionAllowedTime, "Per-question time remaining matches allowed");

  // Test 3: Finish session
  session.finishSession();
  assert(session.state === GAME_STATES.RESULT, "State transitioned to RESULT on finish");

  const summary = session.getSummary();
  assert(summary.mode === GAME_MODES.PRODUCTION, "Summary contains PRODUCTION mode");
  assert(summary.difficulty === "BEGINNER", "Summary contains BEGINNER difficulty");
  assert(typeof summary.score === "number", "Summary contains score");

  return { passed, failed };
}
