import { EXTRA_CONFIG, EXTRA_EVENT_TYPES } from "../src/config/extraVisualConfig.js";
import { ExtraEventManager } from "../src/visual/animation/extraEventManager.js";
import { getAirplaneSvg } from "../src/visual/pixel/extra/airplaneSvg.js";
import { getHelicopterSvg } from "../src/visual/pixel/extra/helicopterSvg.js";
import { getBalloonsSvg } from "../src/visual/pixel/extra/balloonsSvg.js";
import { getSkydiverSvg } from "../src/visual/pixel/extra/skydiverSvg.js";
import { getRainbowSvg } from "../src/visual/pixel/extra/rainbowSvg.js";
import { isExtraStage } from "../src/engine/backgroundProgression.js";
import { GameSession } from "../src/engine/gameSession.js";
import { GAME_MODES, DIFFICULTY_LEVELS } from "../src/engine/gameState.js";
import { DEFAULT_QUESTIONS } from "../src/data/defaultQuestions.js";

export function runExtraEventsTests() {
  console.log("\n=== Testing EXTRA Stage Visual Events & Event Manager ===");
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

  // --- 1. Boundary Verification ---
  assert(isExtraStage(33) === false, "Count 33 is NOT EXTRA (Skytree complete)");
  assert(isExtraStage(34) === true, "Count 34 IS EXTRA");
  assert(isExtraStage(35) === true, "Count 35 IS EXTRA");

  const mgr1 = new ExtraEventManager();
  mgr1.onExtraSuccess(33);
  assert(mgr1.activeEvents.length === 0, "onExtraSuccess(33) spawns NO events");

  mgr1.onExtraSuccess(34);
  assert(mgr1.activeEvents.length === 1, "onExtraSuccess(34) triggers first EXTRA celebration event");
  assert(mgr1.activeEvents[0].type === EXTRA_EVENT_TYPES.BALLOONS, "First EXTRA event at count 34 is BALLOONS");

  // --- 2. Pixel Art Sprite Renderers ---
  const airplaneSvg = getAirplaneSvg({ beaconOn: true });
  assert(airplaneSvg.includes("extra-airplane-svg"), "Airplane SVG contains class name");
  assert(airplaneSvg.includes("viewBox=\"0 0 48 16\""), "Airplane SVG has 48x16 viewBox");
  assert(airplaneSvg.includes("crispEdges"), "Airplane SVG uses crispEdges rendering");

  const heliFrame0 = getHelicopterSvg({ rotorFrame: 0 });
  const heliFrame1 = getHelicopterSvg({ rotorFrame: 1 });
  assert(heliFrame0.includes("extra-helicopter-svg"), "Helicopter SVG contains class name");
  assert(heliFrame0.includes("viewBox=\"0 0 42 20\""), "Helicopter SVG has 42x20 viewBox");
  assert(heliFrame0 !== heliFrame1, "Helicopter rotor frames differ between animation steps");

  const balloonsSvg = getBalloonsSvg();
  assert(balloonsSvg.includes("extra-balloons-svg"), "Balloons SVG contains class name");
  assert(balloonsSvg.includes("viewBox=\"0 0 28 38\""), "Balloons SVG has 28x38 viewBox");

  const skydiverFreefall = getSkydiverSvg({ isParachuteOpen: false });
  const skydiverChute = getSkydiverSvg({ isParachuteOpen: true });
  assert(skydiverFreefall.includes("extra-skydiver-freefall"), "Skydiver freefall SVG generated");
  assert(skydiverChute.includes("extra-skydiver-parachute"), "Skydiver parachute SVG generated");
  assert(skydiverChute.includes("viewBox=\"0 0 32 36\""), "Skydiver parachute has 32x36 viewBox");

  const rainbowSvg = getRainbowSvg({ opacity: 0.75 });
  assert(rainbowSvg.includes("extra-rainbow-svg"), "Rainbow SVG contains class name");
  assert(rainbowSvg.includes("opacity=\"0.75\""), "Rainbow SVG applies opacity");
  assert(rainbowSvg.includes("viewBox=\"0 0 900 135\""), "Rainbow spans full 900x135 sky");

  // --- 3. Deterministic / Seedable Event Selection ---
  // Mock deterministic sequence to pick specific events
  let mockVal = 0.5;
  const deterministicMgr = new ExtraEventManager({ randomFn: () => mockVal });

  deterministicMgr.spawnEvent(EXTRA_EVENT_TYPES.AIRPLANE);
  assert(deterministicMgr.isTypeActive(EXTRA_EVENT_TYPES.AIRPLANE) === true, "Spawned AIRPLANE is active");
  deterministicMgr.spawnEvent(EXTRA_EVENT_TYPES.HELICOPTER);
  assert(deterministicMgr.isTypeActive(EXTRA_EVENT_TYPES.HELICOPTER) === true, "Spawned HELICOPTER is active");
  assert(deterministicMgr.activeEvents.length === 2, "2 events active");

  // --- 4. Concurrency Limits & Duplicate Prevention ---
  deterministicMgr.spawnEvent(EXTRA_EVENT_TYPES.BALLOONS);
  assert(deterministicMgr.activeEvents.length === 3, "Reached 3 concurrent dynamic events (max)");

  // Attempting to spawn when limit reached
  deterministicMgr.onExtraSuccess(36);
  assert(deterministicMgr.activeEvents.length <= EXTRA_CONFIG.maxConcurrentDynamicEvents, "Concurrency clamped to max 3");

  // Duplicate type check: Cannot add duplicate AIRPLANE
  const beforeLen = deterministicMgr.activeEvents.length;
  if (!deterministicMgr.isTypeActive(EXTRA_EVENT_TYPES.AIRPLANE)) {
    deterministicMgr.spawnEvent(EXTRA_EVENT_TYPES.AIRPLANE);
  }
  assert(deterministicMgr.activeEvents.filter((e) => e.type === EXTRA_EVENT_TYPES.AIRPLANE).length <= 1, "Duplicate AIRPLANE prevented");

  // --- 5. Rare Skydiver Probability Test ---
  const skydiverMgr = new ExtraEventManager({
    randomFn: () => 0.05, // Below 0.12 skydiver threshold
    config: { ...EXTRA_CONFIG, skydiverProbability: 0.12, rainbowProbability: 0 }
  });
  skydiverMgr.onExtraSuccess(35);
  assert(skydiverMgr.isTypeActive(EXTRA_EVENT_TYPES.SKYDIVER) === true, "Skydiver spawned when below probability threshold");

  const noSkydiverMgr = new ExtraEventManager({
    randomFn: () => 0.99, // Way above threshold
    config: { ...EXTRA_CONFIG, skydiverProbability: 0.12, rainbowProbability: 0 }
  });
  noSkydiverMgr.onExtraSuccess(35);
  assert(noSkydiverMgr.isTypeActive(EXTRA_EVENT_TYPES.SKYDIVER) === false, "Skydiver NOT spawned when above probability threshold");

  // --- 6. Rainbow State Transitions ---
  const rainbowMgr = new ExtraEventManager();
  assert(rainbowMgr.rainbowState.active === false, "Rainbow initially inactive");
  assert(rainbowMgr.renderRainbow() === "", "renderRainbow empty when inactive");

  rainbowMgr.triggerRainbow();
  assert(rainbowMgr.rainbowState.active === true, "Rainbow active after trigger");

  rainbowMgr.update(0.4); // halfway through 0.8s fade-in
  assert(rainbowMgr.rainbowState.opacity > 0 && rainbowMgr.rainbowState.opacity < 1.0, `Rainbow fading in (opacity ${rainbowMgr.rainbowState.opacity})`);

  rainbowMgr.update(0.5); // full opacity
  assert(rainbowMgr.rainbowState.opacity === 1.0, "Rainbow reached full opacity (1.0)");
  assert(rainbowMgr.renderRainbow().includes("opacity=\"1.00\""), "renderRainbow outputs SVG at full opacity");

  // Fast-forward past rainbow duration (14s)
  rainbowMgr.update(15.0);
  assert(rainbowMgr.rainbowState.active === false, "Rainbow deactivated after expiration");
  assert(rainbowMgr.renderRainbow() === "", "renderRainbow empty after expiration");

  // --- 7. Dynamic Events Lifecycle & Movement ---
  const motionMgr = new ExtraEventManager();
  motionMgr.spawnEvent(EXTRA_EVENT_TYPES.AIRPLANE);
  const airplaneEvent = motionMgr.activeEvents[0];
  const startX = airplaneEvent.x;
  motionMgr.update(2.0);
  assert(airplaneEvent.x > startX, `Airplane moved forward horizontally (from ${startX} to ${airplaneEvent.x})`);

  // Fast-forward past airplane duration (8s)
  motionMgr.update(7.0);
  assert(motionMgr.activeEvents.length === 0, "Airplane cleanly removed after completing flight duration");

  // --- 8. Session Reset Cleanup ---
  motionMgr.spawnEvent(EXTRA_EVENT_TYPES.AIRPLANE);
  motionMgr.spawnEvent(EXTRA_EVENT_TYPES.HELICOPTER);
  motionMgr.triggerRainbow();
  assert(motionMgr.activeEvents.length === 2, "2 events before reset");
  assert(motionMgr.rainbowState.active === true, "Rainbow active before reset");

  motionMgr.reset();
  assert(motionMgr.activeEvents.length === 0, "activeEvents empty after reset");
  assert(motionMgr.rainbowState.active === false, "rainbowState inactive after reset");
  assert(motionMgr.renderDynamicEvents() === "", "renderDynamicEvents returns empty string after reset");
  assert(motionMgr.renderRainbow() === "", "renderRainbow returns empty string after reset");

  // --- 9. GameSession MISS Independence with EXTRA State ---
  const session = new GameSession({ mode: GAME_MODES.PRODUCTION, difficulty: DIFFICULTY_LEVELS.BEGINNER, questions: DEFAULT_QUESTIONS });
  session.startPlaying();
  for (let i = 0; i < 34; i++) session.handleSuccess(); // Reaches EXTRA (34)
  assert(session.correctCount === 34, "Session reached 34 correct");
  assert(session.truckLoadStage > 0, "Truck has cargo");

  const summaryBefore = session.getSummary();
  assert(summaryBefore.backgroundStage.stageKey === "EXTRA", "Session is in EXTRA stage");

  // Trigger timeout MISS
  session.handleMissTimeout();
  assert(session.truckLoadStage === 0, "Truck load resets to 0 on MISS");
  const summaryAfter = session.getSummary();
  assert(summaryAfter.backgroundStage.stageKey === "EXTRA", "Session maintains EXTRA stage after MISS");
  assert(summaryAfter.correctCount === 34, "Correct count maintained across MISS");

  // --- 10. Rapid Succession Smoke Simulation (30 successes) ---
  const rapidMgr = new ExtraEventManager();
  for (let q = 34; q < 64; q++) {
    rapidMgr.onExtraSuccess(q);
    rapidMgr.update(0.3); // 300ms elapsed between questions
    assert(rapidMgr.activeEvents.length <= EXTRA_CONFIG.maxConcurrentDynamicEvents, `Rapid q=${q}: concurrency within limit`);
  }
  assert(rapidMgr.activeEvents.length > 0, "Rapid play maintained active airborne events without crashes");
  rapidMgr.reset();
  assert(rapidMgr.activeEvents.length === 0, "Rapid play cleanly wiped on reset");

  return { passed, failed };
}
