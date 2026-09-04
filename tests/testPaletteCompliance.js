import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { AUTHORITATIVE_PALETTE, UI_PALETTE, PALETTE } from "../src/visual/pixel/palette.js";
import { SCENE_PALETTE } from "../src/visual/pixel/scenePalette.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function runPaletteComplianceTests() {
  console.log("\n=== Testing UI Palette Compliance & Realistic Gameplay Scene Contract ===");
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

  // 1. Authoritative UI Palette Constants (5 TTG Botanical Tokens)
  assert(AUTHORITATIVE_PALETTE.WHITE === "#FFFFFF", "AUTHORITATIVE_PALETTE.WHITE is #FFFFFF");
  assert(AUTHORITATIVE_PALETTE.PALE_1 === "#F5FBDA", "AUTHORITATIVE_PALETTE.PALE_1 is #F5FBDA");
  assert(AUTHORITATIVE_PALETTE.PALE_2 === "#D9EFBD", "AUTHORITATIVE_PALETTE.PALE_2 is #D9EFBD");
  assert(AUTHORITATIVE_PALETTE.ACCENT === "#B9D175", "AUTHORITATIVE_PALETTE.ACCENT is #B9D175");
  assert(AUTHORITATIVE_PALETTE.DARK === "#450C3F", "AUTHORITATIVE_PALETTE.DARK is #450C3F");

  // 2. UI_PALETTE matches authoritative 5 tokens exactly
  const allowedUiHexes = new Set(["#FFFFFF", "#F5FBDA", "#D9EFBD", "#B9D175", "#450C3F"]);
  let uiCompliant = true;
  for (const [key, val] of Object.entries(UI_PALETTE)) {
    if (typeof val === "string" && val.startsWith("#")) {
      if (!allowedUiHexes.has(val.toUpperCase())) {
        uiCompliant = false;
        console.error(`  Non-compliant UI token: ${key} = ${val}`);
      }
    }
  }
  assert(uiCompliant, "All UI_PALETTE tokens strictly derive from the 5 authoritative botanical colors");

  // 3. CSS Variables Compliance in index.css
  const cssPath = path.resolve(__dirname, "../src/index.css");
  const cssContent = fs.readFileSync(cssPath, "utf-8");
  assert(cssContent.includes("--white: #FFFFFF;"), "index.css defines --white");
  assert(cssContent.includes("--pale-1: #F5FBDA;"), "index.css defines --pale-1");
  assert(cssContent.includes("--pale-2: #D9EFBD;"), "index.css defines --pale-2");
  assert(cssContent.includes("--accent: #B9D175;"), "index.css defines --accent");
  assert(cssContent.includes("--dark: #450C3F;"), "index.css defines --dark");
  assert(cssContent.includes("background-color: var(--bg);"), "Body background uses var(--bg) (white)");

  // 4. Realistic Gameplay Scene Contract Compliance
  console.log("\n--- Realistic Gameplay Scene Palette Checks ---");
  assert(SCENE_PALETTE.FORK_BODY_MAIN === "#F59E0B", "Forklift uses industrial yellow body (#F59E0B)");
  assert(SCENE_PALETTE.FORK_MAST === "#334155", "Forklift mast uses dark steel charcoal (#334155)");
  assert(SCENE_PALETTE.STEEL_MAIN === "#94A3B8", "Scaffold material uses metallic steel gray (#94A3B8)");
  assert(SCENE_PALETTE.STEEL_HIGHLIGHT === "#F8FAFC", "Scaffold material uses silver highlight (#F8FAFC)");
  assert(SCENE_PALETTE.TIRE_BLACK === "#0F172A", "Tires use dark rubber near-black (#0F172A)");
  assert(SCENE_PALETTE.TRUCK_CAB_WHITE === "#F8FAFC", "Truck cabs use realistic clean white (#F8FAFC)");
  assert(SCENE_PALETTE.CRANE_RED === "#DC2626", "Truck unic crane uses safety red (#DC2626)");
  assert(SCENE_PALETTE.SKY_BLUE === "#BAE6FD", "Atmosphere sky uses sky blue (#BAE6FD)");
  assert(SCENE_PALETTE.VEGETATION_GREEN === "#16A34A", "Vegetation uses natural green (#16A34A)");
  assert(SCENE_PALETTE.TOWER_RED === "#DC2626", "Tokyo Tower uses international orange/red (#DC2626)");
  assert(SCENE_PALETTE.TOWER_WHITE === "#FFFFFF", "Tokyo Tower uses clean white (#FFFFFF)");
  assert(SCENE_PALETTE.SKYTREE_STEEL === "#94A3B8", "Skytree uses steel gray (#94A3B8)");

  // Rainbow realistic multi-hue
  const rainbow = SCENE_PALETTE.RAINBOW;
  assert(Boolean(rainbow && rainbow.RED && rainbow.ORANGE && rainbow.YELLOW && rainbow.GREEN && rainbow.CYAN && rainbow.BLUE && rainbow.VIOLET), "Rainbow defines all 7 realistic spectral hues");

  // 5. Mode Copy Exact Strings in index.html
  const htmlPath = path.resolve(__dirname, "../src/index.html");
  const htmlContent = fs.readFileSync(htmlPath, "utf-8");
  assert(htmlContent.includes("時間制限90秒"), "Production mode description is exactly '時間制限90秒'");
  assert(htmlContent.includes("時間無制限"), "Practice mode description is exactly '時間無制限'");
  assert(htmlContent.includes("今月・歴代"), "Ranking button description is exactly '今月・歴代'");
  assert(!htmlContent.includes("今月・歴代の最高記録"), "Old ranking description '今月・歴代の最高記録' is removed");
  assert(!htmlContent.includes("仮設足場資材の積込作業をテーマにした爽快タイピングゲーム"), "Old subtitle is completely removed from index.html");

  // 6. System Emoji Audit (No OS Emoji in UI Templates or Main Code)
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
  const htmlHasEmoji = emojiRegex.test(htmlContent);
  assert(!htmlHasEmoji, "index.html is completely free of OS emojis");

  const mainPath = path.resolve(__dirname, "../src/main.js");
  const mainContent = fs.readFileSync(mainPath, "utf-8");
  const mainHasEmoji = emojiRegex.test(mainContent);
  assert(!mainHasEmoji, "main.js is completely free of OS emojis");

  // 7. Required Result Screen Metric Elements
  assert(htmlContent.includes("id=\"resultFinalScore\""), "Result has SCORE display element");
  assert(htmlContent.includes("id=\"metricCorrect\""), "Result has 正解数 element");
  assert(htmlContent.includes("id=\"metricAccuracy\""), "Result has 正答率 (Accuracy) element");
  assert(htmlContent.includes("id=\"metricMistakes\""), "Result has Typing Mistake element");
  assert(htmlContent.includes("id=\"metricMiss\""), "Result has 時間切れ (MISS) element");
  assert(htmlContent.includes("id=\"metricChars\""), "Result has 入力文字数 element");
  assert(htmlContent.includes("id=\"metricMaxCombo\""), "Result has 最大COMBO element");
  assert(htmlContent.includes("id=\"metricWpm\""), "Result has WPM element");
  assert(htmlContent.includes("id=\"metricKpm\""), "Result has KPM element");
  assert(htmlContent.includes("id=\"metricBgStage\""), "Result has 到達背景ステージ element");
  assert(htmlContent.includes("id=\"metricPlayTime\""), "Result has プレイ時間 element");

  return { passed, failed };
}
