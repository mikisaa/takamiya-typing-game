import { GameSession } from "./engine/gameSession.js";
import { GAME_STATES, GAME_MODES } from "./engine/gameState.js";
import { DEFAULT_QUESTIONS } from "./data/defaultQuestions.js";
import { GAME_CONFIG } from "./config/gameConfig.js";
import { GameVisualScene } from "./visual/animation/visualScene.js";

// DOM Screens
const screens = {
  title: document.getElementById("screenTitle"),
  setup: document.getElementById("screenSetup"),
  game: document.getElementById("screenGame"),
  result: document.getElementById("screenResult")
};

// Title Screen Elements
const btnStartProduction = document.getElementById("btnStartProduction");
const btnStartPractice = document.getElementById("btnStartPractice");

// Setup Screen Elements
const setupModeTitle = document.getElementById("setupModeTitle");
const setupModeDesc = document.getElementById("setupModeDesc");
const btnLaunchGame = document.getElementById("btnLaunchGame");
const btnBackToTitle = document.getElementById("btnBackToTitle");

// Game Screen Elements
const readyOverlay = document.getElementById("readyOverlay");
const readyCountText = document.getElementById("readyCountText");
const hudModeBadge = document.getElementById("hudModeBadge");
const hudDiffBadge = document.getElementById("hudDiffBadge");
const hudBgStageBadge = document.getElementById("hudBgStageBadge");
const hudGlobalTimer = document.getElementById("hudGlobalTimer");
const hudScoreVal = document.getElementById("hudScoreVal");
const hudComboVal = document.getElementById("hudComboVal");

// Visual Scene Container
const gameVisualSceneContainer = document.getElementById("gameVisualScene");
let visualScene = null;

// Track Status Elements
const trackStatusMsg = document.getElementById("trackStatusMsg");
const trackForkliftTimer = document.getElementById("trackForkliftTimer");

// Prompt & Target Elements
const feedbackBanner = document.getElementById("feedbackBanner");
const promptDisplayText = document.getElementById("promptDisplayText");
const promptReadingText = document.getElementById("promptReadingText");
const targetDisplayBox = document.getElementById("targetDisplayBox");
const targetTypedSpan = document.getElementById("targetTypedSpan");
const targetRemainingSpan = document.getElementById("targetRemainingSpan");
const btnAbortGame = document.getElementById("btnAbortGame");
const btnFinishPracticeEarly = document.getElementById("btnFinishPracticeEarly");

// Result Screen Elements
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

// Application State
let activeSession = null;
let selectedMode = GAME_MODES.PRODUCTION;
let selectedDifficulty = "BEGINNER";
let animationFrameId = null;
let lastTimestamp = 0;
let previousSessionState = null;
let previousQuestionId = null;

// Initialize Visual Scene
if (gameVisualSceneContainer) {
  visualScene = new GameVisualScene(gameVisualSceneContainer);
}

// Navigation Helper
function showScreen(screenKey) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  if (screens[screenKey]) {
    screens[screenKey].classList.add("active");
  }
}

// 1. Title Screen Actions
btnStartProduction.addEventListener("click", () => {
  selectedMode = GAME_MODES.PRODUCTION;
  setupModeTitle.textContent = "【本番モード】難易度を選択してください";
  setupModeDesc.textContent = "時間制限90秒";
  showScreen("setup");
});

