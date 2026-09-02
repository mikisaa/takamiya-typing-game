import { filterQuestionsByDifficulty } from "../data/questionLoader.js";

/**
 * Question Selector & Pool Manager
 * Handles randomized selection, difficulty filtering, duplicate avoidance, and pool recycling.
 */
export class QuestionSelector {
  /**
   * @param {Array<object>} allQuestions - complete dataset of questions
   * @param {string} difficulty - "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
   */
  constructor(allQuestions, difficulty = "BEGINNER") {
    this.allQuestions = Array.isArray(allQuestions) ? allQuestions : [];
    this.difficulty = difficulty.toUpperCase();
    this.difficultyQuestions = filterQuestionsByDifficulty(this.allQuestions, this.difficulty);

    if (this.difficultyQuestions.length === 0) {
      throw new Error(`No questions available for difficulty "${this.difficulty}"`);
    }

    this.availablePool = [];
    this.lastSelectedId = null;
    this.resetPool();
  }

  /**
   * Resets and shuffles the available pool from the difficulty questions
   */
  resetPool() {
    this.availablePool = [...this.difficultyQuestions];
    this._shuffle(this.availablePool);
  }

  /**
   * Selects the next question while avoiding immediate consecutive duplicate
   * @returns {object} Question object
   */
  nextQuestion() {
    if (this.availablePool.length === 0) {
      this.resetPool();
    }

    // If only 1 question in total, return it
    if (this.difficultyQuestions.length === 1) {
      this.lastSelectedId = this.difficultyQuestions[0].id;
      return this.difficultyQuestions[0];
    }

    // If next question in pool has same ID as lastSelectedId, swap with another item in pool
    if (this.availablePool.length > 1 && this.availablePool[0].id === this.lastSelectedId) {
      const temp = this.availablePool[0];
      this.availablePool[0] = this.availablePool[1];
      this.availablePool[1] = temp;
    }

    const selected = this.availablePool.shift();
    this.lastSelectedId = selected.id;
    return selected;
  }

  /**
   * Internal in-place Fisher-Yates shuffle
   * @param {Array} array
   */
  _shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Total question count for this difficulty
   * @returns {number}
   */
  get totalCount() {
    return this.difficultyQuestions.length;
  }

  /**
   * Remaining questions in current cycle pool
   * @returns {number}
   */
  get remainingPoolCount() {
    return this.availablePool.length;
  }
}
