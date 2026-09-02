import { DEFAULT_QUESTIONS } from "./data/defaultQuestions.js";
import { GAME_STATES, GAME_MODES, DIFFICULTY_LEVELS } from "./engine/gameState.js";
import { GameSession } from "./engine/gameSession.js";
import { GAME_CONFIG } from "./config/gameConfig.js";

// DOM Elements Selection
const screens = {
  title: document.getElementById("screenTitle"),
  setup: document.getElementById("screenSetup"),
  game: document.getElementById("screenGame"),
  result: document.getElementById("screenResult")
};

// Title Elements
const btnStartProduction = document.getElementById("btnStartProduction");
const btnStartPractice = document.getElementById("btnStartPractice");

// Setup Elements
const setupModeTitle = document.getElementById("setupModeTitle");
const setupModeDesc = document.getElementById("setupModeDesc");
const btnLaunchGame = document.getElementById("btnLaunchGame");
const btnBackToTitle = document.getElementById("btnBackToTitle");

// Game HUD Elements
const readyOverlay = document.getElementById("readyOverlay");
const readyCountText = document.getElementById("readyCountText");
const hudModeBadge = document.getElementById("hudModeBadge");
const hudDiffBadge = document.getElementById("hudDiffBadge");
const hudBgStageBadge = document.getElementById("hudBgStageBadge");
const hudGlobalTimer = document.getElementById("hudGlobalTimer");
const hudScoreVal = document.getElementById("hudScoreVal");
const hudComboVal = document.getElementById("hudComboVal");

// Track Elements
const trackStatusMsg = document.getElementById("trackStatusMsg");
const trackForkliftTimer = document.getElementById("trackForkliftTimer");
const forkliftElement = document.getElementById("forkliftElement");
const materialNameTag = document.getElementById("materialNameTag");
const truckVehicleTag = document.getElementById("truckVehicleTag");

// Prompt & Target Elements
const feedbackBanner = document.getElementById("feedbackBanner");
const promptDisplayText = document.getElementById("promptDisplayText");
const promptReadingText = document.getElementById("promptReadingText");
const targetDisplayBox = document.getElementById("targetDisplayBox");
const targetTypedSpan = document.getElementById("targetTypedSpan");
const targetRemainingSpan = document.getElementById("targetRemainingSpan");

// Game Action Buttons
const btnAbortGame = document.getElementById("btnAbortGame");
const btnFinishPracticeEarly = document.getElementById("btnFinishPracticeEarly");

// Result Elements
const resultHeaderBadge = document.getElementById("resultHeaderBadge");
const resultMainTitle = document.getElementById("resultMainTitle");
const resultScoreBanner = document.getElementById("resultScoreBanner");
const resultFinalScore = document.getElementById("resultFinalScore");
const metricCorrect = document.getElementById("metricCorrect");
const metricMiss = document.getElementById("metricMiss");
const metricMistakes = document.getElementById("metricMistakes");
const metricChars = document.getElementById("metricChars");
const metricAccuracy = document.getElementById("metricAccuracy");
const metricMaxCombo = document.getElementById("metricMaxCombo");
const metricSpeed = document.getElementById("metricSpeed");
const metricBgStage = document.getElementById("metricBgStage");
const btnResultReplay = document.getElementById("btnResultReplay");
const btnResultTitle = document.getElementById("btnResultTitle");

// Active Game Variables
let activeSession = null;
let animationFrameId = null;
let lastTimestamp = 0;
let selectedMode = GAME_MODES.PRODUCTION;
let selectedDifficulty = DIFFICULTY_LEVELS.BEGINNER;

// Helper: Screen Switching
function showScreen(screenKey) {
  Object.values(screens).forEach((el) => el.classList.remove("active"));
  if (screens[screenKey]) {
    screens[screenKey].classList.add("active");
  }
}

// 1. Title Screen Actions
btnStartProduction.addEventListener("click", () => {
  selectedMode = GAME_MODES.PRODUCTION;
  setupModeTitle.textContent = "【本番モード】難易度を選択してください";
  setupModeDesc.textContent = "90秒の制限時間内にできるだけ多くの足場資材をトラックへ積み込んでください。";
  showScreen("setup");
});

