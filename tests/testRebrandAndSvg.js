import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { STORAGE_KEY_LAST_PLAYER_NAME, LEGACY_STORAGE_KEY_LAST_PLAYER_NAME, getLastPlayerName, setLastPlayerName, clearLastPlayerName } from "../src/storage/playerStorage.js";
import { BACKEND_CONFIG } from "../backend/shared/backendConfig.js";
import { TRUCK_METADATA, TRUCK_TYPES } from "../src/visual/pixel/trucksSvg.js";
import { getModeCardIconSvg, getRankingIconSvg, getStageIconSvg, getSuccessIconSvg, getMissIconSvg, getResultMetricIconSvg } from "../src/visual/pixel/uiIconsSvg.js";
import { GameSession } from "../src/engine/gameSession.js";
import { GAME_MODES, DIFFICULTY_LEVELS } from "../src/engine/gameState.js";
import { DEFAULT_QUESTIONS } from "../src/data/defaultQuestions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

export function runRebrandAndSvgTests() {
  console.log("\n=== Testing Rebranding, Storage Migration, SVGs & Visual Geometry ===");
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

  // 1. Package Identity & Version (v1.2.0)
  console.log("\n--- Package Identity & Version ---");
  const pkg = JSON.parse(fs.readFileSync(path.resolve(projectRoot, "package.json"), "utf-8"));
  assert(pkg.name === "takamiya-typing-game", "package.json name is takamiya-typing-game");
  assert(pkg.version === "1.2.0", "package.json version is 1.2.0");

  // 2. HTML Title, Branding & Copy Audit
  console.log("\n--- HTML Title, Branding & Copy Audit ---");
  const indexHtml = fs.readFileSync(path.resolve(projectRoot, "src/index.html"), "utf-8");
  assert(indexHtml.includes("TAKAMIYA TYPING GAME"), "index.html contains TAKAMIYA TYPING GAME");
  assert(indexHtml.includes("<title>TAKAMIYA TYPING GAME — 仮設足場・積込タイピングゲーム</title>"), "Document title updated to TAKAMIYA TYPING GAME");
  assert(indexHtml.includes("TTG"), "TTG brand mark exists in index.html");
  assert(!indexHtml.includes("BASE TYPING GAME"), "0 occurrences of BASE TYPING GAME in index.html");
  assert(!indexHtml.includes("Base Typing Game"), "0 occurrences of Base Typing Game in index.html");

  // Subtitle deletion & Ranking copy
  assert(!indexHtml.includes("仮設足場資材の積込作業をテーマにした爽快タイピングゲーム"), "Old subtitle is completely removed from index.html");
  assert(indexHtml.includes("今月・歴代"), "Ranking description is exactly '今月・歴代'");
  assert(!indexHtml.includes("今月・歴代の最高記録"), "Old ranking description '今月・歴代の最高記録' is removed");
  assert(indexHtml.includes("Version 1.2.0"), "index.html displays Version 1.2.0");

  // 3. Recognizable UI Vector Icons (Inline SVG, Zero OS Emojis, Zero React)
  console.log("\n--- Recognizable UI Vector Icons Audit ---");
  assert(!indexHtml.includes("<span class=\"btn-icon\">本</span>"), "[本] kanji icon removed from production mode button");
  assert(!indexHtml.includes("<span class=\"btn-icon\">練</span>"), "[練] kanji icon removed from practice mode button");
  assert(!indexHtml.includes("<span class=\"btn-icon\">順</span>"), "[順] kanji icon removed from ranking button");
  assert(indexHtml.includes("mode-icon-svg"), "Mode buttons contain mode-icon-svg inline SVG");
  assert(indexHtml.includes("ranking-icon-svg"), "Ranking button contains ranking-icon-svg inline SVG");

  // SVG helper functions return clean recognizable vector SVGs
  const prodIcon = getModeCardIconSvg("PRODUCTION");
  assert(prodIcon.includes("<svg") && prodIcon.includes("viewBox=\"0 0 24 24\""), "Production mode icon returns valid SVG markup");
  assert(prodIcon.includes("<circle") && prodIcon.includes("<path"), "Production mode icon renders recognizable truck silhouette with wheels & cargo bed");

  const practiceIcon = getModeCardIconSvg("PRACTICE");
  assert(practiceIcon.includes("<svg") && practiceIcon.includes("viewBox=\"0 0 24 24\""), "Practice mode icon returns valid SVG markup");
  assert(practiceIcon.includes("<rect") && practiceIcon.includes("rx=\"2.5\""), "Practice mode icon renders recognizable keyboard with key rows & spacebar");

  const rankIcon = getRankingIconSvg();
  assert(rankIcon.includes("<svg") && rankIcon.includes("viewBox=\"0 0 24 24\""), "Ranking icon returns valid SVG markup");
  assert(rankIcon.includes("<polygon") && rankIcon.includes("<rect"), "Ranking icon renders recognizable podium with 1st place star");

  // Stage icons
  const stages = ["GROUND", "CONTAINER", "HOUSE", "BUILDING", "HIGHRISE", "TOKYO_TOWER", "SKYTREE", "EXTRA"];
  for (const st of stages) {
    const stIcon = getStageIconSvg(st);
    assert(stIcon.includes("<svg") && stIcon.includes("stage-icon-svg"), `Stage icon for ${st} returns valid SVG`);
  }

  // Feedback icons (check-circle & x-circle)
  const successIcon = getSuccessIconSvg();
  assert(successIcon.includes("<svg") && successIcon.includes("feedback-icon-svg"), "SUCCESS feedback icon returns valid SVG");
  assert(successIcon.includes("<circle") && successIcon.includes("<path"), "SUCCESS icon is an unmistakable check-circle");

  const missIcon = getMissIconSvg();
  assert(missIcon.includes("<svg") && missIcon.includes("feedback-icon-svg"), "MISS feedback icon returns valid SVG");
  assert(missIcon.includes("<circle") && missIcon.includes("<path"), "MISS icon is an unmistakable x-circle");

  // Result metric icons
  const scoreIcon = getResultMetricIconSvg("SCORE");
  assert(scoreIcon.includes("metric-icon-svg"), "SCORE metric icon returns valid SVG");
  const accIcon = getResultMetricIconSvg("ACCURACY");
  assert(accIcon.includes("metric-icon-svg"), "ACCURACY metric icon returns valid SVG");
  const comboIcon = getResultMetricIconSvg("COMBO");
  assert(comboIcon.includes("metric-icon-svg"), "COMBO metric icon returns valid SVG");
  const stageIcon = getResultMetricIconSvg("STAGE");
  assert(stageIcon.includes("metric-icon-svg"), "STAGE metric icon returns valid SVG");

  // 4. LocalStorage Key & Safe Migration
  console.log("\n--- LocalStorage Key & Migration ---");
  assert(STORAGE_KEY_LAST_PLAYER_NAME === "ttg.lastPlayerName.v1", "Authoritative storage key is ttg.lastPlayerName.v1");
  assert(LEGACY_STORAGE_KEY_LAST_PLAYER_NAME === "baseTypingGame.lastPlayerName.v1", "Legacy key is baseTypingGame.lastPlayerName.v1");

  function createMockStore(initial = {}) {
    const store = { ...initial };
    return {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
      clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
      _data: store
    };
  }

  // Scenario A: Fresh user (empty)
  const storeA = createMockStore();
  assert(getLastPlayerName(storeA) === "", "Fresh storage returns empty string");

  // Scenario B: New user saves name
  setLastPlayerName("高宮 太郎", storeA);
  assert(storeA._data["ttg.lastPlayerName.v1"] === "高宮 太郎", "setLastPlayerName writes directly to new TTG key");
  assert(getLastPlayerName(storeA) === "高宮 太郎", "getLastPlayerName reads from new TTG key");

  // Scenario C: Migration from legacy key
  const storeC = createMockStore({
    "baseTypingGame.lastPlayerName.v1": "旧ユーザー 鈴木"
  });
  const migratedName = getLastPlayerName(storeC);
  assert(migratedName === "旧ユーザー 鈴木", "Legacy player name successfully read and migrated");
  assert(storeC._data["ttg.lastPlayerName.v1"] === "旧ユーザー 鈴木", "Migrated name written to new TTG key");
  assert(storeC._data["baseTypingGame.lastPlayerName.v1"] === undefined, "Legacy storage key safely removed after migration");

  // Scenario D: Both keys exist (new key takes precedence)
  const storeD = createMockStore({
    "ttg.lastPlayerName.v1": "新名称",
    "baseTypingGame.lastPlayerName.v1": "旧名称"
  });
  assert(getLastPlayerName(storeD) === "新名称", "New key takes precedence over old key");

  // Clear removes both keys
  clearLastPlayerName(storeD);
  assert(storeD._data["ttg.lastPlayerName.v1"] === undefined, "clear removes TTG key");
  assert(storeD._data["baseTypingGame.lastPlayerName.v1"] === undefined, "clear removes legacy key");

  // 5. Backend Service Identity
  console.log("\n--- Backend Service Identity ---");
  assert(BACKEND_CONFIG.SERVICE_NAME === "TAKAMIYA_TYPING_GAME_BACKEND", "BACKEND_CONFIG.SERVICE_NAME is TAKAMIYA_TYPING_GAME_BACKEND");

  // 6. Truck Geometry & Difficulty-Specific MISS Geometry
  console.log("\n--- Truck Geometry & MISS Geometry ---");
  const keiMeta = TRUCK_METADATA[TRUCK_TYPES.KEI_TRUCK];
  const crane4tMeta = TRUCK_METADATA[TRUCK_TYPES.CRANE_4T];
  const crane15tMeta = TRUCK_METADATA[TRUCK_TYPES.CRANE_15T];

  assert(crane15tMeta.visualYOffset === -6, "15t unic truck has visualYOffset: -6");
  assert(keiMeta.visualYOffset === 0, "Kei truck visualYOffset is 0 (unaffected)");
  assert(crane4tMeta.visualYOffset === 0, "4t truck visualYOffset is 0 (unaffected)");

  assert(Boolean(keiMeta.missDrop), "Kei truck defines missDrop geometry");
  assert(Boolean(crane4tMeta.missDrop), "4t truck defines missDrop geometry");
  assert(Boolean(crane15tMeta.missDrop), "15t truck defines missDrop geometry");

  assert(keiMeta.missDrop.deltaX !== crane15tMeta.missDrop.deltaX, "Beginner and Advanced have distinct MISS deltaX coordinates");
  assert(typeof keiMeta.missDrop.deltaY === "number" && isFinite(keiMeta.missDrop.deltaY), "Kei truck deltaY is finite number");
  assert(typeof crane15tMeta.missDrop.deltaY === "number" && isFinite(crane15tMeta.missDrop.deltaY), "15t truck deltaY is finite number");

  // 7. Result Metric NaN Regression Audit
  console.log("\n--- Result Metric NaN Regression Audit ---");

  // Case 1: Production session with 0 input
  const sessionZero = new GameSession({
    questions: DEFAULT_QUESTIONS,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    mode: GAME_MODES.PRODUCTION,
    playerName: "Zero Input Tester"
  });
  sessionZero.startReady();
  sessionZero.tick(3.1); // transition to playing
  sessionZero.finishSession();
  const summaryZero = sessionZero.getSummary();

  assert(summaryZero.typedCharacterCount === 0, "Zero input session has typedCharacterCount === 0");
  assert(summaryZero.typedCharacters === 0, "Zero input session has typedCharacters === 0");
  assert(Number.isFinite(summaryZero.typedCharacterCount), "Zero input typedCharacterCount is finite");
  assert(!Number.isNaN(summaryZero.typedCharacterCount), "Zero input typedCharacterCount is NOT NaN");
  assert(summaryZero.totalKeystrokes === 0, "Zero input totalKeystrokes is 0");
  assert(summaryZero.correctKeystrokes === 0, "Zero input correctKeystrokes is 0");

  // Verify display string logic does not produce "NaN文字"
  const renderedZero = `${summaryZero.typedCharacterCount ?? summaryZero.typedCharacters ?? 0} 文字`;
  assert(renderedZero === "0 文字", `Rendered zero input is '0 文字' (got '${renderedZero}')`);
  assert(!renderedZero.includes("NaN"), "Zero input rendered string does not contain NaN");

  // Case 2: Production session with keystrokes
  const sessionProd = new GameSession({
    questions: DEFAULT_QUESTIONS,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    mode: GAME_MODES.PRODUCTION,
    playerName: "Prod Tester"
  });
  sessionProd.startReady();
  sessionProd.tick(3.1); // ready -> playing
  // Type several characters
  const target = sessionProd.currentTypingEngine?.canonicalTarget || "test";
  for (const c of target) {
    sessionProd.handleInput(c);
  }
  sessionProd.finishSession();
  const summaryProd = sessionProd.getSummary();

  assert(summaryProd.typedCharacterCount > 0, "Active production session typedCharacterCount > 0");
  assert(summaryProd.typedCharacters === summaryProd.typedCharacterCount, "typedCharacters matches typedCharacterCount");
  assert(Number.isFinite(summaryProd.typedCharacterCount), "Production typedCharacterCount is finite");
  assert(!Number.isNaN(summaryProd.typedCharacterCount), "Production typedCharacterCount is NOT NaN");
  const renderedProd = `${summaryProd.typedCharacterCount ?? summaryProd.typedCharacters ?? 0} 文字`;
  assert(!renderedProd.includes("NaN"), "Production rendered string does not contain NaN");
  assert(renderedProd.endsWith(" 文字"), "Production rendered string ends with ' 文字'");

  // Case 3: Practice session with 0 input
  const sessionPracticeZero = new GameSession({
    questions: DEFAULT_QUESTIONS,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    mode: GAME_MODES.PRACTICE,
    playerName: "Practice Zero"
  });
  sessionPracticeZero.startReady();
  sessionPracticeZero.tick(3.1);
  sessionPracticeZero.finishSession();
  const summaryPracticeZero = sessionPracticeZero.getSummary();

  assert(summaryPracticeZero.typedCharacterCount === 0, "Practice zero input has typedCharacterCount === 0");
  assert(Number.isFinite(summaryPracticeZero.typedCharacterCount), "Practice zero input is finite");
  assert(!Number.isNaN(summaryPracticeZero.typedCharacterCount), "Practice zero input is NOT NaN");

  // Case 4: No NaN in any summary property
  for (const [key, val] of Object.entries(summaryProd)) {
    if (typeof val === "number") {
      assert(!Number.isNaN(val), `Summary numeric property ${key} is NOT NaN`);
      assert(Number.isFinite(val), `Summary numeric property ${key} is finite`);
    }
  }

  return { passed, failed };
}
