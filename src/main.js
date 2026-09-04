import { GameSession } from "./engine/gameSession.js";
import { GAME_STATES, GAME_MODES } from "./engine/gameState.js";
import { DEFAULT_QUESTIONS } from "./data/defaultQuestions.js";
import { GAME_CONFIG } from "./config/gameConfig.js";
import { GameVisualScene } from "./visual/animation/visualScene.js";
import { getLastPlayerName, setLastPlayerName } from "./storage/playerStorage.js";
import { BackendClient } from "./api/backendClient.js";

// DOM Screens
const screens = {
  title: document.getElementById("screenTitle"),
  setup: document.getElementById("screenSetup"),
  game: document.getElementById("screenGame"),
  result: document.getElementById("screenResult"),
  ranking: document.getElementById("screenRanking")
};

// Title Screen Elements
const btnStartProduction = document.getElementById("btnStartProduction");
const btnStartPractice = document.getElementById("btnStartPractice");
const btnOpenRanking = document.getElementById("btnOpenRanking");

// Setup Screen Elements
const setupModeTitle = document.getElementById("setupModeTitle");
const setupModeDesc = document.getElementById("setupModeDesc");
const playerNameGroup = document.getElementById("playerNameGroup");
const inputPlayerName = document.getElementById("inputPlayerName");
const playerNameFeedback = document.getElementById("playerNameFeedback");
const btnLaunchGame = document.getElementById("btnLaunchGame");
const btnBackToTitle = document.getElementById("btnBackToTitle");

// Game Screen Elements
const readyOverlay = document.getElementById("readyOverlay");
const readyCountText = document.getElementById("readyCountText");
const hudModeBadge = document.getElementById("hudModeBadge");
const hudDiffBadge = document.getElementById("hudDiffBadge");
const hudBgStageBadge = document.getElementById("hudBgStageBadge");
const hudPlayerBadge = document.getElementById("hudPlayerBadge");
const hudPlayerName = document.getElementById("hudPlayerName");
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
const metricWpm = document.getElementById("metricWpm");
const metricKpm = document.getElementById("metricKpm");
const metricPlayTimeItem = document.getElementById("metricPlayTimeItem");
const metricPlayTime = document.getElementById("metricPlayTime");
const resultSaveContainer = document.getElementById("resultSaveContainer");
const resultSaveStatus = document.getElementById("resultSaveStatus");
const btnRetrySubmit = document.getElementById("btnRetrySubmit");
const btnResultReplay = document.getElementById("btnResultReplay");
const btnResultRanking = document.getElementById("btnResultRanking");
const btnResultTitle = document.getElementById("btnResultTitle");

// Ranking Screen Elements
const tabPeriodMonthly = document.getElementById("tabPeriodMonthly");
const tabPeriodAllTime = document.getElementById("tabPeriodAllTime");
const tabDiffBeginner = document.getElementById("tabDiffBeginner");
const tabDiffIntermediate = document.getElementById("tabDiffIntermediate");
const tabDiffAdvanced = document.getElementById("tabDiffAdvanced");
const rankingStatusContainer = document.getElementById("rankingStatusContainer");
const rankingLoading = document.getElementById("rankingLoading");
const rankingEmpty = document.getElementById("rankingEmpty");
const rankingError = document.getElementById("rankingError");
const btnRankingRetry = document.getElementById("btnRankingRetry");
const rankingTableContainer = document.getElementById("rankingTableContainer");
const rankingTableBody = document.getElementById("rankingTableBody");
const rankingCurrentPlayerBox = document.getElementById("rankingCurrentPlayerBox");
const cpRank = document.getElementById("cpRank");
const cpName = document.getElementById("cpName");
const cpScore = document.getElementById("cpScore");
const cpAccuracy = document.getElementById("cpAccuracy");
const cpCombo = document.getElementById("cpCombo");
const btnRankingBackToTitle = document.getElementById("btnRankingBackToTitle");

// Application & Ranking State
const backendClient = new BackendClient();
let lastSubmittedPayload = null;
let activeSession = null;
let selectedMode = GAME_MODES.PRODUCTION;
let selectedDifficulty = "BEGINNER";
let activeRankingPeriod = "MONTHLY";
let activeRankingDifficulty = "BEGINNER";
let rankingRequestToken = 0;
const rankingCache = new Map();
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
  if (playerNameGroup) {
    playerNameGroup.style.display = "flex";
  }
  if (playerNameFeedback) {
    playerNameFeedback.textContent = "";
  }
  if (inputPlayerName) {
    const remembered = getLastPlayerName();
    if (remembered) {
      inputPlayerName.value = remembered;
    }
  }
  showScreen("setup");
});

