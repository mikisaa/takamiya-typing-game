import {
  BACKGROUND_STAGES,
  getBackgroundStage,
  isExtraStage,
  getConstructionDetails
} from "../src/engine/backgroundProgression.js";
import { getCityCompositionSvg } from "../src/visual/pixel/background/cityComposition.js";
import { GameSession } from "../src/engine/gameSession.js";
import { GAME_MODES, DIFFICULTY_LEVELS } from "../src/engine/gameState.js";
import { DEFAULT_QUESTIONS } from "../src/data/defaultQuestions.js";

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
  assert(s3.isExtra === false, "3 correct -> isExtra is false");

  // Test 3: Stage 3 - HOUSE (7 correct)
  const s7 = getBackgroundStage(7);
  assert(s7.stageKey === BACKGROUND_STAGES.HOUSE, `7 correct -> HOUSE (got ${s7.stageKey})`);
  assert(s7.step === 3, "7 correct -> Step 3");
  assert(s7.isExtra === false, "7 correct -> isExtra is false");

  // Test 4: Stage 4 - BUILDING (12 correct)
  const s12 = getBackgroundStage(12);
  assert(s12.stageKey === BACKGROUND_STAGES.BUILDING, `12 correct -> BUILDING (got ${s12.stageKey})`);
  assert(s12.step === 4, "12 correct -> Step 4");
  assert(s12.isExtra === false, "12 correct -> isExtra is false");

  // Test 5: Stage 5 - HIGHRISE (18 correct)
  const s18 = getBackgroundStage(18);
  assert(s18.stageKey === BACKGROUND_STAGES.HIGHRISE, `18 correct -> HIGHRISE (got ${s18.stageKey})`);
  assert(s18.step === 5, "18 correct -> Step 5");
  assert(s18.isExtra === false, "18 correct -> isExtra is false");

  // Test 6: Stage 6 - TOKYO_TOWER (25 correct)
  const s25 = getBackgroundStage(25);
  assert(s25.stageKey === BACKGROUND_STAGES.TOKYO_TOWER, `25 correct -> TOKYO_TOWER (got ${s25.stageKey})`);
  assert(s25.step === 6, "25 correct -> Step 6");
  assert(s25.isExtra === false, "25 correct -> isExtra is false");

  // Test 7: Stage 7 - SKYTREE Completion State (33 correct)
  // Section 19 Audit: 33 correct is completed Skytree landmark; EXTRA begins strictly at 34+
  const s33 = getBackgroundStage(33);
  assert(s33.step === 7, "33 correct -> Step 7 (Skytree complete)");
  assert(s33.stageKey === BACKGROUND_STAGES.SKYTREE, `33 correct -> SKYTREE (got ${s33.stageKey})`);
  assert(s33.isExtra === false, "33 correct -> isExtra is false (completion state)");
  assert(isExtraStage(33) === false, "isExtraStage(33) is false");

  // Test 8: Stage 8 - EXTRA (34+ correct)
  const s34 = getBackgroundStage(34);
  assert(s34.stageKey === BACKGROUND_STAGES.EXTRA, `34 correct -> EXTRA (got ${s34.stageKey})`);
  assert(s34.isExtra === true, "34 correct -> isExtra is true");
  assert(isExtraStage(34) === true, "isExtraStage(34) is true");

  const s35 = getBackgroundStage(35);
  assert(s35.stageKey === BACKGROUND_STAGES.EXTRA, `35 correct -> EXTRA (got ${s35.stageKey})`);
  assert(s35.isExtra === true, "35 correct -> isExtra is true");
  assert(isExtraStage(35) === true, "isExtraStage(35) is true");

  // --- Test 9: Progressive Construction Sub-steps (Section 38) ---
  const c7 = getConstructionDetails(7);
  const c8 = getConstructionDetails(8);
  const c9 = getConstructionDetails(9);
  const c10 = getConstructionDetails(10);
  const c11 = getConstructionDetails(11);

  assert(c7.houseStep === 0, "House step at 7 is 0");
  assert(c8.houseStep === 1, "House step at 8 is 1");
  assert(c9.houseStep === 2, "House step at 9 is 2");
  assert(c10.houseStep === 3, "House step at 10 is 3");
  assert(c11.houseStep === 4, "House step at 11 is 4 (completed)");
  assert(c7.constructionProgress < c8.constructionProgress, "Construction progress increases monotonically (7 < 8)");
  assert(c8.constructionProgress < c9.constructionProgress, "Construction progress increases monotonically (8 < 9)");
  assert(c10.constructionProgress < c11.constructionProgress, "Construction progress increases monotonically (10 < 11)");

  // --- Test 10: Building Persistence Across Stages (Section 39) ---
  // In BUILDING Stage (e.g. 14 correct): Container and House must exist
  const svgBuildingStage = getCityCompositionSvg(14);
  assert(svgBuildingStage.includes("city-panorama-svg"), "City composition generates SVG");
  assert(svgBuildingStage.includes("Container Foundation"), "Container persists in Building stage");
  assert(svgBuildingStage.includes("House Foundation"), "House persists in Building stage");
  assert(svgBuildingStage.includes("Building Deep Concrete Foundation"), "Building under construction in Building stage");

  // In TOKYO_TOWER Stage (e.g. 28 correct): Container, House, Building, Highrise, and Tokyo Tower exist
  const svgTowerStage = getCityCompositionSvg(28);
  assert(svgTowerStage.includes("Container Foundation"), "Container persists in Tokyo Tower stage");
  assert(svgTowerStage.includes("House Foundation"), "House persists in Tokyo Tower stage");
  assert(svgTowerStage.includes("Building Deep Concrete Foundation"), "Building persists in Tokyo Tower stage");
  assert(svgTowerStage.includes("Deep Foundation Caissons"), "Highrise persists in Tokyo Tower stage");
  assert(svgTowerStage.includes("Tower Foundation Anchor Pads"), "Tokyo Tower under construction in Tokyo Tower stage");

  // In SKYTREE Stage (33 correct): Skytree landmark is rendered and previous buildings persist
  const svgSkytreeStage = getCityCompositionSvg(33);
  assert(svgSkytreeStage.includes("Skytree Deep Underground Piles"), "Skytree rendered in Skytree complete stage");
  assert(svgSkytreeStage.includes("Tower Foundation Anchor Pads"), "Tokyo Tower persists in Skytree stage");
  assert(svgSkytreeStage.includes("Deep Foundation Caissons"), "Highrise persists in Skytree stage");

  // --- Test 11: MISS Independence (Section 40) ---
  const session = new GameSession({ mode: GAME_MODES.PRODUCTION, difficulty: DIFFICULTY_LEVELS.BEGINNER, questions: DEFAULT_QUESTIONS });
  session.startPlaying();
  for (let i = 0; i < 12; i++) session.handleSuccess(); // reaches BUILDING stage (12)
  for (let i = 0; i < 4; i++) session.handleSuccess();  // 16 correct
  assert(session.truckLoadStage > 0, "Truck has accumulated load");
  assert(session.correctCount === 16, "Session correctCount is 16");

  const bgBeforeMiss = session.getSummary().backgroundStage;
  assert(bgBeforeMiss.stageKey === BACKGROUND_STAGES.BUILDING, "Background is BUILDING before MISS");

  // Trigger timeout MISS
  session.handleMissTimeout();
  assert(session.truckLoadStage === 0, "Truck load resets to 0 on MISS");
  const bgAfterMiss = session.getSummary().backgroundStage;
  assert(bgAfterMiss.stageKey === BACKGROUND_STAGES.BUILDING, "Background remains BUILDING after MISS");
  assert(session.correctCount === 16, "Correct count remains 16 after MISS");

  // --- Test 12: Practice Mode Progression (Section 41) ---
  const pracSession = new GameSession({ mode: GAME_MODES.PRACTICE, difficulty: DIFFICULTY_LEVELS.BEGINNER, questions: DEFAULT_QUESTIONS });
  pracSession.startPlaying();
  for (let i = 0; i < 7; i++) pracSession.handleSuccess();
  const pracBg = pracSession.getSummary().backgroundStage;
  assert(pracBg.stageKey === BACKGROUND_STAGES.HOUSE, "Practice mode advances background to HOUSE at 7 correct");

  return { passed, failed };
}
