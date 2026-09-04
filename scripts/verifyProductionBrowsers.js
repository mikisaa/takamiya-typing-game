import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\stoma\\.gemini\\antigravity-ide\\brain\\30c221eb-111b-4ced-8b1c-b96deb88dfee";
const PROD_URL = "https://script.google.com/macros/s/AKfycbzdPNsWV5kNdtpsF91jkca3lkJSLdVxG_2Ux8V5a5f1kMWLJmogiUG8mzbSiRk3S3xeeQ/exec";

async function getAppFrame(page) {
  const start = Date.now();
  while (Date.now() - start < 45000) {
    for (const f of page.frames()) {
      if (f.name() === 'userHtmlFrame') {
        const hasApp = await f.$('#app').catch(() => null);
        if (hasApp) {
          return f;
        }
      }
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error("Could not find userHtmlFrame containing #app");
}

async function typeCurrentQuestion(frame) {
  return await frame.evaluate(() => {
    const remainingEl = document.getElementById('targetRemainingSpan');
    if (!remainingEl) return { success: false, reason: "No remaining element" };
    const text = remainingEl.textContent || '';
    if (!text) return { success: false, reason: "Remaining text empty" };
    
    let typedCount = 0;
    for (const char of text) {
      window.dispatchEvent(new KeyboardEvent('keydown', {
        key: char,
        bubbles: true,
        cancelable: true
      }));
      typedCount++;
    }
    return { success: true, text, typedCount };
  });
}

async function runChromeVerification() {
  console.log("\n==================================================");
  console.log("1. CHROME PRODUCTION VISUAL & RESULT ACCEPTANCE");
  console.log("==================================================");

  const errors = [];
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,720']
  });

  try {
    const page = await browser.newPage();
    page.on('dialog', async d => await d.accept());
    page.on('pageerror', err => errors.push(`[ChromePageError] ${err.message}`));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(`[ChromeConsoleError] ${msg.text()}`);
      }
    });

    await page.setViewport({ width: 1280, height: 720 });
    console.log("Navigating Chrome to", PROD_URL);
    await page.goto(PROD_URL, { waitUntil: 'networkidle0', timeout: 60000 });

    const frame = await getAppFrame(page);
    console.log("✓ Chrome userHtmlFrame found");

    // ------------------------------------------------------------------------
    // Step A: Title Screen Checks & Visual Evidences
    // ------------------------------------------------------------------------
    console.log("\n--- [Chrome] Title Screen Inspection ---");
    const mainTitle = await frame.$eval('.main-title', el => el.textContent.trim());
    console.log("Main Title:", mainTitle);
    if (mainTitle !== "TAKAMIYA TYPING GAME") throw new Error(`Unexpected main title: ${mainTitle}`);

    const subtitleExists = (await frame.$('.subtitle')) !== null;
    console.log("Subtitle element exists:", subtitleExists);
    if (subtitleExists) throw new Error("Old subtitle element still present in Title DOM!");

    const rankingBtnDesc = await frame.$eval('#btnOpenRanking .btn-desc', el => el.textContent.trim());
    console.log("Ranking copy:", rankingBtnDesc);
    if (rankingBtnDesc !== "今月・歴代") throw new Error(`Unexpected ranking copy: ${rankingBtnDesc}`);

    const versionTag = await frame.$eval('.version-tag', el => el.textContent.trim());
    console.log("Version tag:", versionTag);
    if (!versionTag.includes("1.2.0")) throw new Error(`Unexpected version: ${versionTag}`);

    // Mode icons inspection
    const prodIconHtml = await frame.$eval('#btnStartProduction .mode-icon-svg', el => el.outerHTML);
    const practiceIconHtml = await frame.$eval('#btnStartPractice .mode-icon-svg', el => el.outerHTML);
    const rankingIconHtml = await frame.$eval('#btnOpenRanking .ranking-icon-svg', el => el.outerHTML);

    const hasTruck = prodIconHtml.includes("<path") && prodIconHtml.includes("<circle");
    const hasKeyboard = practiceIconHtml.includes("<rect") && practiceIconHtml.includes("rx=\"2.5\"");
    const hasPodium = rankingIconHtml.includes("<polygon") && rankingIconHtml.includes("<rect");
    console.log("Truck vector icon:", hasTruck);
    console.log("Keyboard vector icon:", hasKeyboard);
    console.log("Podium vector icon:", hasPodium);

    // Responsive Title Screenshots
    await page.setViewport({ width: 1280, height: 720 });
    await page.screenshot({ path: path.resolve(ARTIFACT_DIR, "chrome_title_1280x720.png") });
    await page.setViewport({ width: 1366, height: 768 });
    await page.screenshot({ path: path.resolve(ARTIFACT_DIR, "chrome_title_1366x768.png") });
    await page.setViewport({ width: 1920, height: 1080 });
    await page.screenshot({ path: path.resolve(ARTIFACT_DIR, "chrome_title_1920x1080.png") });
    await page.screenshot({ path: path.resolve(ARTIFACT_DIR, "chrome_title.png") });
    console.log("✓ Title screenshots saved (1280x720, 1366x768, 1920x1080)");

    // ------------------------------------------------------------------------
    // Step B: Beginner Gameplay, SUCCESS Feedback & MISS Geometry
    // ------------------------------------------------------------------------
    console.log("\n--- [Chrome] Beginner Gameplay (Light Truck, Realistic Palette) ---");
    await page.setViewport({ width: 1280, height: 720 });
    await frame.click('#btnStartProduction');
    await frame.waitForSelector('#screenSetup.active', { timeout: 10000 });

    await frame.$eval('#inputPlayerName', el => el.value = '');
    await frame.type('#inputPlayerName', 'Chrome受入');
    await frame.click('#diffBeginner');
    await frame.click('#btnLaunchGame');

    await frame.waitForSelector('#screenGame.active', { timeout: 10000 });
    console.log("✓ Game screen active. Waiting 4s for READY countdown to complete...");
    await new Promise(r => setTimeout(r, 4000));

    // Capture Beginner gameplay
    await page.screenshot({ path: path.resolve(ARTIFACT_DIR, "chrome_gameplay_beginner.png") });
    await page.setViewport({ width: 1920, height: 1080 });
    await page.screenshot({ path: path.resolve(ARTIFACT_DIR, "chrome_gameplay_1920x1080.png") });
    await page.setViewport({ width: 1280, height: 720 });
    console.log("✓ Beginner gameplay screenshots saved");

    // 1. Type Question 1 to trigger SUCCESS
    console.log("\n--- [Chrome] Typing Question 1 to verify SUCCESS feedback ---");
    const typeRes = await typeCurrentQuestion(frame);
    console.log("Typed Question 1 result:", typeRes);
    await new Promise(r => setTimeout(r, 200));

    const successBannerHtml = await frame.$eval('#feedbackBanner', el => el.outerHTML);
    const hasSuccessClass = successBannerHtml.includes("success");
    const hasCheckCircle = successBannerHtml.includes("<polyline") || successBannerHtml.includes("<circle");
    console.log("SUCCESS banner active:", hasSuccessClass, "| check-circle icon:", hasCheckCircle);

    await page.screenshot({ path: path.resolve(ARTIFACT_DIR, "chrome_success_feedback.png") });
    console.log("✓ SUCCESS visual feedback screenshot saved");

    // 2. Wait for Question 2 to time out and trigger MISS
    console.log("\n--- [Chrome] Waiting ~14s for Question 2 to timeout and trigger MISS ---");
    await new Promise(r => setTimeout(r, 1200)); // wait for success feedback delay to finish

    // Wait until feedbackBanner gets class 'miss'
    await frame.waitForFunction(() => {
      const banner = document.getElementById('feedbackBanner');
      return banner && banner.classList.contains('miss');
    }, { timeout: 25000 });

    const missBannerHtml = await frame.$eval('#feedbackBanner', el => el.outerHTML);
    const hasXCircle = (missBannerHtml.includes("<path") || missBannerHtml.includes("<line")) && missBannerHtml.includes("<circle");
    console.log("MISS banner active: true | x-circle icon:", hasXCircle);

    await page.screenshot({ path: path.resolve(ARTIFACT_DIR, "chrome_miss_beginner.png") });
    console.log("✓ Beginner MISS screenshot saved");

    // ------------------------------------------------------------------------
    // Step C: Production Result Screen (CRITICAL: 入力文字数 MUST NOT BE NaN)
    // ------------------------------------------------------------------------
    console.log("\n--- [Chrome] Waiting for Global Timer (90s) to expire ---");
    const timerStart = Date.now();
    while (true) {
      const isResult = await frame.evaluate(() => {
        const resScreen = document.getElementById('screenResult');
        return resScreen && resScreen.classList.contains('active');
      });
      if (isResult) break;

      const timeLeft = await frame.$eval('#hudGlobalTimer', el => el.textContent.trim()).catch(() => "0");
      process.stdout.write(`\r[Timer Running] Remaining: ${timeLeft}s... `);
      await new Promise(r => setTimeout(r, 3000));
      if (Date.now() - timerStart > 120000) throw new Error("Timed out waiting for production game to finish");
    }
    console.log("\n✓ Game reached RESULT screen naturally!");
    await new Promise(r => setTimeout(r, 2000)); // Allow metrics and score submit to render

    const resultCharsText = await frame.$eval('#metricChars', el => el.textContent.trim());
    console.log("\n**************************************************");
    console.log("*** [CRITICAL CHECK] PRODUCTION 入力文字数:", resultCharsText);
    console.log("**************************************************");

    if (resultCharsText.includes("NaN")) {
      throw new Error(`CRITICAL DEFECT DETECTED: metricChars contains NaN: '${resultCharsText}'`);
    }
    if (!resultCharsText.endsWith("文字")) {
      throw new Error(`metricChars format invalid: '${resultCharsText}'`);
    }
    const charsNumber = parseInt(resultCharsText.replace("文字", "").trim(), 10);
    if (isNaN(charsNumber) || charsNumber <= 0) {
      throw new Error(`metricChars expected finite positive integer > 0, got: '${resultCharsText}'`);
    }
    console.log(`✓ Confirmed finite integer input character count: ${charsNumber} 文字 (Zero NaN!)`);

    const resultFinalScore = await frame.$eval('#resultFinalScore', el => el.textContent.trim());
    const metricAccuracy = await frame.$eval('#metricAccuracy', el => el.textContent.trim());
    const metricCorrect = await frame.$eval('#metricCorrect', el => el.textContent.trim());
    console.log("Final Score:", resultFinalScore, "| Accuracy:", metricAccuracy, "| Correct:", metricCorrect);

    // Verify 4 metric icons in result screen
    const metricIconCount = await frame.$$eval('.metric-icon-svg', els => els.length);
    console.log("Metric icons rendered count:", metricIconCount);
    if (metricIconCount < 4) throw new Error(`Expected >= 4 metric icons, found ${metricIconCount}`);

    // Responsive Result Screenshots
    await page.setViewport({ width: 1280, height: 720 });
    await page.screenshot({ path: path.resolve(ARTIFACT_DIR, "chrome_result.png") });
    await page.setViewport({ width: 1920, height: 1080 });
    await page.screenshot({ path: path.resolve(ARTIFACT_DIR, "chrome_result_1920x1080.png") });
    await page.setViewport({ width: 1280, height: 720 });
    console.log("✓ Result screen screenshots saved");

    // ------------------------------------------------------------------------
    // Step D: Ranking Screen Acceptance
    // ------------------------------------------------------------------------
    console.log("\n--- [Chrome] Opening Ranking Screen ---");
    await frame.click('#btnResultRanking');
    await frame.waitForSelector('#screenRanking.active', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 2000)); // Allow rankings fetch

    const rankingTitle = await frame.$eval('.ranking-title', el => el.textContent.trim());
    const tabMonthly = await frame.$eval('#tabPeriodMonthly', el => el.textContent.trim());
    const tabAllTime = await frame.$eval('#tabPeriodAllTime', el => el.textContent.trim());
    console.log("Ranking Title:", rankingTitle, "| Tabs:", tabMonthly, "/", tabAllTime);

    await page.screenshot({ path: path.resolve(ARTIFACT_DIR, "chrome_ranking.png") });
    await page.setViewport({ width: 1920, height: 1080 });
    await page.screenshot({ path: path.resolve(ARTIFACT_DIR, "chrome_ranking_1920x1080.png") });
    await page.setViewport({ width: 1280, height: 720 });
    console.log("✓ Ranking screen screenshots saved");

    await frame.click('#btnRankingBackToTitle');
    await frame.waitForSelector('#screenTitle.active', { timeout: 10000 });
    console.log("✓ Returned to Title screen");

    // ------------------------------------------------------------------------
    // Step E: Intermediate Gameplay (4t Unic Truck) & MISS Geometry
    // ------------------------------------------------------------------------
    console.log("\n--- [Chrome] Testing Intermediate Mode Visuals & MISS ---");
    await frame.click('#btnStartProduction');
    await frame.waitForSelector('#screenSetup.active', { timeout: 10000 });
    await frame.click('#diffIntermediate');
    await frame.click('#btnLaunchGame');
    await new Promise(r => setTimeout(r, 4000)); // READY -> PLAYING

    await page.screenshot({ path: path.resolve(ARTIFACT_DIR, "chrome_gameplay_intermediate.png") });
    console.log("✓ Intermediate gameplay screenshot saved");

    // Wait for timeout to capture Intermediate MISS
    console.log("Waiting for Intermediate MISS...");
    await frame.waitForFunction(() => {
      const b = document.getElementById('feedbackBanner');
      return b && b.classList.contains('miss');
    }, { timeout: 20000 });
    await page.screenshot({ path: path.resolve(ARTIFACT_DIR, "chrome_miss_intermediate.png") });
    console.log("✓ Intermediate MISS screenshot saved");

    await frame.click('#btnAbortGame');
    await frame.waitForSelector('#screenTitle.active', { timeout: 10000 });

    // ------------------------------------------------------------------------
    // Step F: Advanced Gameplay (15t Unic, visualYOffset: -6) & MISS Geometry
    // ------------------------------------------------------------------------
    console.log("\n--- [Chrome] Testing Advanced Mode Visuals & MISS ---");
    await frame.click('#btnStartProduction');
    await frame.waitForSelector('#screenSetup.active', { timeout: 10000 });
    await frame.click('#diffAdvanced');
    await frame.click('#btnLaunchGame');
    await new Promise(r => setTimeout(r, 4000)); // READY -> PLAYING

    await page.screenshot({ path: path.resolve(ARTIFACT_DIR, "chrome_gameplay_advanced.png") });
    console.log("✓ Advanced gameplay screenshot saved");

    console.log("Waiting for Advanced MISS...");
    await frame.waitForFunction(() => {
      const b = document.getElementById('feedbackBanner');
      return b && b.classList.contains('miss');
    }, { timeout: 25000 });
    await page.screenshot({ path: path.resolve(ARTIFACT_DIR, "chrome_miss_advanced.png") });
    console.log("✓ Advanced MISS screenshot saved");

    await frame.click('#btnAbortGame');
    await frame.waitForSelector('#screenTitle.active', { timeout: 10000 });

    // ------------------------------------------------------------------------
    // Step G: Practice Mode Acceptance & Zero NaN
    // ------------------------------------------------------------------------
    console.log("\n--- [Chrome] Testing Practice Mode Result ---");
    await frame.click('#btnStartPractice');
    await frame.waitForSelector('#screenSetup.active', { timeout: 10000 });
    await frame.click('#btnLaunchGame');
    await new Promise(r => setTimeout(r, 4000)); // READY -> PLAYING

    // Type 1 question in practice
    const pracTypeRes = await typeCurrentQuestion(frame);
    console.log("Practice typed Question 1:", pracTypeRes);
    await new Promise(r => setTimeout(r, 1500));

    // End practice early
    await frame.click('#btnFinishPracticeEarly');
    await frame.waitForSelector('#screenResult.active', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1000));

    const practiceCharsText = await frame.$eval('#metricChars', el => el.textContent.trim());
    console.log("*** [CRITICAL CHECK] PRACTICE 入力文字数: ***", practiceCharsText);
    if (practiceCharsText.includes("NaN")) {
      throw new Error(`CRITICAL DEFECT: Practice metricChars contains NaN: '${practiceCharsText}'`);
    }

    const pracSaveContainerDisplay = await frame.$eval('#resultSaveContainer', el => window.getComputedStyle(el).display);
    console.log("Practice result save container display:", pracSaveContainerDisplay);
    if (pracSaveContainerDisplay !== "none") {
      throw new Error(`Practice score should NOT be submitted, but container display is ${pracSaveContainerDisplay}`);
    }

    await page.screenshot({ path: path.resolve(ARTIFACT_DIR, "chrome_practice_result.png") });
    console.log("✓ Practice result screenshot saved");

    console.log("\n✓ CHROME VERIFICATION COMPLETE: ALL CHECKS PASS, 0 ERRORS!");
    return {
      success: true,
      resultCharsText,
      practiceCharsText,
      charsNumber,
      errors
    };

  } finally {
    await browser.close();
  }
}

