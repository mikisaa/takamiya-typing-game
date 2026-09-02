import { GAME_CONFIG } from "../config/gameConfig.js";

export const BACKGROUND_STAGES = {
  GROUND: "GROUND",
  CONTAINER: "CONTAINER",
  HOUSE: "HOUSE",
  BUILDING: "BUILDING",
  HIGHRISE: "HIGHRISE",
  TOKYO_TOWER: "TOKYO_TOWER",
  SKYTREE: "SKYTREE",
  EXTRA: "EXTRA"
};

const STAGE_KEY_MAP = {
  1: BACKGROUND_STAGES.GROUND,
  2: BACKGROUND_STAGES.CONTAINER,
  3: BACKGROUND_STAGES.HOUSE,
  4: BACKGROUND_STAGES.BUILDING,
  5: BACKGROUND_STAGES.HIGHRISE,
  6: BACKGROUND_STAGES.TOKYO_TOWER,
  7: BACKGROUND_STAGES.SKYTREE
};

/**
 * Returns current background progression stage info based on cumulative correct count.
 * @param {number} correctCount
 * @param {object} [config=GAME_CONFIG]
 * @returns {{ step: number, stageKey: string, displayName: string, isExtra: boolean, progressToNext: number }}
 */
export function getBackgroundStage(correctCount = 0, config = GAME_CONFIG) {
  const steps = config?.backgroundProgression || GAME_CONFIG.backgroundProgression;
  const count = Math.max(0, correctCount);

  let currentStep = steps[0];
  let nextStep = steps[1] || null;

  for (let i = steps.length - 1; i >= 0; i--) {
    if (count >= steps[i].requiredCount) {
      currentStep = steps[i];
      nextStep = steps[i + 1] || null;
      break;
    }
  }

  const isExtra = currentStep.step === 7 && count >= currentStep.requiredCount;
  const stageKey = isExtra && count > currentStep.requiredCount ? BACKGROUND_STAGES.EXTRA : (STAGE_KEY_MAP[currentStep.step] || BACKGROUND_STAGES.GROUND);

  // Progress percentage toward next step (0 to 100)
  let progressToNext = 100;
  if (nextStep) {
    const range = nextStep.requiredCount - currentStep.requiredCount;
    const currentInRange = count - currentStep.requiredCount;
    progressToNext = range > 0 ? Math.min(100, Math.round((currentInRange / range) * 100)) : 100;
  }

  return {
    step: currentStep.step,
    stageKey,
    displayName: currentStep.name + (stageKey === BACKGROUND_STAGES.EXTRA ? " (EXTRA)" : ""),
    isExtra,
    progressToNext
  };
}

/**
 * Determines whether EXTRA stage mode is active.
 * @param {number} correctCount
 * @param {object} [config=GAME_CONFIG]
 * @returns {boolean}
 */
export function isExtraStage(correctCount = 0, config = GAME_CONFIG) {
  const steps = config?.backgroundProgression || GAME_CONFIG.backgroundProgression;
  const skytreeStep = steps.find((s) => s.step === 7);
  const threshold = skytreeStep ? skytreeStep.requiredCount : 33;
  return correctCount >= threshold;
}
