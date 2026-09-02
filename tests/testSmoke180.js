import path from "path";
import { fileURLToPath } from "url";
import { loadQuestionsFromFile } from "../src/data/questionLoader.js";
import { TypingEngine } from "../src/engine/typingEngine.js";
import { calculateAllowedTime } from "../src/engine/timingEngine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CSV_PATH = path.resolve(__dirname, "../data/questions/takamiya-typing-game-master-v3.csv");

export function runSmoke180Test() {
  console.log("\n=== Testing Real Question Master Smoke Test (180 Questions) ===");

  const questions = loadQuestionsFromFile(CSV_PATH);
  console.log(`Loaded ${questions.length} questions from ${CSV_PATH}`);

  let passCount = 0;
  let failCount = 0;
  const failedIds = [];

  for (const q of questions) {
    try {
      // 1. Initialize TypingEngine with Question
      const engine = new TypingEngine(q);
      const state = engine.getState();

      if (!state.currentTarget || state.currentTarget.length === 0) {
        throw new Error(`Empty target generated for question ${q.id}`);
      }

      if (typeof state.effectiveKeystrokes !== "number" || state.effectiveKeystrokes <= 0) {
        throw new Error(`Invalid effectiveKeystrokes (${state.effectiveKeystrokes}) for question ${q.id}`);
      }

      // 2. Calculate allowed time
      const allowedTime = calculateAllowedTime(q.difficulty, state.effectiveKeystrokes);
      if (typeof allowedTime !== "number" || isNaN(allowedTime) || allowedTime <= 0) {
        throw new Error(`Invalid allowedTime (${allowedTime}) for question ${q.id}`);
      }

      // 3. Simulate typing the target sequence
      const targetSeq = state.currentTarget;
      for (const char of targetSeq) {
        const res = engine.inputKey(char);
        if (!res.accepted) {
          throw new Error(`Key '${char}' was rejected while typing target '${targetSeq}' for question ${q.id}`);
        }
      }

      const finalState = engine.getState();
      if (!finalState.isComplete) {
        throw new Error(`Engine did not mark question ${q.id} as complete after typing all characters of '${targetSeq}'`);
      }

      if (finalState.mistakeCount !== 0) {
        throw new Error(`Unexpected mistakeCount (${finalState.mistakeCount}) for question ${q.id}`);
      }

      passCount++;
    } catch (err) {
      failCount++;
      failedIds.push({ id: q.id, displayText: q.displayText, reading: q.reading, error: err.message });
      console.error(`  FAIL [${q.id}]: ${err.message}`);
    }
  }

  console.log(`\nSmoke Test Result: ${passCount} / ${questions.length} PASS`);
  if (failCount > 0) {
    console.error(`Failed Questions (${failCount}):`, JSON.stringify(failedIds, null, 2));
  }

  return {
    total: questions.length,
    passed: passCount,
    failed: failCount,
    failedIds
  };
}