btnStartPractice.addEventListener("click", () => {
  selectedMode = GAME_MODES.PRACTICE;
  setupModeTitle.textContent = "【練習モード】難易度を選択してください";
  setupModeDesc.textContent = "走行時間1.5倍の余裕時間でタイピングの練習を行えます（ランキング送信なし）。";
  showScreen("setup");
});

// 2. Setup Screen Actions
btnBackToTitle.addEventListener("click", () => {
  showScreen("title");
});

btnLaunchGame.addEventListener("click", () => {
  const checkedDiff = document.querySelector('input[name="difficultySelect"]:checked')?.value || "BEGINNER";
  selectedDifficulty = checkedDiff;
  startNewGame();
});

// 3. Start New Game
function startNewGame() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  activeSession = new GameSession({
    mode: selectedMode,
    difficulty: selectedDifficulty,
    questions: DEFAULT_QUESTIONS,
    config: GAME_CONFIG
  });

  // Configure UI for selected mode
  hudModeBadge.textContent = selectedMode === GAME_MODES.PRODUCTION ? "本番" : "練習";
  hudModeBadge.className = `hud-badge ${selectedMode === GAME_MODES.PRODUCTION ? "mode-badge" : "stage-badge"}`;
  hudDiffBadge.textContent = selectedDifficulty === "BEGINNER" ? "初級" : selectedDifficulty === "INTERMEDIATE" ? "中級" : "上級";

  const diffConfig = GAME_CONFIG.difficulties[selectedDifficulty.toLowerCase()];
  truckVehicleTag.textContent = diffConfig?.vehicleName || "トラック";

  if (selectedMode === GAME_MODES.PRACTICE) {
    btnFinishPracticeEarly.style.display = "inline-flex";
    hudGlobalTimer.textContent = "PRACTICE";
  } else {
    btnFinishPracticeEarly.style.display = "none";
    hudGlobalTimer.textContent = activeSession.globalTimeRemaining.toFixed(1);
  }

  showScreen("game");
  activeSession.startReady();
  lastTimestamp = performance.now();
  animationFrameId = requestAnimationFrame(gameLoop);
}

// 4. Main Game Loop (60fps rAF)
function gameLoop(timestamp) {
  if (!activeSession) return;

  const deltaSeconds = Math.min(0.1, (timestamp - lastTimestamp) / 1000);
  lastTimestamp = timestamp;

  // Tick Session State & Timers
  activeSession.tick(deltaSeconds);

  // Render UI
  renderGameUI();

  // Check if session finished
  if (activeSession.state === GAME_STATES.RESULT || activeSession.state === GAME_STATES.PRACTICE_RESULT) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    renderResultScreen();
    showScreen("result");
    return;
  }

  animationFrameId = requestAnimationFrame(gameLoop);
}

