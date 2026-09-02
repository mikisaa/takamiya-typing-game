import { QuestionSelector } from "../src/engine/questionSelector.js";
import { DEFAULT_QUESTIONS } from "../src/data/defaultQuestions.js";

export function runQuestionSelectorTests() {
  console.log("\n=== Testing Question Selector & Pool Management ===");
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

  // Test 1: Difficulty filtering
  const selectorBeg = new QuestionSelector(DEFAULT_QUESTIONS, "BEGINNER");
  assert(selectorBeg.totalCount === 60, `Beginner selector total count is 60 (got ${selectorBeg.totalCount})`);

  const selectorInt = new QuestionSelector(DEFAULT_QUESTIONS, "INTERMEDIATE");
  assert(selectorInt.totalCount === 60, `Intermediate selector total count is 60 (got ${selectorInt.totalCount})`);

  const selectorAdv = new QuestionSelector(DEFAULT_QUESTIONS, "ADVANCED");
  assert(selectorAdv.totalCount === 60, `Advanced selector total count is 60 (got ${selectorAdv.totalCount})`);

  // Test 2: Sequential drawing without immediate consecutive duplicates
  let prevId = null;
  let noConsecutiveDups = true;
  for (let i = 0; i < 30; i++) {
    const q = selectorBeg.nextQuestion();
    if (q.id === prevId) {
      noConsecutiveDups = false;
      break;
    }
    prevId = q.id;
  }
  assert(noConsecutiveDups === true, "30 sequential draws have zero immediate consecutive duplicate IDs");

  // Test 3: Pool exhaustion and automatic replenishment
  const smallPool = [
    { id: "Q1", difficulty: "BEGINNER", displayText: "T1", reading: "t1" },
    { id: "Q2", difficulty: "BEGINNER", displayText: "T2", reading: "t2" }
  ];
  const selectorSmall = new QuestionSelector(smallPool, "BEGINNER");

  const drawn1 = selectorSmall.nextQuestion();
  const drawn2 = selectorSmall.nextQuestion();
  const drawn3 = selectorSmall.nextQuestion(); // Triggers replenishment

  assert(drawn1.id !== drawn2.id, "First two questions are distinct");
  assert(drawn3.id !== drawn2.id, "Third question (after refill) does not duplicate immediately preceding item");

  return { passed, failed };
}