btnStartPractice.addEventListener("click", () => {
  selectedMode = GAME_MODES.PRACTICE;
  setupModeTitle.textContent = "【練習モード】難易度を選択してください";
  setupModeDesc.textContent = "時間無制限";
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

  previousSessionState = null;
  previousQuestionId = null;

  // Initialize Visual Scene with selected difficulty
  if (visualScene) {
    visualScene.setDifficulty(selectedDifficulty);
  }

  // Configure UI for selected mode
  hudModeBadge.textContent = selectedMode === GAME_MODES.PRODUCTION ? "本番" : "練習";
  hudModeBadge.className = `hud-badge ${selectedMode === GAME_MODES.PRODUCTION ? "mode-badge" : "stage-badge"}`;
  hudDiffBadge.textContent = selectedDifficulty === "BEGINNER" ? "初級" : selectedDifficulty === "INTERMEDIATE" ? "中級" : "上級";

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

  // Synchronize Visual Scene with Session State transitions
  if (visualScene) {
    const currentState = activeSession.state;
    const currentQId = activeSession.currentQuestion?.id;

    // Transition into SUCCESS_FEEDBACK
    if (currentState === GAME_STATES.SUCCESS_FEEDBACK && previousSessionState !== GAME_STATES.SUCCESS_FEEDBACK) {
      visualScene.triggerSuccess(activeSession.correctCount);
    }
    // Transition into MISS_FEEDBACK
    else if (currentState === GAME_STATES.MISS_FEEDBACK && previousSessionState !== GAME_STATES.MISS_FEEDBACK) {
      visualScene.triggerMiss();
    }
    // Transition to next Question
    else if (currentState === GAME_STATES.PLAYING && (previousSessionState !== GAME_STATES.PLAYING || currentQId !== previousQuestionId)) {
      if (previousSessionState === GAME_STATES.SUCCESS_FEEDBACK || previousSessionState === GAME_STATES.MISS_FEEDBACK || previousSessionState === GAME_STATES.READY) {
        visualScene.resetForNewQuestion();
      }
    }

    previousSessionState = currentState;
    previousQuestionId = currentQId;

    // Update Visual Scene frame with active session correctCount for progressive background
    visualScene.update(deltaSeconds, activeSession.getForkliftProgress(), activeSession.state, activeSession.correctCount);
  }

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

  // 3. Track Status
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
  const accVal = summary.accuracyPercent ?? (typeof summary.accuracy === "object" ? summary.accuracy.percent : summary.accuracy);
  metricAccuracy.textContent = `${Number(accVal || 100).toFixed(1)}%`;
  metricMaxCombo.textContent = `${summary.maxCombo} COMBO`;
  metricSpeed.textContent = `${summary.kpm} KPM / ${summary.wpm} WPM`;
  metricBgStage.textContent = summary.backgroundStage.displayName;
}

// 7. Typing Input Event Listener
window.addEventListener("keydown", (e) => {
  if (!activeSession || activeSession.state !== GAME_STATES.PLAYING) return;

  // Ignore control keys, alt, cmd, tab, function keys, etc.
  if (e.ctrlKey || e.altKey || e.metaKey || e.key.length !== 1) {
    return;
  }

  e.preventDefault();
  const inputResult = activeSession.handleInput(e.key);

  if (!inputResult.accepted) {
    // Flash target box red on typing mistake
    targetDisplayBox.classList.remove("flash-error");
    void targetDisplayBox.offsetWidth; // Trigger reflow
    targetDisplayBox.classList.add("flash-error");
  }

  renderGameUI();
});

// 8. In-Game & Result Action Listeners
btnAbortGame.addEventListener("click", () => {
  if (confirm("ゲームを中断してタイトル画面に戻りますか？")) {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    activeSession = null;
    showScreen("title");
  }
});

btnFinishPracticeEarly.addEventListener("click", () => {
  if (activeSession && activeSession.mode === GAME_MODES.PRACTICE) {
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

// 9. Developer-Only Test & State Injection Hooks (Section 43 & Phase 5)
if (typeof window !== "undefined") {
  window.__setDevCorrectCount = (count) => {
    if (visualScene) visualScene.renderCityPanorama(count);
  };
  window.__triggerExtraEvent = (type) => {
    if (visualScene && visualScene.extraManager) visualScene.extraManager.spawnEvent(type);
  };
  window.__triggerRainbow = () => {
    if (visualScene && visualScene.extraManager) visualScene.extraManager.triggerRainbow();
  };
  window.__getActiveSession = () => activeSession;
  window.__getVisualScene = () => visualScene;
  window.__getExtraManager = () => visualScene?.extraManager;
}
