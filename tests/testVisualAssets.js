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
import { VISUAL_STATES } from "../src/visual/animation/visualScene.js";

export function runVisualAssetsTests() {
  console.log("\n=== Testing Pixel Art Visual Assets & Animation Layer ===");
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
  assert(forkliftSvg.includes("viewBox=\"0 0 96 56\""), "Forklift has 96x56 viewBox");
  assert(forkliftSvg.includes("shape-rendering=\"crispEdges\""), "Forklift uses crispEdges rendering");

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

  // 4. Trucks by Difficulty
  assert(getTruckTypeForDifficulty("BEGINNER") === TRUCK_TYPES.KEI_TRUCK, "BEGINNER maps to KEI_TRUCK");
  assert(getTruckTypeForDifficulty("INTERMEDIATE") === TRUCK_TYPES.CRANE_4T, "INTERMEDIATE maps to CRANE_4T");
  assert(getTruckTypeForDifficulty("ADVANCED") === TRUCK_TYPES.CRANE_15T, "ADVANCED maps to CRANE_15T");

  // Metadata & Load Targets
  const metaKei = TRUCK_METADATA[TRUCK_TYPES.KEI_TRUCK];
  const meta4t = TRUCK_METADATA[TRUCK_TYPES.CRANE_4T];
  const meta15t = TRUCK_METADATA[TRUCK_TYPES.CRANE_15T];

  assert(metaKei.width < meta4t.width && meta4t.width < meta15t.width, "Truck widths scale with difficulty: Kei < 4t < 15t");
  assert(typeof metaKei.loadTarget.x === "number" && typeof metaKei.loadTarget.y === "number", "Kei truck has valid loadTarget");
  assert(typeof meta4t.loadTarget.x === "number" && typeof meta4t.loadTarget.y === "number", "4t truck has valid loadTarget");
  assert(typeof meta15t.loadTarget.x === "number" && typeof meta15t.loadTarget.y === "number", "15t truck has valid loadTarget");

  // Truck SVG generation
  assert(getTruckSvg(TRUCK_TYPES.KEI_TRUCK).includes("<svg"), "Kei truck SVG generated");
  assert(getTruckSvg(TRUCK_TYPES.CRANE_4T).includes("<svg"), "4t crane truck SVG generated");
  assert(getTruckSvg(TRUCK_TYPES.CRANE_15T).includes("<svg"), "15t crane truck SVG generated");

  // 5. Effects SVG
  assert(getSuccessSparkSvg().includes("<svg"), "Success spark SVG generated");
  assert(getCollisionBurstSvg().includes("<svg"), "Collision burst SVG generated");

  // 6. Visual States
  assert(VISUAL_STATES.IDLE === "IDLE", "Visual state IDLE exists");
  assert(VISUAL_STATES.RUN === "RUN", "Visual state RUN exists");
  assert(VISUAL_STATES.SUCCESS_LOAD === "SUCCESS_LOAD", "Visual state SUCCESS_LOAD exists");
  assert(VISUAL_STATES.COLLISION === "COLLISION", "Visual state COLLISION exists");

  return { passed, failed };
}
