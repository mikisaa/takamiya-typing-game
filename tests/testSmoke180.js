import path from "path";
import { fileURLToPath } from "url";
import { loadQuestionsFromFile } from "../src/data/nodeQuestionLoader.js";
import { TypingEngine } from "../src/engine/typingEngine.js";
import { calculateAllowedTime } from "../src/engine/timingEngine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CSV_PATH = path.resolve(__dirname, "../data/questions/takamiya-typing-game-master-v3.csv");

export function runSmoke180Test() {
  console.log("\n=== Testing Real Question Master Smoke Test (180 Questions) ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      passed++;
    } else {
      console.error(`  FAIL: ${message}`);
      failed++;
    }
  }

  const questions = loadQuestionsFromFile(CSV_PATH);
  console.log(`Loaded ${questions.length} questions from ${CSV_PATH}`);

  const failedQuestions = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    try {
      // 1. Initialize engine
      const engine = new TypingEngine(q);

      // 2. Validate canonical sequence
      const target = engine.canonicalTarget;
      if (!target || target.length === 0) {
        throw new Error(`Canonical target is empty for question ${q.id} ("${q.displayText}")`);
      }

      if (engine.effectiveKeystrokes !== target.length) {
        throw new Error(`effectiveKeystrokes mismatch for ${q.id}: engine has ${engine.effectiveKeystrokes}, target has ${target.length}`);
      }

      // 3. Validate timing calculation
      const allowedTime = calculateAllowedTime(q.difficulty, engine.effectiveKeystrokes);
      if (typeof allowedTime !== "number" || allowedTime <= 0 || isNaN(allowedTime)) {
        throw new Error(`Invalid allowedTime calculated for question ${q.id}: ${allowedTime}`);
      }

      // 4. Simulate typing canonical sequence
      for (const char of target) {
        const res = engine.inputKey(char);
        if (!res.accepted) {
          throw new Error(`Rejected valid canonical character "${char}" at index ${engine.typedLength} for question ${q.id} ("${q.displayText}")`);
        }
      }

      if (!engine.isComplete) {
        throw new Error(`Typing simulation did not reach completion for question ${q.id} ("${q.displayText}")`);
      }

      assert(true, `Question ${q.id} PASS`);
    } catch (err) {
      failedQuestions.push({ id: q.id, displayText: q.displayText, error: err.message });
      assert(false, `Question ${q.id} FAIL: ${err.message}`);
    }
  }

  console.log(`\nSmoke Test Result: ${questions.length - failedQuestions.length} / ${questions.length} PASS`);
  if (failedQuestions.length > 0) {
    console.error("Failed Questions Detail:", JSON.stringify(failedQuestions, null, 2));
  }

  return { passed, failed };
}
