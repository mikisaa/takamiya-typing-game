import { GameSession } from "../src/engine/gameSession.js";
import { GAME_STATES, GAME_MODES, DIFFICULTY_LEVELS } from "../src/engine/gameState.js";
import { DEFAULT_QUESTIONS } from "../src/data/defaultQuestions.js";

export function runIntegrationGameLoopTest() {
  console.log("\n=== Testing Full End-to-End Integration Game Loop ===");
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

  // Helper to type a full string into the session
  function typeFullString(session, str) {
    for (const char of str) {
      session.handleInput(char);
    }
  }

  try {
    // 1. Initialize Session
    const session = new GameSession({
      mode: GAME_MODES.PRODUCTION,
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
      questions: DEFAULT_QUESTIONS
    });

    assert(session.state === GAME_STATES.SETUP, "1. Session initialized in SETUP state");

    // 2. Start Ready
    session.startReady();
    assert(session.state === GAME_STATES.READY, "2. Session transitioned to READY state");

    // 3. Countdown tick -> PLAYING
    session.tick(3.1);
    assert(session.state === GAME_STATES.PLAYING, "3. Countdown complete -> PLAYING state");
    assert(session.currentQuestion !== null, "First question spawned");

    // 4. Question 1: Perfect SUCCESS
    const q1Target = session.currentTypingEngine.canonicalTarget;
    typeFullString(session, q1Target);
    assert(session.state === GAME_STATES.SUCCESS_FEEDBACK, "Question 1 completed -> SUCCESS_FEEDBACK");
    assert(session.correctCount === 1, "Correct count is 1");
    assert(session.currentCombo === 1, "Combo is 1");
    assert(session.accumulatedQuestionScore > 0, "Accumulated score increased");

    // 5. Advance feedback delay -> Question 2
    session.tick(0.5);
    assert(session.state === GAME_STATES.PLAYING, "Question 2 spawned in PLAYING state");

    // 6. Question 2: Mistake then SUCCESS
    const wrongKeyRes = session.handleInput("!");
    assert(wrongKeyRes.accepted === false, "Mistake key rejected");
    assert(session.typingMistakeCount === 1, "Mistake count is 1");
    assert(session.currentCombo === 0, "Combo reset to 0 after mistake");

    const q2Target = session.currentTypingEngine.canonicalTarget;
    typeFullString(session, q2Target);
    assert(session.state === GAME_STATES.SUCCESS_FEEDBACK, "Question 2 completed -> SUCCESS_FEEDBACK");
    assert(session.correctCount === 2, "Correct count is 2");
    assert(session.currentCombo === 1, "Combo restarted at 1");

    // 7. Advance feedback delay -> Question 3
    session.tick(0.5);
    assert(session.state === GAME_STATES.PLAYING, "Question 3 spawned in PLAYING state");

    // 8. Question 3: MISS timeout
    const q3Allowed = session.perQuestionAllowedTime;
    const globalBeforeMiss = session.globalTimeRemaining;
    session.tick(q3Allowed + 0.1); // Timeout
    assert(session.state === GAME_STATES.MISS_FEEDBACK, "Question 3 timed out -> MISS_FEEDBACK");
    assert(session.missCount === 1, "Miss count is 1");
    assert(session.currentCombo === 0, "Combo reset to 0 upon MISS");
    assert(session.globalTimeRemaining < globalBeforeMiss - 2.0, "Global timer penalized on MISS");

    // 9. Advance feedback delay -> Consecutive 15 combos for TIME BONUS
    session.tick(0.5);
    for (let c = 0; c < 15; c++) {
      if (session.state === GAME_STATES.PLAYING) {
        const target = session.currentTypingEngine.canonicalTarget;
        typeFullString(session, target);
        session.tick(0.5); // Advance feedback
      }
    }

    assert(session.earnedTimeBonus >= 5, `15-combo earned time bonus (earned: ${session.earnedTimeBonus}s)`);
    assert(session.maxCombo >= 15, `Max combo recorded >= 15 (got ${session.maxCombo})`);

    // 10. Advance Global Timer to 0 -> RESULT
    session.tick(100.0);
    assert(session.state === GAME_STATES.RESULT, "Global timer expiration transitioned to RESULT state");
    assert(session.globalTimeRemaining === 0, "Global timer clamped to 0");

    // 11. Verify Summary Metrics
    const summary = session.getSummary();
    assert(summary.correctCount === 17, `Summary correctCount is 17 (got ${summary.correctCount})`);
    assert(summary.missCount === 1, "Summary missCount is 1");
    assert(summary.typingMistakeCount === 1, "Summary typingMistakeCount is 1");
    assert(summary.score > 0, `Summary score is positive (got ${summary.score})`);
    const accPercent = typeof summary.accuracy === "object" ? summary.accuracy.percent : summary.accuracy;
    assert(accPercent > 0 && accPercent <= 100, `Summary accuracy valid (${accPercent}%)`);
    assert(summary.wpm > 0, `Summary WPM calculated (${summary.wpm} WPM)`);

  } catch (err) {
    assert(false, `Unexpected error in integration test: ${err.message}`);
  }

  return { passed, failed };
}