btnStartPractice.addEventListener("click", () => {
  selectedMode = GAME_MODES.PRACTICE;
  setupModeTitle.textContent = "【練習モード】難易度を選択してください";
  setupModeDesc.textContent = "時間無制限";
  if (playerNameGroup) {
    playerNameGroup.style.display = "none";
  }
  if (playerNameFeedback) {
    playerNameFeedback.textContent = "";
  }
  showScreen("setup");
});

// 2. Setup Screen Actions
btnBackToTitle.addEventListener("click", () => {
  showScreen("title");
});

btnLaunchGame.addEventListener("click", () => {
  const checkedDiff = document.querySelector('input[name="difficultySelect"]:checked')?.value || "BEGINNER";
  selectedDifficulty = checkedDiff;

  let validatedPlayerName = "";
  if (selectedMode === GAME_MODES.PRODUCTION) {
    const rawName = inputPlayerName?.value || "";
    const cleanName = rawName.trim();
    if (!cleanName) {
      if (playerNameFeedback) {
        playerNameFeedback.textContent = "プレイヤー名を入力してください。";
      }
      inputPlayerName?.focus();
      return;
    }
    const charLen = Array.from(cleanName).length;
    if (charLen > 30) {
      if (playerNameFeedback) {
        playerNameFeedback.textContent = "プレイヤー名は30文字以内で入力してください。";
      }
      inputPlayerName?.focus();
      return;
    }
    if (playerNameFeedback) {
      playerNameFeedback.textContent = "";
    }
    setLastPlayerName(cleanName);
    validatedPlayerName = cleanName;
  }

  startNewGame(validatedPlayerName);
});

