/**
 * Score, Multiplier, and Metrics Calculation Engine
 * Reference: docs/02_spec.md Section 5
 */

/**
 * Returns combo score multiplier based on current combo count.
 * @param {number} combo
 * @returns {number}
 */
export function getComboMultiplier(combo) {
  if (combo >= 50) return 2.0;
  if (combo >= 30) return 1.8;
  if (combo >= 20) return 1.5;
  if (combo >= 10) return 1.2;
  return 1.0;
}

/**
 * Calculates score points earned for a single successfully completed question.
 * @param {number} charCount - Number of correct characters
 * @param {number} currentCombo - Combo before or during completion
 * @returns {number}
 */
export function calculateQuestionScore(charCount, currentCombo) {
  if (typeof charCount !== "number" || charCount <= 0) return 0;
  const multiplier = getComboMultiplier(currentCombo);
  return Math.round(charCount * 100 * multiplier);
}

/**
 * Calculates final total score for production session.
 * Formula: Sum(QuestionScores) + (RemainingSeconds * 50) - (MissCount * 20)
 * @param {object} params
 * @param {number} params.accumulatedQuestionScore
 * @param {number} params.remainingSeconds
 * @param {number} params.missCount
 * @returns {number} total score (clamped to >= 0)
 */
export function calculateFinalScore({ accumulatedQuestionScore = 0, remainingSeconds = 0, missCount = 0 }) {
  const timeBonusScore = Math.max(0, Math.floor(remainingSeconds)) * 50;
  const missPenaltyScore = missCount * 20;
  const total = accumulatedQuestionScore + timeBonusScore - missPenaltyScore;
  return Math.max(0, Math.round(total));
}

/**
 * Calculates accuracy percentage (0.00 to 100.00).
 * @param {number} typedCharacters
 * @param {number} typingMistakes
 * @returns {number}
 */
export function calculateAccuracy(typedCharacters, typingMistakes) {
  const totalAttempts = (typedCharacters || 0) + (typingMistakes || 0);
  if (totalAttempts <= 0) return 100.0;
  const raw = (typedCharacters / totalAttempts) * 100;
  return Number(raw.toFixed(2));
}

/**
 * Calculates WPM (Words Per Minute) and KPM (Keystrokes Per Minute).
 * @param {number} typedCharacters
 * @param {number} durationSeconds
 * @returns {{ kpm: number, wpm: number }}
 */
export function calculateTypingSpeed(typedCharacters, durationSeconds) {
  if (!durationSeconds || durationSeconds <= 0 || !typedCharacters || typedCharacters <= 0) {
    return { kpm: 0, wpm: 0 };
  }
  const minutes = durationSeconds / 60;
  const kpm = Math.round(typedCharacters / minutes);
  const wpm = Number((kpm / 5).toFixed(1));
  return { kpm, wpm };
}
