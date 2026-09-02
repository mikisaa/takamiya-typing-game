import {
  BACKGROUND_STAGES,
  getBackgroundStage,
  isExtraStage
} from "../src/engine/backgroundProgression.js";

export function runBackgroundProgressionTests() {
  console.log("\n=== Testing Background Construction Progression & EXTRA Logic ===");
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

  // Test 1: Stage 1 - GROUND (0 correct)
  const s0 = getBackgroundStage(0);
  assert(s0.stageKey === BACKGROUND_STAGES.GROUND, `0 correct -> GROUND (got ${s0.stageKey})`);
  assert(s0.step === 1, "0 correct -> Step 1");
  assert(s0.isExtra === false, "0 correct -> isExtra is false");

  // Test 2: Stage 2 - CONTAINER (3 correct)
  const s3 = getBackgroundStage(3);
  assert(s3.stageKey === BACKGROUND_STAGES.CONTAINER, `3 correct -> CONTAINER (got ${s3.stageKey})`);
  assert(s3.step === 2, "3 correct -> Step 2");

  // Test 3: Stage 3 - HOUSE (7 correct)
  const s7 = getBackgroundStage(7);
  assert(s7.stageKey === BACKGROUND_STAGES.HOUSE, `7 correct -> HOUSE (got ${s7.stageKey})`);
  assert(s7.step === 3, "7 correct -> Step 3");

  // Test 4: Stage 4 - BUILDING (12 correct)
  const s12 = getBackgroundStage(12);
  assert(s12.stageKey === BACKGROUND_STAGES.BUILDING, `12 correct -> BUILDING (got ${s12.stageKey})`);
  assert(s12.step === 4, "12 correct -> Step 4");

  // Test 5: Stage 5 - HIGHRISE (18 correct)
  const s18 = getBackgroundStage(18);
  assert(s18.stageKey === BACKGROUND_STAGES.HIGHRISE, `18 correct -> HIGHRISE (got ${s18.stageKey})`);
  assert(s18.step === 5, "18 correct -> Step 5");

  // Test 6: Stage 6 - TOKYO_TOWER (25 correct)
  const s25 = getBackgroundStage(25);
  assert(s25.stageKey === BACKGROUND_STAGES.TOKYO_TOWER, `25 correct -> TOKYO_TOWER (got ${s25.stageKey})`);
  assert(s25.step === 6, "25 correct -> Step 6");

  // Test 7: Stage 7 - SKYTREE (33 correct)
  const s33 = getBackgroundStage(33);
  assert(s33.step === 7, "33 correct -> Step 7 (Skytree complete)");
  assert(s33.isExtra === true, "33 correct -> isExtra is true");
  assert(isExtraStage(33) === true, "isExtraStage(33) is true");

  // Test 8: Stage 8 - EXTRA (34+ correct)
  const s35 = getBackgroundStage(35);
  assert(s35.stageKey === BACKGROUND_STAGES.EXTRA, `35 correct -> EXTRA stage (got ${s35.stageKey})`);
  assert(s35.isExtra === true, "35 correct -> isExtra is true");
  assert(isExtraStage(35) === true, "isExtraStage(35) is true");

  return { passed, failed };
}
