import path from "path";
import { fileURLToPath } from "url";
import { loadQuestionsFromFile } from "../src/data/nodeQuestionLoader.js";
import { DEFAULT_QUESTIONS } from "../src/data/defaultQuestions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CSV_PATH = path.resolve(__dirname, "../data/questions/takamiya-typing-game-master-v3.csv");

export function runBundleDriftTest() {
  console.log("\n=== Testing Question Bundle Drift Prevention ===");
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

  try {
    const csvQuestions = loadQuestionsFromFile(CSV_PATH);
    assert(Array.isArray(DEFAULT_QUESTIONS), "DEFAULT_QUESTIONS is an array");
    assert(DEFAULT_QUESTIONS.length === 180, `DEFAULT_QUESTIONS count is 180 (got ${DEFAULT_QUESTIONS.length})`);
    assert(csvQuestions.length === DEFAULT_QUESTIONS.length, `CSV count (${csvQuestions.length}) matches bundle count (${DEFAULT_QUESTIONS.length})`);

    let exactMatches = 0;
    for (let i = 0; i < csvQuestions.length; i++) {
      const fromCsv = csvQuestions[i];
      const fromBundle = DEFAULT_QUESTIONS[i];

      if (
        fromCsv.id === fromBundle.id &&
        fromCsv.difficulty === fromBundle.difficulty &&
        fromCsv.displayText === fromBundle.displayText &&
        fromCsv.reading === fromBundle.reading &&
        fromCsv.canonicalTarget === fromBundle.canonicalTarget &&
        fromCsv.effectiveKeystrokes === fromBundle.effectiveKeystrokes
      ) {
        exactMatches++;
      } else {
        console.error(`  Drift detected at index ${i} (ID: ${fromCsv.id} vs ${fromBundle?.id})`);
      }
    }

    assert(exactMatches === 180, `All 180 questions in bundle match CSV SSOT exactly (100% fidelity: ${exactMatches}/180)`);

  } catch (err) {
    assert(false, `Unexpected error in bundle drift test: ${err.message}`);
  }

  return { passed, failed };
}
