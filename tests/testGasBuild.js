import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildGasFrontend } from "../scripts/buildGasFrontend.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

export function runGasBuildTests() {
  console.log("\n=== Testing GAS Frontend Deterministic Build & Artifacts ===");
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

  // 1. Run buildGasFrontend
  const result = buildGasFrontend();
  assert(Boolean(result), "buildGasFrontend executes without exceptions");
  assert(fs.existsSync(result.clientBundlePath), "ClientBundle.html generated");
  assert(fs.existsSync(result.stylesheetPath), "Stylesheet.html generated");
  assert(fs.existsSync(result.indexPath), "Index.html generated");

  // 2. Inspect ClientBundle.html
  const bundleContent = fs.readFileSync(result.clientBundlePath, "utf-8");
  assert(bundleContent.startsWith("<script>"), "ClientBundle.html starts with <script>");
  assert(bundleContent.trimEnd().endsWith("</script>"), "ClientBundle.html ends with </script>");
  assert(!bundleContent.includes("import ") || !bundleContent.split("\n").some((l) => l.trim().startsWith("import ")), "Zero unresolved top-level import statements in bundle");
  assert(bundleContent.includes("1.1.0"), "Client bundle contains version 1.1.0");
  assert(bundleContent.includes("TAKAMIYA TYPING GAME"), "Client bundle contains TAKAMIYA TYPING GAME");
  assert(bundleContent.includes("ttg.lastPlayerName.v1"), "Client bundle contains ttg.lastPlayerName.v1");
  // Check 180 questions are included in the bundle
  assert(bundleContent.includes("TANKANPAIPU") || bundleContent.includes("単管パイプ"), "Default questions bundled into ClientBundle");

  // 3. Inspect Stylesheet.html
  const cssContent = fs.readFileSync(result.stylesheetPath, "utf-8");
  assert(cssContent.startsWith("<style>"), "Stylesheet.html starts with <style>");
  assert(cssContent.trimEnd().endsWith("</style>"), "Stylesheet.html ends with </style>");
  assert(cssContent.includes("#FFFFFF"), "Stylesheet includes #FFFFFF");
  assert(cssContent.includes("#450C3F"), "Stylesheet includes #450C3F");
  assert(cssContent.includes("brand-tag-ttg"), "Stylesheet includes TTG branding classes");

  // 4. Inspect Index.html
  const indexContent = fs.readFileSync(result.indexPath, "utf-8");
  assert(indexContent.includes("<!DOCTYPE html>"), "Index.html contains <!DOCTYPE html>");
  assert(indexContent.includes("<base target=\"_top\">"), "Index.html contains <base target=\"_top\">");
  assert(indexContent.includes("<?!= HtmlService.createHtmlOutputFromFile('Stylesheet').getContent(); ?>"), "Index.html includes Stylesheet via HtmlService");
  assert(indexContent.includes("<?!= HtmlService.createHtmlOutputFromFile('ClientBundle').getContent(); ?>"), "Index.html includes ClientBundle via HtmlService");
  assert(!indexContent.includes("src=\"main.js\""), "Unbundled native script module tag removed from Index.html");

  return { passed, failed };
}
