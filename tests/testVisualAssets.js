import { PALETTE } from "../src/visual/pixel/palette.js";
import { getForkliftSvg } from "../src/visual/pixel/forkliftSvg.js";
import {
  SCAFFOLD_LOAD_TYPES,
  SCAFFOLD_LOAD_LIST,
  getScaffoldLoadSvg,
  getRandomScaffoldLoad
} from "../src/visual/pixel/scaffoldLoadsSvg.js";
import {
  TRUCK_TYPES,
  TRUCK_METADATA,
  getTruckTypeForDifficulty,
  getTruckSvg
} from "../src/visual/pixel/trucksSvg.js";
import { getSuccessSparkSvg, getCollisionBurstSvg } from "../src/visual/pixel/effectsSvg.js";
import { VISUAL_STATES, GameVisualScene } from "../src/visual/animation/visualScene.js";
import { GameSession } from "../src/engine/gameSession.js";
import { GAME_MODES, DIFFICULTY_LEVELS } from "../src/engine/gameState.js";
import { DEFAULT_QUESTIONS } from "../src/data/defaultQuestions.js";

export function runVisualAssetsTests() {
  console.log("\n=== Testing Pixel Art Visual Assets, Truck Loading Stages & MISS Reset ===");
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

  // 1. Palette check
  assert(PALETTE.FORK_BODY_MAIN === "#fb8500", "Palette contains FORK_BODY_MAIN");
  assert(PALETTE.OUTLINE_DARK === "#141923", "Palette contains OUTLINE_DARK");

  // 2. Forklift SVG Sprite
  const forkliftSvg = getForkliftSvg({ wheelFrame: 0, forkLiftY: 0 });
  assert(forkliftSvg.includes("<svg") && forkliftSvg.includes("</svg>"), "getForkliftSvg returns valid SVG markup");
  assert(forkliftSvg.includes('viewBox="0 0 96 56"'), "Forklift has 96x56 viewBox");
  assert(forkliftSvg.includes('shape-rendering="crispEdges"'), "Forklift uses crispEdges rendering");

  // Multi-frame test
  const forkF1 = getForkliftSvg({ wheelFrame: 1 });
  const forkF2 = getForkliftSvg({ wheelFrame: 2 });
  assert(forkF1 !== forkF2, "Forklift wheel animation changes between frames");

  // 3. 7 Scaffold Load Sprites
  assert(SCAFFOLD_LOAD_LIST.length === 7, `7 Scaffold load types defined (got ${SCAFFOLD_LOAD_LIST.length})`);
  assert(SCAFFOLD_LOAD_LIST.includes(SCAFFOLD_LOAD_TYPES.POST_BUNDLE), "Includes POST_BUNDLE");
  assert(SCAFFOLD_LOAD_LIST.includes(SCAFFOLD_LOAD_TYPES.HANDRAIL_BUNDLE), "Includes HANDRAIL_BUNDLE");
  assert(SCAFFOLD_LOAD_LIST.includes(SCAFFOLD_LOAD_TYPES.FRAME_STACK), "Includes FRAME_STACK");
  assert(SCAFFOLD_LOAD_LIST.includes(SCAFFOLD_LOAD_TYPES.PLANK_STACK), "Includes PLANK_STACK");
  assert(SCAFFOLD_LOAD_LIST.includes(SCAFFOLD_LOAD_TYPES.BRACE_BUNDLE), "Includes BRACE_BUNDLE");
  assert(SCAFFOLD_LOAD_LIST.includes(SCAFFOLD_LOAD_TYPES.JACK_BASE_PALLET), "Includes JACK_BASE_PALLET");
  assert(SCAFFOLD_LOAD_LIST.includes(SCAFFOLD_LOAD_TYPES.SMALL_PARTS_PALLET), "Includes SMALL_PARTS_PALLET");

  for (const type of SCAFFOLD_LOAD_LIST) {
    const svg = getScaffoldLoadSvg(type);
    assert(svg.includes("<svg") && svg.includes("</svg>"), `Scaffold sprite for ${type} generates valid SVG`);
  }

  // Randomizer avoidance
  let avoidedDup = true;
  for (let i = 0; i < 20; i++) {
    const next = getRandomScaffoldLoad(SCAFFOLD_LOAD_TYPES.POST_BUNDLE);
    if (next === SCAFFOLD_LOAD_TYPES.POST_BUNDLE) {
      avoidedDup = false;
      break;
    }
  }
  assert(avoidedDup === true, "getRandomScaffoldLoad avoids immediate consecutive duplicate");

  // 4. Trucks by Difficulty & Metadata
  assert(getTruckTypeForDifficulty("BEGINNER") === TRUCK_TYPES.KEI_TRUCK, "BEGINNER maps to KEI_TRUCK");
  assert(getTruckTypeForDifficulty("INTERMEDIATE") === TRUCK_TYPES.CRANE_4T, "INTERMEDIATE maps to CRANE_4T");
  assert(getTruckTypeForDifficulty("ADVANCED") === TRUCK_TYPES.CRANE_15T, "ADVANCED maps to CRANE_15T");

  const metaKei = TRUCK_METADATA[TRUCK_TYPES.KEI_TRUCK];
  const meta4t = TRUCK_METADATA[TRUCK_TYPES.CRANE_4T];
  const meta15t = TRUCK_METADATA[TRUCK_TYPES.CRANE_15T];
  assert(metaKei.width < meta4t.width && meta4t.width < meta15t.width, "Truck widths scale with difficulty: Kei < 4t < 15t");

  // 5. 5-Level Truck Loading Stages (0 to 5) for all 3 Truck Types
  for (const truckType of [TRUCK_TYPES.KEI_TRUCK, TRUCK_TYPES.CRANE_4T, TRUCK_TYPES.CRANE_15T]) {
    const svg0 = getTruckSvg(truckType, { loadStage: 0 });
    const svg1 = getTruckSvg(truckType, { loadStage: 1 });
    const svg3 = getTruckSvg(truckType, { loadStage: 3 });
    const svg5 = getTruckSvg(truckType, { loadStage: 5 });

    assert(svg0.includes("<svg"), `${truckType} stage 0 generates valid SVG`);
    assert(svg1.includes("<svg"), `${truckType} stage 1 generates valid SVG`);
    assert(svg3.includes("<svg"), `${truckType} stage 3 generates valid SVG`);
    assert(svg5.includes("<svg"), `${truckType} stage 5 generates valid SVG`);
    assert(svg0 !== svg1, `${truckType} stage 1 adds visible load over stage 0`);
    assert(svg1 !== svg5, `${truckType} stage 5 has fuller load than stage 1`);
  }

  // 6. Visual Scene Coordinator Loading Progression & MISS Reset Tests
  const mockContainer = {
    innerHTML: "",
    querySelector: () => ({ style: {}, innerHTML: "" })
  };
  const scene = new GameVisualScene(mockContainer);

  assert(scene.truckLoadStage === 0, "Initial truckLoadStage is 0");
  scene.triggerSuccess();
  assert(scene.truckLoadStage === 1, "After 1st SUCCESS, truckLoadStage is 1");
  scene.triggerSuccess();
  assert(scene.truckLoadStage === 2, "After 2nd SUCCESS, truckLoadStage is 2");
  scene.triggerSuccess();
  assert(scene.truckLoadStage === 3, "After 3rd SUCCESS, truckLoadStage is 3");
  scene.triggerSuccess();
  assert(scene.truckLoadStage === 4, "After 4th SUCCESS, truckLoadStage is 4");
  scene.triggerSuccess();
  assert(scene.truckLoadStage === 5, "After 5th SUCCESS, truckLoadStage is 5");
  scene.triggerSuccess();
  assert(scene.truckLoadStage === 5, "After 6th+ SUCCESS, truckLoadStage remains clamped at 5");

  // Phase 3.2: Timeout MISS resets truckLoadStage to 0
  scene.triggerMiss();
  assert(scene.truckLoadStage === 0, "MISS collision resets truckLoadStage to 0 (empty flatbed)");

  // SUCCESS after MISS restarts at 1
  scene.triggerSuccess();
  assert(scene.truckLoadStage === 1, "SUCCESS after MISS advances truckLoadStage to 1");

  // Resetting for difficulty / new session resets loadStage to 0
  scene.setDifficulty("INTERMEDIATE");
  assert(scene.truckLoadStage === 0, "setDifficulty resets truckLoadStage to 0");

  // --- 7. GameSession State Integration & Reset Cases (Sections 16-21) ---
  // Case 1: Stage 0 -> Timeout MISS -> Stage 0
  const sess1 = new GameSession({ mode: GAME_MODES.PRODUCTION, difficulty: DIFFICULTY_LEVELS.BEGINNER, questions: DEFAULT_QUESTIONS });
  sess1.startPlaying();
  sess1.handleMissTimeout();
  assert(sess1.truckLoadStage === 0, "Case 1: Stage 0 -> Timeout MISS -> Stage 0");

  // Case 2: Stage 1 -> Timeout MISS -> Stage 0
  const sess2 = new GameSession({ mode: GAME_MODES.PRODUCTION, difficulty: DIFFICULTY_LEVELS.BEGINNER, questions: DEFAULT_QUESTIONS });
  sess2.startPlaying();
  sess2.handleSuccess();
  assert(sess2.truckLoadStage === 1, "Stage reached 1 after success");
  sess2.handleMissTimeout();
  assert(sess2.truckLoadStage === 0, "Case 2: Stage 1 -> Timeout MISS -> Stage 0");

  // Case 3: Stage 3 -> Timeout MISS -> Stage 0
  const sess3 = new GameSession({ mode: GAME_MODES.PRODUCTION, difficulty: DIFFICULTY_LEVELS.BEGINNER, questions: DEFAULT_QUESTIONS });
  sess3.startPlaying();
  sess3.handleSuccess();
  sess3.handleSuccess();
  sess3.handleSuccess();
  assert(sess3.truckLoadStage === 3, "Stage reached 3 after 3 successes");
  sess3.handleMissTimeout();
  assert(sess3.truckLoadStage === 0, "Case 3: Stage 3 -> Timeout MISS -> Stage 0");

  // Case 4: Stage 5 -> Timeout MISS -> Stage 0
  const sess4 = new GameSession({ mode: GAME_MODES.PRODUCTION, difficulty: DIFFICULTY_LEVELS.BEGINNER, questions: DEFAULT_QUESTIONS });
  sess4.startPlaying();
  for (let i = 0; i < 6; i++) sess4.handleSuccess();
  assert(sess4.truckLoadStage === 5, "Stage reached 5 after 6 successes");
  sess4.handleMissTimeout();
  assert(sess4.truckLoadStage === 0, "Case 4: Stage 5 -> Timeout MISS -> Stage 0");

  // Typing Mistake Regression: Stage 4 -> Typing Mistake -> Stage 4 (no reset)
  const sessTypo = new GameSession({ mode: GAME_MODES.PRODUCTION, difficulty: DIFFICULTY_LEVELS.BEGINNER, questions: DEFAULT_QUESTIONS });
  sessTypo.startPlaying();
  for (let i = 0; i < 4; i++) sessTypo.handleSuccess();
  assert(sessTypo.truckLoadStage === 4, "Stage reached 4");
  sessTypo.handleInput("!"); // wrong key
  assert(sessTypo.truckLoadStage === 4, "Typing mistake does NOT reset truckLoadStage (remains Stage 4)");

  // Alternate Romaji Regression: Stage 4 -> Accepted variant -> Stage 4 until success
  const sessVar = new GameSession({
    mode: GAME_MODES.PRODUCTION,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    questions: [{ id: "TEST_ZI", difficulty: "BEGINNER", displayText: "じ", reading: "じ", canonicalTarget: "JI", effectiveKeystrokes: 2 }]
  });
  sessVar.startPlaying();
  for (let i = 0; i < 4; i++) sessVar.handleSuccess();
  assert(sessVar.truckLoadStage === 4, "Stage is 4");
  sessVar.handleInput("z"); // accepted variant
  assert(sessVar.truckLoadStage === 4, "Accepted variant does NOT reset truckLoadStage");

  // Sequence: SUCCESS x4 -> TIMEOUT MISS -> SUCCESS
  const sessSeq = new GameSession({ mode: GAME_MODES.PRODUCTION, difficulty: DIFFICULTY_LEVELS.BEGINNER, questions: DEFAULT_QUESTIONS });
  sessSeq.startPlaying();
  for (let i = 0; i < 4; i++) sessSeq.handleSuccess();
  assert(sessSeq.truckLoadStage === 4, "Sequence: Reached Stage 4");
  sessSeq.handleMissTimeout();
  assert(sessSeq.truckLoadStage === 0, "Sequence: MISS reset to Stage 0");
  sessSeq.handleSuccess();
  assert(sessSeq.truckLoadStage === 1, "Sequence: SUCCESS after MISS reaches Stage 1");

  // Background Independence: Correct count sufficient for BUILDING stage, MISS resets truck load to 0 while background remains BUILDING
  const sessBg = new GameSession({ mode: GAME_MODES.PRODUCTION, difficulty: DIFFICULTY_LEVELS.BEGINNER, questions: DEFAULT_QUESTIONS });
  sessBg.startPlaying();
  for (let i = 0; i < 14; i++) sessBg.handleSuccess(); // 14 correct -> BUILDING stage
  const summaryBefore = sessBg.getSummary();
  assert(summaryBefore.backgroundStage.stageKey === "BUILDING", "Background stage is BUILDING");
  sessBg.handleMissTimeout();
  const summaryAfter = sessBg.getSummary();
  assert(sessBg.truckLoadStage === 0, "Truck loadStage reset to 0 on MISS");
  assert(summaryAfter.backgroundStage.stageKey === "BUILDING", "Background stage remains BUILDING after MISS");
  assert(summaryAfter.correctCount === 14, "Correct count remains 14 after MISS");

  // 8. Effects SVG
  assert(getSuccessSparkSvg().includes("<svg"), "Success spark SVG generated");
  assert(getCollisionBurstSvg().includes("<svg"), "Collision burst SVG generated");

  // 9. Visual States
  assert(VISUAL_STATES.IDLE === "IDLE", "Visual state IDLE exists");
  assert(VISUAL_STATES.RUN === "RUN", "Visual state RUN exists");
  assert(VISUAL_STATES.SUCCESS_LOAD === "SUCCESS_LOAD", "Visual state SUCCESS_LOAD exists");
  assert(VISUAL_STATES.COLLISION === "COLLISION", "Visual state COLLISION exists");

  return { passed, failed };
}
