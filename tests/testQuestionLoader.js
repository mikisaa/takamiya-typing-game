import path from "path";
import { fileURLToPath } from "url";
import {
  parseCsvContent,
  filterQuestionsByDifficulty,
  validateQuestionDataset
} from "../src/data/questionLoader.js";
import { loadQuestionsFromFile } from "../src/data/nodeQuestionLoader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CSV_PATH = path.resolve(__dirname, "../data/questions/takamiya-typing-game-master-v3.csv");

export function runQuestionLoaderTests() {
  console.log("\n=== Testing Question Loader ===");
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

  // Test 1: Load from real CSV file
  try {
    const questions = loadQuestionsFromFile(CSV_PATH);
    assert(Array.isArray(questions), "loadQuestionsFromFile returns an array");
    assert(questions.length === 180, `Total questions loaded is 180 (got ${questions.length})`);

    // Test 2: Difficulty distribution
    const beginners = filterQuestionsByDifficulty(questions, "BEGINNER");
    const intermediates = filterQuestionsByDifficulty(questions, "INTERMEDIATE");
    const advanceds = filterQuestionsByDifficulty(questions, "ADVANCED");

    assert(beginners.length === 60, `BEGINNER count is 60 (got ${beginners.length})`);
    assert(intermediates.length === 60, `INTERMEDIATE count is 60 (got ${intermediates.length})`);
    assert(advanceds.length === 60, `ADVANCED count is 60 (got ${advanceds.length})`);

    // Test 3: Validate dataset summary
    const summary = validateQuestionDataset(questions);
    assert(summary.valid === true, "validateQuestionDataset returns valid=true");
    assert(summary.uniqueIds === 180, `Unique IDs count is 180 (got ${summary.uniqueIds})`);

    // Test 4: Check first question content (B001)
    const q1 = questions[0];
    assert(q1.id === "B001", `First question ID is B001 (got ${q1.id})`);
    assert(q1.difficulty === "BEGINNER", "First question difficulty is BEGINNER");
    assert(q1.displayText === "足場", `First question displayText is 足場 (got ${q1.displayText})`);
    assert(q1.reading === "あしば", `First question reading is あしば (got ${q1.reading})`);
    assert(q1.effectiveKeystrokes > 0, `First question effectiveKeystrokes is positive (got ${q1.effectiveKeystrokes})`);

  } catch (err) {
    assert(false, `Unexpected error during real CSV loading: ${err.message}`);
  }

  // Test 5: Malformed CSV header rejection
  try {
    const badCsv = "ID,Category,DisplayText\n1,Cat,Text";
    parseCsvContent(badCsv);
    assert(false, "Should reject CSV with missing required headers");
  } catch (err) {
    assert(err.message.includes("Header missing required column"), `Rejected missing headers: ${err.message}`);
  }

  // Test 6: Duplicate ID rejection
  try {
    const dupCsv = `ID,Difficulty,Category,DisplayText,Reading,RecommendedRomaji,SourceBasis,Note
B001,BEGINNER,足場材,支柱,しちゅう,shichuu,出典,備考
B001,BEGINNER,足場材,手摺,てすり,tesuri,出典,備考`;
    parseCsvContent(dupCsv);
    assert(false, "Should reject duplicate ID");
  } catch (err) {
    assert(err.message.includes("Duplicate Question ID"), `Rejected duplicate ID: ${err.message}`);
  }

  // Test 7: Invalid Difficulty rejection
  try {
    const invalidDiffCsv = `ID,Difficulty,Category,DisplayText,Reading,RecommendedRomaji,SourceBasis,Note
B001,SUPER_HARD,足場材,支柱,しちゅう,shichuu,出典,備考`;
    parseCsvContent(invalidDiffCsv);
    assert(false, "Should reject invalid difficulty");
  } catch (err) {
    assert(err.message.includes("Invalid Difficulty"), `Rejected invalid difficulty: ${err.message}`);
  }

  // Test 8: Empty / Missing fields rejection
  try {
    const missingFieldCsv = `ID,Difficulty,Category,DisplayText,Reading,RecommendedRomaji,SourceBasis,Note
B001,BEGINNER,,支柱,しちゅう,shichuu,出典,備考`;
    parseCsvContent(missingFieldCsv);
    assert(false, "Should reject missing required field");
  } catch (err) {
    assert(err.message.includes("missing required fields"), `Rejected missing fields: ${err.message}`);
  }

  return { passed, failed };
}