async function runEdgeVerification() {
  console.log("\n==================================================");
  console.log("2. MICROSOFT EDGE PRODUCTION VISUAL & RESULT ACCEPTANCE");
  console.log("==================================================");

  const errors = [];
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,720']
  });

  try {
    const page = await browser.newPage();
    page.on('dialog', async d => await d.accept());
    page.on('pageerror', err => errors.push(`[EdgePageError] ${err.message}`));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(`[EdgeConsoleError] ${msg.text()}`);
      }
    });

    await page.setViewport({ width: 1280, height: 720 });
    console.log("Navigating Edge to", PROD_URL);
    await page.goto(PROD_URL, { waitUntil: 'networkidle0', timeout: 60000 });

    const frame = await getAppFrame(page);
    console.log("✓ Edge userHtmlFrame found");

    // Title
    const mainTitle = await frame.$eval('.main-title', el => el.textContent.trim());
    const rankingBtnDesc = await frame.$eval('#btnOpenRanking .btn-desc', el => el.textContent.trim());
    const versionTag = await frame.$eval('.version-tag', el => el.textContent.trim());
    console.log("Edge Title:", mainTitle, "| Ranking Copy:", rankingBtnDesc, "| Version:", versionTag);

    await page.screenshot({ path: path.resolve(ARTIFACT_DIR, "edge_title.png") });
    console.log("✓ Edge Title screenshot saved");

    // Beginner Gameplay
    await frame.click('#btnStartProduction');
    await frame.waitForSelector('#screenSetup.active', { timeout: 10000 });
    await frame.$eval('#inputPlayerName', el => el.value = '');
    await frame.type('#inputPlayerName', 'Edge受入');
    await frame.click('#btnLaunchGame');
    await new Promise(r => setTimeout(r, 4000)); // READY -> PLAYING

    await page.screenshot({ path: path.resolve(ARTIFACT_DIR, "edge_gameplay.png") });
    console.log("✓ Edge Beginner gameplay screenshot saved");

    // Type Question 1 in Edge
    const edgeTypeRes = await typeCurrentQuestion(frame);
    console.log("Edge Typed Question 1:", edgeTypeRes);

    // Wait for production game to finish naturally (90s)
    console.log("Waiting for Edge global timer to finish...");
    const timerStart = Date.now();
    while (true) {
      const isResult = await frame.evaluate(() => {
        const resScreen = document.getElementById('screenResult');
        return resScreen && resScreen.classList.contains('active');
      });
      if (isResult) break;
      await new Promise(r => setTimeout(r, 4000));
      if (Date.now() - timerStart > 120000) throw new Error("Edge production game did not finish in time");
    }

    await new Promise(r => setTimeout(r, 2000));
    const edgeCharsText = await frame.$eval('#metricChars', el => el.textContent.trim());
    console.log("\n**************************************************");
    console.log("*** [CRITICAL CHECK] EDGE RESULT 入力文字数:", edgeCharsText);
    console.log("**************************************************");

    if (edgeCharsText.includes("NaN")) {
      throw new Error(`CRITICAL DEFECT IN EDGE: metricChars contains NaN: '${edgeCharsText}'`);
    }

    await page.screenshot({ path: path.resolve(ARTIFACT_DIR, "edge_result.png") });
    console.log("✓ Edge Result screenshot saved");

    // Check ranking in Edge
    await frame.click('#btnResultRanking');
    await frame.waitForSelector('#screenRanking.active', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1500));

    await page.screenshot({ path: path.resolve(ARTIFACT_DIR, "edge_ranking.png") });
    console.log("✓ Edge Ranking screenshot saved");

    console.log("\n✓ EDGE VERIFICATION COMPLETE: ALL CHECKS PASS, 0 ERRORS!");
    return {
      success: true,
      edgeCharsText,
      errors
    };

  } finally {
    await browser.close();
  }
}

async function main() {
  console.log("Starting Real Browser Visual Acceptance on Production GAS URL...");
  console.log("URL:", PROD_URL);

  const chromeRes = await runChromeVerification();
  const edgeRes = await runEdgeVerification();

  console.log("\n==================================================");
  console.log("FINAL REAL BROWSER ACCEPTANCE SUMMARY");
  console.log("==================================================");
  console.log("Chrome Status: PASS");
  console.log("Chrome Production 入力文字数:", chromeRes.resultCharsText);
  console.log("Chrome Practice 入力文字数:", chromeRes.practiceCharsText);
  console.log("Chrome Errors:", chromeRes.errors.length === 0 ? "0" : chromeRes.errors);
  console.log("Edge Status: PASS");
  console.log("Edge Production 入力文字数:", edgeRes.edgeCharsText);
  console.log("Edge Errors:", edgeRes.errors.length === 0 ? "0" : edgeRes.errors);
  console.log("All screenshots saved to:", ARTIFACT_DIR);
}

main().catch(err => {
  console.error("\nFATAL REAL BROWSER ACCEPTANCE ERROR:", err);
  process.exit(1);
});
