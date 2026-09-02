import { runQuestionLoaderTests } from "./testQuestionLoader.js";
import { runTypingEngineTests } from "./testTypingEngine.js";
import { runTimingEngineTests } from "./testTimingEngine.js";
import { runSmoke180Test } from "./testSmoke180.js";
import { runBundleDriftTest } from "./testQuestionBundleDrift.js";
import { runGameStateTests } from "./testGameState.js";
import { runTimerTests } from "./testTimers.js";
import { runComboAndScoreTests } from "./testComboAndScore.js";
import { runQuestionSelectorTests } from "./testQuestionSelector.js";
import { runBackgroundProgressionTests } from "./testBackgroundProgression.js";
import { runIntegrationGameLoopTest } from "./testIntegrationGameLoop.js";
import { runVisualAssetsTests } from "./testVisualAssets.js";
import { runExtraEventsTests } from "./testExtraEvents.js";
import { runPaletteComplianceTests } from "./testPaletteCompliance.js";

console.log("==================================================");
console.log("BASE TYPING GAME — FULL AUTOMATED TEST SUITES");
console.log("==================================================");

let totalPassed = 0;
let totalFailed = 0;

const suites = [
  { name: "Question Loader", fn: runQuestionLoaderTests },
  { name: "Typing Engine", fn: runTypingEngineTests },
  { name: "Dynamic Timing Engine", fn: runTimingEngineTests },
  { name: "180 Questions Smoke Test", fn: runSmoke180Test },
  { name: "Question Bundle Drift Test", fn: runBundleDriftTest },
  { name: "Game State & Session", fn: runGameStateTests },
  { name: "Timers (Global & Forklift)", fn: runTimerTests },
  { name: "Combo & Scoring Formula", fn: runComboAndScoreTests },
  { name: "Question Selector & Pool", fn: runQuestionSelectorTests },
  { name: "Background Progression & EXTRA", fn: runBackgroundProgressionTests },
  { name: "Pixel Art Visual Layer & Sprites", fn: runVisualAssetsTests },
  { name: "EXTRA Stage Visual Events", fn: runExtraEventsTests },
  { name: "5-Color Palette & UI Compliance", fn: runPaletteComplianceTests },
  { name: "Full E2E Integration Loop", fn: runIntegrationGameLoopTest }
];

for (const suite of suites) {
  const res = suite.fn();
  totalPassed += res.passed;
  totalFailed += res.failed;
}

console.log("\n==================================================");
console.log(`TOTAL TEST RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
console.log("==================================================");

if (totalFailed > 0) {
  console.error(`\n❌ TEST SUITES FAILED with ${totalFailed} failures.`);
  process.exit(1);
} else {
  console.log("\n✅ ALL TEST SUITES PASSED SUCCESSFULLY!");
  process.exit(0);
}