// 3. Start New Game
function startNewGame(playerName = "") {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  activeSession = new GameSession({
    mode: selectedMode,
    difficulty: selectedDifficulty,
    questions: DEFAULT_QUESTIONS,
    config: GAME_CONFIG,
    playerName: playerName
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
    if (hudPlayerBadge) hudPlayerBadge.style.display = "none";
  } else {
    btnFinishPracticeEarly.style.display = "none";
    hudGlobalTimer.textContent = activeSession.globalTimeRemaining.toFixed(1);
    if (hudPlayerBadge) {
      hudPlayerBadge.style.display = "flex";
      if (hudPlayerName) hudPlayerName.textContent = activeSession.playerName || "-";
    }
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

  // Background Stage (No OS emoji)
  const summary = activeSession.getSummary();
  hudBgStageBadge.textContent = summary.backgroundStage.displayName;

  // 3. Track Status
  trackForkliftTimer.textContent = `残り ${Math.max(0, activeSession.perQuestionTimeRemaining).toFixed(1)}s`;

  if (activeSession.state === GAME_STATES.SUCCESS_FEEDBACK) {
    trackStatusMsg.textContent = "積込完了 (SUCCESS)";
    feedbackBanner.className = "feedback-banner success";
    feedbackBanner.textContent = "SUCCESS!";
  } else if (activeSession.state === GAME_STATES.MISS_FEEDBACK) {
    trackStatusMsg.textContent = "接触・資材落下 (MISS)";
    feedbackBanner.className = "feedback-banner miss";
    feedbackBanner.textContent = "MISS!";
  } else {
    trackStatusMsg.textContent = "積込走行中...";
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
    if (resultSaveContainer) resultSaveContainer.style.display = "none";
    if (btnResultRanking) btnResultRanking.style.display = "none";
  } else {
    resultHeaderBadge.textContent = "GAME FINISHED";
    resultMainTitle.textContent = "本番リザルト";
    resultScoreBanner.style.display = "flex";
    resultFinalScore.textContent = summary.score.toLocaleString();
    if (btnResultRanking) btnResultRanking.style.display = "inline-flex";
    if (resultSaveContainer) {
      resultSaveContainer.style.display = "block";
      resultSaveStatus.textContent = "スコア保存中...";
      if (btnRetrySubmit) btnRetrySubmit.style.display = "none";
      submitProductionScore(summary);
    }
  }

  metricCorrect.textContent = `${summary.correctCount} 問`;
  metricMiss.textContent = `${summary.missCount} 回`;
  metricMistakes.textContent = `${summary.typingMistakeCount} 回`;
  metricChars.textContent = `${summary.totalKeystrokes || (summary.correctKeystrokes + summary.typingMistakeCount)} 文字`;
  const accVal = summary.accuracyPercent ?? (typeof summary.accuracy === "object" ? summary.accuracy.percent : summary.accuracy);
  metricAccuracy.textContent = `${Number(accVal || 100).toFixed(1)}%`;
  metricMaxCombo.textContent = `${summary.maxCombo} COMBO`;
  if (metricWpm) metricWpm.textContent = `${summary.wpm} WPM`;
  if (metricKpm) metricKpm.textContent = `${summary.kpm} KPM`;
  if (metricSpeed) metricSpeed.textContent = `${summary.kpm} KPM / ${summary.wpm} WPM`;
  const bgStageElem = document.getElementById("metricBgStage");
  if (bgStageElem) bgStageElem.textContent = summary.backgroundStage.displayName;

  if (summary.mode === GAME_MODES.PRACTICE && metricPlayTimeItem && metricPlayTime) {
    metricPlayTimeItem.style.display = "block";
    const totalSecs = Math.floor(summary.elapsedTime || 0);
    const mins = String(Math.floor(totalSecs / 60)).padStart(2, "0");
    const secs = String(totalSecs % 60).padStart(2, "0");
    metricPlayTime.textContent = `${mins}:${secs}`;
  } else if (metricPlayTimeItem) {
    metricPlayTimeItem.style.display = "none";
  }
}

async function submitProductionScore(summary) {
  lastSubmittedPayload = {
    submissionId: summary.submissionId,
    playerName: summary.playerName,
    mode: "PRODUCTION",
    difficulty: summary.difficulty,
    score: summary.score,
    correctCount: summary.correctCount,
    typedCharacters: summary.typedCharacterCount,
    typingMistakes: summary.typingMistakeCount,
    missCount: summary.missCount,
    accuracy: Number((summary.accuracyPercent ?? 100).toFixed(2)),
    maxCombo: summary.maxCombo,
    wpm: Number((summary.wpm || 0).toFixed(1)),
    kpm: Number((summary.kpm || 0).toFixed(1)),
    reachedStage: summary.backgroundStage?.id || "GROUND",
    startedAt: summary.startedAt ? summary.startedAt.toISOString() : new Date().toISOString(),
    finishedAt: summary.finishedAt ? summary.finishedAt.toISOString() : new Date().toISOString(),
    appVersion: "1.0.0"
  };

  try {
    const res = await backendClient.submitScore(lastSubmittedPayload);
    if (res && res.ok) {
      if (resultSaveStatus) {
        resultSaveStatus.textContent = "スコア保存完了";
      }
      if (btnRetrySubmit) {
        btnRetrySubmit.style.display = "none";
      }
    } else {
      if (resultSaveStatus) {
        resultSaveStatus.textContent = "スコア保存に失敗しました";
      }
      if (btnRetrySubmit) {
        btnRetrySubmit.style.display = "inline-flex";
      }
    }
  } catch (err) {
    if (resultSaveStatus) {
      resultSaveStatus.textContent = "スコア保存に失敗しました";
    }
    if (btnRetrySubmit) {
      btnRetrySubmit.style.display = "inline-flex";
    }
  }
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

if (btnRetrySubmit) {
  btnRetrySubmit.addEventListener("click", () => {
    if (!lastSubmittedPayload) return;
    if (resultSaveStatus) resultSaveStatus.textContent = "再送信中...";
    btnRetrySubmit.style.display = "none";
    backendClient.submitScore(lastSubmittedPayload).then((res) => {
      if (res && res.ok) {
        if (resultSaveStatus) resultSaveStatus.textContent = "スコア保存完了";
        btnRetrySubmit.style.display = "none";
      } else {
        if (resultSaveStatus) resultSaveStatus.textContent = "スコア保存に失敗しました";
        btnRetrySubmit.style.display = "inline-flex";
      }
    }).catch(() => {
      if (resultSaveStatus) resultSaveStatus.textContent = "スコア保存に失敗しました";
      btnRetrySubmit.style.display = "inline-flex";
    });
  });
}

btnResultReplay.addEventListener("click", () => {
  const rememberedName = activeSession?.playerName || getLastPlayerName();
  startNewGame(rememberedName);
});

btnResultTitle.addEventListener("click", () => {
  activeSession = null;
  showScreen("title");
});

// 8. Ranking Screen Controller & Stale Protection
function updateRankingTabUI() {
  if (tabPeriodMonthly && tabPeriodAllTime) {
    const isMonthly = activeRankingPeriod === "MONTHLY";
    tabPeriodMonthly.classList.toggle("active", isMonthly);
    tabPeriodMonthly.setAttribute("aria-selected", isMonthly ? "true" : "false");
    tabPeriodAllTime.classList.toggle("active", !isMonthly);
    tabPeriodAllTime.setAttribute("aria-selected", !isMonthly ? "true" : "false");
  }

  const diffTabs = [
    { tab: tabDiffBeginner, diff: "BEGINNER" },
    { tab: tabDiffIntermediate, diff: "INTERMEDIATE" },
    { tab: tabDiffAdvanced, diff: "ADVANCED" }
  ];

  diffTabs.forEach(({ tab, diff }) => {
    if (tab) {
      const isSelected = activeRankingDifficulty === diff;
      tab.classList.toggle("active", isSelected);
      tab.setAttribute("aria-selected", isSelected ? "true" : "false");
    }
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderRankingData(data) {
  if (rankingLoading) rankingLoading.style.display = "none";
  if (rankingError) rankingError.style.display = "none";

  const entries = data.entries || [];
  const rememberedName = getLastPlayerName();

  if (entries.length === 0) {
    if (rankingEmpty) {
      rankingEmpty.textContent = data.period === "MONTHLY"
        ? "今月の記録はまだありません"
        : "記録はまだありません";
      rankingEmpty.style.display = "block";
    }
    if (rankingTableContainer) rankingTableContainer.style.display = "none";
    if (rankingCurrentPlayerBox) rankingCurrentPlayerBox.style.display = "none";
    return;
  }

  if (rankingEmpty) rankingEmpty.style.display = "none";
  if (rankingTableContainer) rankingTableContainer.style.display = "block";

  if (rankingTableBody) {
    rankingTableBody.innerHTML = "";

    entries.forEach((item) => {
      const tr = document.createElement("tr");

      // Top 3 row styling (no gold/silver/bronze, palette compliant)
      if (item.rank === 1) tr.classList.add("rank-row-top1");
      else if (item.rank === 2) tr.classList.add("rank-row-top2");
      else if (item.rank === 3) tr.classList.add("rank-row-top3");

      // Highlight current player row if matching remembered name or currentPlayer rank
      const isCurrentPlayer = (rememberedName && item.playerName === rememberedName) ||
        (data.currentPlayer && data.currentPlayer.rank === item.rank && data.currentPlayer.playerName === item.playerName);

      if (isCurrentPlayer) {
        tr.classList.add("rank-row-current-player");
      }

      tr.innerHTML = `
        <td class="col-rank"><span class="rank-num-badge ${item.rank === 1 ? "rank-top1-badge" : ""}">${item.rank}</span></td>
        <td class="col-player"><div class="ranking-player-cell" title="${escapeHtml(item.playerName)}">${escapeHtml(item.playerName)}</div></td>
        <td class="col-score">${item.score.toLocaleString()}</td>
        <td class="col-accuracy">${item.accuracy.toFixed(1)}%</td>
        <td class="col-combo">${item.maxCombo}</td>
      `;

      rankingTableBody.appendChild(tr);
    });
  }

  // Handle current player badge outside TOP 10
  if (data.currentPlayer && data.currentPlayer.rank > entries.length && rankingCurrentPlayerBox) {
    rankingCurrentPlayerBox.style.display = "flex";
    if (cpRank) cpRank.textContent = `${data.currentPlayer.rank}位`;
    if (cpName) {
      cpName.textContent = data.currentPlayer.playerName;
      cpName.title = data.currentPlayer.playerName;
    }
    if (cpScore) cpScore.textContent = data.currentPlayer.score.toLocaleString();
    if (cpAccuracy) cpAccuracy.textContent = `正答率 ${data.currentPlayer.accuracy.toFixed(1)}%`;
    if (cpCombo) cpCombo.textContent = `MAX ${data.currentPlayer.maxCombo}`;
  } else if (rankingCurrentPlayerBox) {
    rankingCurrentPlayerBox.style.display = "none";
  }
}

async function loadAndDisplayRankings(forceFresh = false) {
  updateRankingTabUI();

  const cacheKey = `${activeRankingPeriod}_${activeRankingDifficulty}`;

  // If cached and not forcing fresh fetch, render immediately
  if (!forceFresh && rankingCache.has(cacheKey)) {
    renderRankingData(rankingCache.get(cacheKey));
    return;
  }

  // Show loading state, hide table & errors
  if (rankingLoading) rankingLoading.style.display = "block";
  if (rankingEmpty) rankingEmpty.style.display = "none";
  if (rankingError) rankingError.style.display = "none";
  if (rankingTableContainer) rankingTableContainer.style.display = "none";
  if (rankingCurrentPlayerBox) rankingCurrentPlayerBox.style.display = "none";

  const token = ++rankingRequestToken;
  const rememberedName = getLastPlayerName();

  try {
    const res = await backendClient.getRankings({
      period: activeRankingPeriod,
      difficulty: activeRankingDifficulty,
      limit: 10,
      playerName: rememberedName || null
    });

    // Stale response check: discard if user has changed tabs since request was fired
    if (token !== rankingRequestToken) {
      return;
    }

    if (!res || !res.ok || !res.data) {
      if (rankingLoading) rankingLoading.style.display = "none";
      if (rankingError) rankingError.style.display = "flex";
      return;
    }

    // Cache the fresh response for this session
    rankingCache.set(cacheKey, res.data);
    renderRankingData(res.data);
  } catch (err) {
    if (token !== rankingRequestToken) return;
    if (rankingLoading) rankingLoading.style.display = "none";
    if (rankingError) rankingError.style.display = "flex";
  }
}

// Title Screen "ランキング" Button
if (btnOpenRanking) {
  btnOpenRanking.addEventListener("click", () => {
    activeRankingPeriod = "MONTHLY";
    activeRankingDifficulty = "BEGINNER";
    showScreen("ranking");
    loadAndDisplayRankings(false);
  });
}

// Result Screen "ランキングを見る" Button
if (btnResultRanking) {
  btnResultRanking.addEventListener("click", () => {
    activeRankingPeriod = "MONTHLY";
    activeRankingDifficulty = (activeSession && activeSession.difficulty) ? activeSession.difficulty : selectedDifficulty;
    showScreen("ranking");
    // Result flow: force fresh fetch to guarantee immediately submitted score reflection
    loadAndDisplayRankings(true);
  });
}

// Period Tabs
if (tabPeriodMonthly) {
  tabPeriodMonthly.addEventListener("click", () => {
    if (activeRankingPeriod !== "MONTHLY") {
      activeRankingPeriod = "MONTHLY";
      loadAndDisplayRankings(false);
    }
  });
}
if (tabPeriodAllTime) {
  tabPeriodAllTime.addEventListener("click", () => {
    if (activeRankingPeriod !== "ALL_TIME") {
      activeRankingPeriod = "ALL_TIME";
      loadAndDisplayRankings(false);
    }
  });
}

// Difficulty Tabs
if (tabDiffBeginner) {
  tabDiffBeginner.addEventListener("click", () => {
    if (activeRankingDifficulty !== "BEGINNER") {
      activeRankingDifficulty = "BEGINNER";
      loadAndDisplayRankings(false);
    }
  });
}
if (tabDiffIntermediate) {
  tabDiffIntermediate.addEventListener("click", () => {
    if (activeRankingDifficulty !== "INTERMEDIATE") {
      activeRankingDifficulty = "INTERMEDIATE";
      loadAndDisplayRankings(false);
    }
  });
}
if (tabDiffAdvanced) {
  tabDiffAdvanced.addEventListener("click", () => {
    if (activeRankingDifficulty !== "ADVANCED") {
      activeRankingDifficulty = "ADVANCED";
      loadAndDisplayRankings(false);
    }
  });
}

// Ranking Retry & Back
if (btnRankingRetry) {
  btnRankingRetry.addEventListener("click", () => {
    loadAndDisplayRankings(true);
  });
}
if (btnRankingBackToTitle) {
  btnRankingBackToTitle.addEventListener("click", () => {
    showScreen("title");
  });
}

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
