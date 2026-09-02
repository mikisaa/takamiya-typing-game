/**
 * Game State Definitions & Transition Rules
 * Encapsulates the canonical state machine of the application.
 */

export const GAME_STATES = {
  TITLE: "TITLE",
  SETUP: "SETUP",
  READY: "READY",
  PLAYING: "PLAYING",
  SUCCESS_FEEDBACK: "SUCCESS_FEEDBACK",
  MISS_FEEDBACK: "MISS_FEEDBACK",
  RESULT: "RESULT",
  PRACTICE_RESULT: "PRACTICE_RESULT"
};

export const GAME_MODES = {
  PRODUCTION: "PRODUCTION",
  PRACTICE: "PRACTICE"
};

export const DIFFICULTY_LEVELS = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED"
};

/**
 * Validates whether a state transition from `fromState` to `toState` is permitted.
 * @param {string} fromState
 * @param {string} toState
 * @returns {boolean}
 */
export function isValidStateTransition(fromState, toState) {
  if (fromState === toState) return true;

  const validTransitions = {
    [GAME_STATES.TITLE]: [GAME_STATES.SETUP],
    [GAME_STATES.SETUP]: [GAME_STATES.READY, GAME_STATES.TITLE],
    [GAME_STATES.READY]: [GAME_STATES.PLAYING, GAME_STATES.TITLE],
    [GAME_STATES.PLAYING]: [
      GAME_STATES.SUCCESS_FEEDBACK,
      GAME_STATES.MISS_FEEDBACK,
      GAME_STATES.RESULT,
      GAME_STATES.PRACTICE_RESULT,
      GAME_STATES.TITLE
    ],
    [GAME_STATES.SUCCESS_FEEDBACK]: [
      GAME_STATES.PLAYING,
      GAME_STATES.RESULT,
      GAME_STATES.PRACTICE_RESULT,
      GAME_STATES.TITLE
    ],
    [GAME_STATES.MISS_FEEDBACK]: [
      GAME_STATES.PLAYING,
      GAME_STATES.RESULT,
      GAME_STATES.PRACTICE_RESULT,
      GAME_STATES.TITLE
    ],
    [GAME_STATES.RESULT]: [GAME_STATES.SETUP, GAME_STATES.READY, GAME_STATES.TITLE],
    [GAME_STATES.PRACTICE_RESULT]: [GAME_STATES.SETUP, GAME_STATES.READY, GAME_STATES.TITLE]
  };

  return validTransitions[fromState]?.includes(toState) ?? false;
}
