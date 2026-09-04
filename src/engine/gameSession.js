import { GAME_STATES, GAME_MODES, DIFFICULTY_LEVELS } from "./gameState.js";
import { GAME_CONFIG } from "../config/gameConfig.js";
import { QuestionSelector } from "./questionSelector.js";
import { TypingEngine } from "./typingEngine.js";
import { calculateAllowedTime, getDifficultyConfig } from "./timingEngine.js";
import {
  calculateQuestionScore,
  calculateFinalScore,
  calculateAccuracy,
  calculateTypingSpeed
} from "./scoreCalculator.js";
import { getBackgroundStage, isExtraStage } from "./backgroundProgression.js";

/**
 * Game Session Manager
 * Encapsulates the runtime state, timers, scoring, and lifecycle of a single game play.
 */
export class GameSession {
  /**
   * @param {object} options
   * @param {string} options.mode - "PRODUCTION" | "PRACTICE"
   * @param {string} options.difficulty - "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
   * @param {Array<object>} options.questions - Complete dataset of questions
   * @param {object} [options.config=GAME_CONFIG] - Game configuration master
   */
  constructor({ mode = GAME_MODES.PRODUCTION, difficulty = DIFFICULTY_LEVELS.BEGINNER, questions = [], config = GAME_CONFIG, playerName = "" }) {
    this.mode = mode.toUpperCase() === GAME_MODES.PRACTICE ? GAME_MODES.PRACTICE : GAME_MODES.PRODUCTION;
    this.difficulty = difficulty.toUpperCase();
    this.config = config || GAME_CONFIG;
    this.playerName = typeof playerName === "string" ? playerName.trim() : "";
    this.submissionId = this.mode === GAME_MODES.PRODUCTION
      ? `SUB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
      : null;

    this.state = GAME_STATES.SETUP;
    this.questionSelector = new QuestionSelector(questions, this.difficulty);

    // Timing
    this.globalTimeRemaining = this.mode === GAME_MODES.PRODUCTION ? this.config.globalGameTimeSeconds : 0;
    this.globalTimeElapsed = 0;
    this.perQuestionAllowedTime = 0;
    this.perQuestionTimeRemaining = 0;

    // Feedback delay timer
    this.feedbackTimer = 0;
    this.feedbackDuration = 0.45; // 450ms default feedback delay

    // Ready Countdown (3..2..1)
    this.readyCountdown = 3.0;

    // Scoring & Metrics
    this.accumulatedQuestionScore = 0;
    this.correctCount = 0;
    this.missCount = 0;
    this.typingMistakeCount = 0;
    this.typedCharacterCount = 0;
    this.currentCombo = 0;
    this.maxCombo = 0;
    this.earnedTimeBonus = 0;
    this.lastAwardedBonusCombo = 0;
    this.truckLoadStage = 0; // 0 to 5 flatbed loading stage (resets to 0 on MISS)

    // Current Question & Typing Engine
    this.currentQuestion = null;
    this.currentTypingEngine = null;
    this.questionHistory = [];

    this.startedAt = null;
    this.finishedAt = null;
  }

  /**
   * Initializes session into READY state
   */
  startReady() {
    this.state = GAME_STATES.READY;
    this.readyCountdown = 3.0;
    this.startedAt = new Date();
  }

  /**
   * Transitions from READY to PLAYING and spawns first question
   */
  startPlaying() {
    this.state = GAME_STATES.PLAYING;
    this.spawnNextQuestion();
  }

  /**
   * Spawns next question from pool and initializes its TypingEngine and Forklift Timer
   */
  spawnNextQuestion() {
    this.currentQuestion = this.questionSelector.nextQuestion();
    this.currentTypingEngine = new TypingEngine(this.currentQuestion);

    const effectiveKeystrokes = this.currentTypingEngine.effectiveKeystrokes;
    const isPractice = this.mode === GAME_MODES.PRACTICE;
    this.perQuestionAllowedTime = calculateAllowedTime(
      this.difficulty,
      effectiveKeystrokes,
      isPractice,
      this.config
    );
    this.perQuestionTimeRemaining = this.perQuestionAllowedTime;
    this.state = GAME_STATES.PLAYING;
  }

  /**
   * High precision delta tick method (called in game loop)
   * @param {number} deltaSeconds
   */
  tick(deltaSeconds) {
    if (typeof deltaSeconds !== "number" || deltaSeconds <= 0) return;

    // 1. Ready state countdown (3..2..1)
    if (this.state === GAME_STATES.READY) {
      this.readyCountdown -= deltaSeconds;
      if (this.readyCountdown <= 0) {
        this.startPlaying();
      }
      return;
    }

    // 2. Feedback states (SUCCESS / MISS delay before next question)
    if (this.state === GAME_STATES.SUCCESS_FEEDBACK || this.state === GAME_STATES.MISS_FEEDBACK) {
      this.feedbackTimer -= deltaSeconds;
      if (this.feedbackTimer <= 0) {
        if (this.mode === GAME_MODES.PRODUCTION && this.globalTimeRemaining <= 0) {
          this.finishSession();
        } else {
          this.spawnNextQuestion();
        }
      }
      return;
    }

    // 3. Active Playing state
    if (this.state === GAME_STATES.PLAYING) {
      this.globalTimeElapsed += deltaSeconds;

      // Update Global Timer in Production
      if (this.mode === GAME_MODES.PRODUCTION) {
        this.globalTimeRemaining -= deltaSeconds;
        if (this.globalTimeRemaining <= 0) {
          this.globalTimeRemaining = 0;
          this.finishSession();
          return;
        }
      }

      // Update Per-Question Forklift Timer
      this.perQuestionTimeRemaining -= deltaSeconds;
      if (this.perQuestionTimeRemaining <= 0) {
        this.perQuestionTimeRemaining = 0;
        this.handleMissTimeout();
      }
    }
  }

  /**
   * Alias for handleInput
   * @param {string} key
   * @returns {object}
   */
  inputKey(key) {
    return this.handleInput(key);
  }

  /**
   * Handles keyboard input during gameplay
   * @param {string} key
   * @returns {object} { accepted: boolean, isMistake: boolean, isComplete: boolean }
   */
  handleInput(key) {
    if (this.state !== GAME_STATES.PLAYING || !this.currentTypingEngine) {
      return { accepted: false, isMistake: false, isComplete: false };
    }

    const res = this.currentTypingEngine.inputKey(key);

    if (res.accepted) {
      this.typedCharacterCount += 1;

      // Check if question is fully completed (SUCCESS)
      if (res.isComplete) {
        this.handleSuccess();
        return { accepted: true, isMistake: false, isComplete: true };
      }
      return { accepted: true, isMistake: false, isComplete: false };
    } else {
      // Mistype occurred: increment mistake count and reset combo
      this.typingMistakeCount += 1;
      this.currentCombo = 0;

      // In Production mode: apply difficulty specific typing mistake penalty from Global Timer
      let appliedPenalty = 0;
      if (this.mode === GAME_MODES.PRODUCTION) {
        const diffConfig = getDifficultyConfig(this.difficulty, this.config);
        appliedPenalty = diffConfig.typingMistakePenaltySeconds || 0.5;
        this.globalTimeRemaining = Math.max(0, this.globalTimeRemaining - appliedPenalty);

        // If penalty exhausts remaining global time, immediately finish game session
        if (this.globalTimeRemaining === 0) {
          this.finishSession();
        }
      }

      return { accepted: false, isMistake: true, isComplete: false, penaltySeconds: appliedPenalty };
    }
  }

  /**
   * Handles Question SUCCESS flow
   */
  handleSuccess() {
    this.correctCount += 1;
    this.currentCombo += 1;
    if (this.currentCombo > this.maxCombo) {
      this.maxCombo = this.currentCombo;
    }

    // 1. Calculate and add question score
    const charCount = this.currentTypingEngine.effectiveKeystrokes;
    const earnedScore = calculateQuestionScore(charCount, this.currentCombo);
    this.accumulatedQuestionScore += earnedScore;

    // 2. Advance truck flatbed loading stage (clamped to max 5)
    this.truckLoadStage = Math.min(5, this.truckLoadStage + 1);

    // 3. Check combo threshold for TIME BONUS (every 15 combos in Production)
    if (this.mode === GAME_MODES.PRODUCTION) {
      const bonusThreshold = this.config.comboThresholdForBonus || 15;
      const bonusSeconds = this.config.timeBonusPerCombo || 5;
      const maxBonus = this.config.maxTimeBonusTotal || 30;

      const currentThresholdStep = Math.floor(this.currentCombo / bonusThreshold);
      if (currentThresholdStep > this.lastAwardedBonusCombo) {
        this.lastAwardedBonusCombo = currentThresholdStep;
        if (this.earnedTimeBonus < maxBonus) {
          const award = Math.min(bonusSeconds, maxBonus - this.earnedTimeBonus);
          this.earnedTimeBonus += award;
          this.globalTimeRemaining += award;
        }
      }
    }

    // 4. Record history
    this.questionHistory.push({
      id: this.currentQuestion.id,
      displayText: this.currentQuestion.displayText,
      reading: this.currentQuestion.reading,
      difficulty: this.currentQuestion.difficulty,
      result: "SUCCESS",
      effectiveKeystrokes: charCount
    });

    // 5. Set feedback state
    this.state = GAME_STATES.SUCCESS_FEEDBACK;
    this.feedbackTimer = this.feedbackDuration;
  }

  /**
   * Handles Question MISS timeout flow (Forklift reached truck)
   * Resets truck flatbed loading stage to 0 (empty)
   */
  handleMissTimeout() {
    this.missCount += 1;
    this.currentCombo = 0;
    this.truckLoadStage = 0; // Authoritative reset on per-question timeout MISS

    // Apply difficulty specific penalty in Production
    if (this.mode === GAME_MODES.PRODUCTION) {
      const diffConfig = getDifficultyConfig(this.difficulty, this.config);
      const penalty = diffConfig.missPenaltySeconds || 4;
      this.globalTimeRemaining = Math.max(0, this.globalTimeRemaining - penalty);
    }

    // Record history
    this.questionHistory.push({
      id: this.currentQuestion.id,
      displayText: this.currentQuestion.displayText,
      reading: this.currentQuestion.reading,
      difficulty: this.currentQuestion.difficulty,
      result: "MISS",
      effectiveKeystrokes: this.currentTypingEngine?.effectiveKeystrokes || 0
    });

    // Transition to MISS_FEEDBACK
    this.state = GAME_STATES.MISS_FEEDBACK;
    this.feedbackTimer = this.feedbackDuration;
  }

  /**
   * Finishes session and marks timestamp
   */
  finishSession() {
    this.finishedAt = new Date();
    this.state = this.mode === GAME_MODES.PRODUCTION ? GAME_STATES.RESULT : GAME_STATES.PRACTICE_RESULT;
  }

  /**
   * Returns normalized forklift progress (0.0 to 1.0)
   * 0.0 = Start line, 1.0 = Destination (Truck contact)
   * @returns {number}
   */
  getForkliftProgress() {
    if (!this.perQuestionAllowedTime || this.perQuestionAllowedTime <= 0) return 0;
    const progress = 1.0 - this.perQuestionTimeRemaining / this.perQuestionAllowedTime;
    return Math.min(1, Math.max(0, Number(progress.toFixed(3))));
  }

  /**
   * Returns current calculated score
   * @returns {number}
   */
  getCurrentScore() {
    if (this.mode === GAME_MODES.PRACTICE) return 0;
    return calculateFinalScore({
      accumulatedQuestionScore: this.accumulatedQuestionScore,
      remainingSeconds: this.globalTimeRemaining,
      missCount: this.missCount
    });
  }

  /**
   * Generates summary metrics snapshot for result screens
   * @returns {object}
   */
  getSummary() {
    const finalScore = this.getCurrentScore();
    const accuracyPercent = calculateAccuracy(this.typedCharacterCount, this.typingMistakeCount);
    const { kpm, wpm } = calculateTypingSpeed(this.typedCharacterCount, this.globalTimeElapsed);
    const bgInfo = getBackgroundStage(this.correctCount, this.config);

    return {
      submissionId: this.submissionId,
      playerName: this.playerName,
      mode: this.mode,
      difficulty: this.difficulty,
      score: finalScore,
      correctCount: this.correctCount,
      missCount: this.missCount,
      typingMistakeCount: this.typingMistakeCount,
      typedCharacterCount: this.typedCharacterCount,
      typedCharacters: this.typedCharacterCount,
      totalKeystrokes: this.typedCharacterCount + this.typingMistakeCount,
      correctKeystrokes: this.typedCharacterCount,
      maxCombo: this.maxCombo,
      truckLoadStage: this.truckLoadStage,
      accuracy: {
        typed: this.typedCharacterCount,
        mistakes: this.typingMistakeCount,
        percent: accuracyPercent
      },
      accuracyPercent,
      kpm,
      wpm,
      playDurationSeconds: Number(this.globalTimeElapsed.toFixed(1)),
      earnedTimeBonus: this.earnedTimeBonus,
      backgroundStage: bgInfo,
      isExtra: isExtraStage(this.correctCount, this.config),
      startedAt: this.startedAt,
      finishedAt: this.finishedAt || new Date()
    };
  }
}
