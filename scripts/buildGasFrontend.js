import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as esbuild from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

/**
 * Deterministic Build Script for TakamiyaTypingGame GAS Frontend (v1.1.0)
 *
 * Compiles:
 * 1. src/main.js (and all 34 native ES modules + 180 questions) -> backend/gas/ClientBundle.html
 * 2. src/index.css (5-color palette, typography, visual animations) -> backend/gas/Stylesheet.html
 * 3. src/index.html -> backend/gas/Index.html (incorporating HtmlService includes)
 */

export function buildGasFrontend() {
  console.log("==================================================");
  console.log("BUILDING TAKAMIYA TYPING GAME GAS FRONTEND BUNDLE");
  console.log("==================================================");

  const srcDir = path.resolve(projectRoot, "src");
  const gasDir = path.resolve(projectRoot, "backend/gas");

  if (!fs.existsSync(gasDir)) {
    fs.mkdirSync(gasDir, { recursive: true });
  }

  // 1. Bundle JavaScript with esbuild (IIFE format for browser execution)
  console.log("\n[1/3] Bundling JavaScript client modules via esbuild...");
  const entryPoint = path.resolve(srcDir, "main.js");
  const buildResult = esbuild.buildSync({
    entryPoints: [entryPoint],
    bundle: true,
    format: "iife",
    target: "es2020",
    minify: false, // Kept unminified for auditability & debuggability
    write: false
  });

  if (buildResult.errors && buildResult.errors.length > 0) {
    throw new Error(`esbuild compilation failed: ${JSON.stringify(buildResult.errors)}`);
  }

  const bundledJs = buildResult.outputFiles[0].text;

  // Validation: Check for unbundled statements or missing questions
  if (bundledJs.includes("import ") && !bundledJs.includes("// import ")) {
    // Note: check for top-level unbundled imports
    const lines = bundledJs.split("\n");
    const unbundledImport = lines.find((l) => l.trim().startsWith("import "));
    if (unbundledImport) {
      throw new Error(`Unresolved import statement detected in bundle: ${unbundledImport}`);
    }
  }

  if (!bundledJs.includes("1.1.0")) {
    throw new Error("Bundle is missing version 1.1.0 marker");
  }

  const clientBundleHtml = `<script>\n/* TAKAMIYA TYPING GAME v1.1.0 — Deterministic Client Bundle */\n${bundledJs}\n</script>\n`;
  const clientBundlePath = path.resolve(gasDir, "ClientBundle.html");
  fs.writeFileSync(clientBundlePath, clientBundleHtml, "utf-8");
  console.log(`  -> Generated ClientBundle.html (${(clientBundleHtml.length / 1024).toFixed(1)} KB)`);

  // 2. Bundle Stylesheet
  console.log("\n[2/3] Inlining CSS stylesheet...");
  const cssPath = path.resolve(srcDir, "index.css");
  const rawCss = fs.readFileSync(cssPath, "utf-8");
  const stylesheetHtml = `<style>\n/* TAKAMIYA TYPING GAME v1.1.0 — Unified 5-Color Palette Stylesheet */\n${rawCss}\n</style>\n`;
  const stylesheetPath = path.resolve(gasDir, "Stylesheet.html");
  fs.writeFileSync(stylesheetPath, stylesheetHtml, "utf-8");
  console.log(`  -> Generated Stylesheet.html (${(stylesheetHtml.length / 1024).toFixed(1)} KB)`);

  // 3. Generate Index.html for GAS HtmlService
  console.log("\n[3/3] Generating HtmlService Index.html template...");
  const htmlPath = path.resolve(srcDir, "index.html");
  const rawHtml = fs.readFileSync(htmlPath, "utf-8");

  // Extract body content (excluding <script type="module">)
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) {
    throw new Error("Failed to parse <body> tag from src/index.html");
  }

  let bodyContent = bodyMatch[1].trim();
  // Remove the native module script tag since ClientBundle is included via template
  bodyContent = bodyContent.replace(/<script\s+type="module"\s+src="main\.js"><\/script>/gi, "").trim();

  const indexGasHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
  <base target="_top">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TAKAMIYA TYPING GAME — 仮設足場・積込タイピングゲーム</title>
  <?!= HtmlService.createHtmlOutputFromFile('Stylesheet').getContent(); ?>
</head>
<body>
${bodyContent}
<?!= HtmlService.createHtmlOutputFromFile('ClientBundle').getContent(); ?>
</body>
</html>
`;

  const indexPath = path.resolve(gasDir, "Index.html");
  fs.writeFileSync(indexPath, indexGasHtml, "utf-8");
  console.log(`  -> Generated Index.html (${(indexGasHtml.length / 1024).toFixed(1)} KB)`);

  console.log("\n==================================================");
  console.log("GAS FRONTEND BUNDLE GENERATED SUCCESSFULLY!");
  console.log("==================================================");

  return {
    clientBundlePath,
    stylesheetPath,
    indexPath,
    clientBundleSize: clientBundleHtml.length,
    stylesheetSize: stylesheetHtml.length,
    indexSize: indexGasHtml.length
  };
}

// Execute directly when run as CLI script
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    buildGasFrontend();
  } catch (err) {
    console.error("FATAL BUILD ERROR:", err);
    process.exit(1);
  }
}
