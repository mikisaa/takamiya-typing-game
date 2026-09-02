import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { AUTHORITATIVE_PALETTE, PALETTE } from "../src/visual/pixel/palette.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function runPaletteComplianceTests() {
  console.log("\n=== Testing Unified 5-Color Palette & UI Compliance ===");
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

  // 1. Authoritative Palette Constants
  assert(AUTHORITATIVE_PALETTE.WHITE === "#FFFFFF", "AUTHORITATIVE_PALETTE.WHITE is #FFFFFF");
  assert(AUTHORITATIVE_PALETTE.PALE_1 === "#F5FBDA", "AUTHORITATIVE_PALETTE.PALE_1 is #F5FBDA");
  assert(AUTHORITATIVE_PALETTE.PALE_2 === "#D9EFBD", "AUTHORITATIVE_PALETTE.PALE_2 is #D9EFBD");
  assert(AUTHORITATIVE_PALETTE.ACCENT === "#B9D175", "AUTHORITATIVE_PALETTE.ACCENT is #B9D175");
  assert(AUTHORITATIVE_PALETTE.DARK === "#450C3F", "AUTHORITATIVE_PALETTE.DARK is #450C3F");

  // 2. PALETTE values are strictly derived from the 5 authorized tokens (or DARK rgba opacity variants)
  const allowedHexes = new Set(["#FFFFFF", "#F5FBDA", "#D9EFBD", "#B9D175", "#450C3F"]);
  let allTokensCompliant = true;
  for (const [key, val] of Object.entries(PALETTE)) {
    if (typeof val === "string" && val.startsWith("#")) {
      if (!allowedHexes.has(val.toUpperCase())) {
        allTokensCompliant = false;
        console.error(`  Non-compliant palette token: ${key} = ${val}`);
      }
    } else if (typeof val === "string" && val.startsWith("rgba")) {
      // Must be an opacity variant of DARK (69, 12, 63)
      if (!val.includes("69, 12, 63")) {
        allTokensCompliant = false;
        console.error(`  Non-compliant rgba token: ${key} = ${val}`);
      }
    }
  }
  assert(allTokensCompliant, "All PALETTE tokens strictly derive from the 5 authoritative colors");

  // 3. No legacy dark-theme major colors in PALETTE
  const legacyColors = ["#00E5FF", "#10B981", "#EF4444", "#F59E0B", "#3B82F6", "#090D16", "#131B2E"];
  let hasLegacy = false;
  for (const val of Object.values(PALETTE)) {
    if (typeof val === "string" && legacyColors.includes(val.toUpperCase())) {
      hasLegacy = true;
    }
  }
  assert(!hasLegacy, "Zero legacy dark-theme colors in PALETTE");

  // 4. CSS Variables Compliance in index.css
  const cssPath = path.resolve(__dirname, "../src/index.css");
  const cssContent = fs.readFileSync(cssPath, "utf-8");
  assert(cssContent.includes("--white: #FFFFFF;"), "index.css defines --white");
  assert(cssContent.includes("--pale-1: #F5FBDA;"), "index.css defines --pale-1");
  assert(cssContent.includes("--pale-2: #D9EFBD;"), "index.css defines --pale-2");
  assert(cssContent.includes("--accent: #B9D175;"), "index.css defines --accent");
  assert(cssContent.includes("--dark: #450C3F;"), "index.css defines --dark");
  assert(cssContent.includes("background-color: var(--bg);"), "Body background uses var(--bg) (white)");

  // 5. Mode Copy Exact Strings in index.html
  const htmlPath = path.resolve(__dirname, "../src/index.html");
  const htmlContent = fs.readFileSync(htmlPath, "utf-8");
  assert(htmlContent.includes("時間制限90秒"), "Production mode description is exactly '時間制限90秒'");
  assert(htmlContent.includes("時間無制限"), "Practice mode description is exactly '時間無制限'");

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