// 5. Render Game UI
function renderGameUI() {
  if (!activeSession) return;

  // 1. Ready Overlay
  if (activeSession.state === GAME_STATES.READY) {
    readyOverlay.classList.add("active");
    const countVal = Math.ceil(activeSession.readyCountdown);
    readyCountText.textContent = countVal > 0 ? countVal : "START!";
    return;
  } else {
    readyOverlay.classList.remove("active");
  }

  // 2. HUD Metrics
  if (activeSession.mode === GAME_MODES.PRODUCTION) {
    hudGlobalTimer.textContent = activeSession.globalTimeRemaining.toFixed(1);
    if (activeSession.globalTimeRemaining <= 10) {
      hudGlobalTimer.style.color = "var(--red)";
    } else {
      hudGlobalTimer.style.color = "var(--cyan)";
    }
  }

  hudScoreVal.textContent = activeSession.getCurrentScore().toLocaleString();
  hudComboVal.textContent = activeSession.currentCombo;

  // Background Stage
  const summary = activeSession.getSummary();
  hudBgStageBadge.textContent = `🏛️ ${summary.backgroundStage.displayName}`;

  // 3. Track Visual (Forklift position)
  const progress = activeSession.getForkliftProgress();
  // Move forklift from 2% to 76% along the road
  const roadLeftPercent = 2 + progress * 74;
  forkliftElement.style.left = `${roadLeftPercent}%`;

  trackForkliftTimer.textContent = `残り ${Math.max(0, activeSession.perQuestionTimeRemaining).toFixed(1)}s`;

  if (activeSession.state === GAME_STATES.SUCCESS_FEEDBACK) {
    trackStatusMsg.textContent = "✅ 積込完了 (SUCCESS)";
    trackStatusMsg.style.color = "var(--green)";
    feedbackBanner.className = "feedback-banner success";
    feedbackBanner.textContent = "🎉 SUCCESS!";
  } else if (activeSession.state === GAME_STATES.MISS_FEEDBACK) {
    trackStatusMsg.textContent = "⚠️ 接触・資材落下 (MISS)";
    trackStatusMsg.style.color = "var(--red)";
    feedbackBanner.className = "feedback-banner miss";
    feedbackBanner.textContent = "💥 MISS!";
  } else {
    trackStatusMsg.textContent = "積込走行中...";
    trackStatusMsg.style.color = "var(--muted)";
    feedbackBanner.className = "feedback-banner";
    feedbackBanner.textContent = "";
  }

  // 4. Prompt & Target Display
  const currentQ = activeSession.currentQuestion;
  if (currentQ) {
    promptDisplayText.textContent = currentQ.displayText;
    promptReadingText.textContent = currentQ.reading;
    materialNameTag.textContent = currentQ.category || "足場材";
  }

  const typingState = activeSession.currentTypingEngine?.getState();
  if (typingState) {
    targetTypedSpan.textContent = typingState.typedSoFar;
    targetRemainingSpan.textContent = typingState.remainingTarget;
  }
}

// 6. Result Screen Rendering
function renderResultScreen() {
  if (!activeSession) return;

  const summary = activeSession.getSummary();

  if (summary.mode === GAME_MODES.PRACTICE) {
    resultHeaderBadge.textContent = "PRACTICE COMPLETED";
    resultMainTitle.textContent = "練習セッション終了";
    resultScoreBanner.style.display = "none";
  } else {
    resultHeaderBadge.textContent = "GAME FINISHED";
    resultMainTitle.textContent = "本番リザルト";
    resultScoreBanner.style.display = "flex";
    resultFinalScore.textContent = summary.score.toLocaleString();
  }

  metricCorrect.textContent = `${summary.correctCount} 問`;
  metricMiss.textContent = `${summary.missCount} 回`;
  metricMistakes.textContent = `${summary.typingMistakeCount} 回`;
  metricChars.textContent = `${summary.typedCharacterCount} 文字`;
  metricAccuracy.textContent = `${summary.accuracy}%`;
  metricMaxCombo.textContent = `${summary.maxCombo} COMBO`;
  metricSpeed.textContent = `${summary.kpm} KPM / ${summary.wpm} WPM`;
  metricBgStage.textContent = summary.backgroundStage.displayName;
}

// 7. Keyboard Input Handling
window.addEventListener("keydown", (e) => {
  // If not currently in active PLAYING state, ignore keyboard
  if (!activeSession || activeSession.state !== GAME_STATES.PLAYING) {
    return;
  }

  // Allow browser shortcut keys (F5, F12, Ctrl/Cmd/Alt combos)
  if (e.ctrlKey || e.metaKey || e.altKey || e.key.startsWith("F") && e.key.length > 1) {
    return;
  }

  // Single character printable keys
  if (e.key.length === 1) {
    e.preventDefault();
    const res = activeSession.handleInput(e.key);

    if (res.isMistake) {
      targetDisplayBox.classList.remove("flash-error");
      void targetDisplayBox.offsetWidth; // trigger reflow
      targetDisplayBox.classList.add("flash-error");
    }

    renderGameUI();
  }
});

// 8. In-Game Abort & Practice Finish Actions
btnAbortGame.addEventListener("click", () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  activeSession = null;
  showScreen("title");
});

btnFinishPracticeEarly.addEventListener("click", () => {
  if (activeSession) {
    activeSession.finishSession();
  }
});

btnResultReplay.addEventListener("click", () => {
  startNewGame();
});

btnResultTitle.addEventListener("click", () => {
  activeSession = null;
  showScreen("title");
});

// Initial View: Title Screen
showScreen("title");
