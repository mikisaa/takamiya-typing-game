import { runQuestionLoaderTests } from "./testQuestionLoader.js";
import { runTypingEngineTests } from "./testTypingEngine.js";
import { runTimingEngineTests } from "./testTimingEngine.js";
import { runSmoke180Test } from "./testSmoke180.js";

console.log("==================================================");
console.log("BASE TYPING GAME — AUTOMATED TEST SUITE EXECUTION");
console.log("==================================================");

let totalPassed = 0;
let totalFailed = 0;

// 1. Question Loader Tests
const resLoader = runQuestionLoaderTests();
totalPassed += resLoader.passed;
totalFailed += resLoader.failed;

// 2. Typing Engine Tests
const resTyping = runTypingEngineTests();
totalPassed += resTyping.passed;
totalFailed += resTyping.failed;

// 3. Timing Engine Tests
const resTiming = runTimingEngineTests();
totalPassed += resTiming.passed;
totalFailed += resTiming.failed;

// 4. Smoke Test 180 Questions
const resSmoke = runSmoke180Test();
totalPassed += resSmoke.passed;
totalFailed += resSmoke.failed;

console.log("\n==================================================");
console.log(`TOTAL TEST RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
console.log("==================================================");

if (totalFailed > 0) {
  console.error(`\n❌ TEST SUITE FAILED with ${totalFailed} failures.`);
  process.exit(1);
} else {
  console.log("\n✅ ALL TESTS PASSED SUCCESSFULLY!");
  process.exit(0);
}
