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
 * Audited for Phase 4:
 * Count 33: SKYTREE (completed landmark state, isExtra: false)
 * Count 34+: EXTRA (isExtra: true)
 *
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

  // Phase 4 Audit: Skytree completes at 33. EXTRA begins strictly at 34+.
  const isExtra = count >= 34;
  const stageKey = isExtra ? BACKGROUND_STAGES.EXTRA : (STAGE_KEY_MAP[currentStep.step] || BACKGROUND_STAGES.GROUND);

  // Progress percentage toward next step (0 to 100)
  let progressToNext = 100;
  if (nextStep) {
    const range = nextStep.requiredCount - currentStep.requiredCount;
    const currentInRange = count - currentStep.requiredCount;
    progressToNext = range > 0 ? Math.min(100, Math.round((currentInRange / range) * 100)) : 100;
  }

  let displayName = currentStep.name;
  if (stageKey === BACKGROUND_STAGES.EXTRA) {
    displayName += " (EXTRA)";
  } else if (currentStep.step === 7 && count >= 33) {
    displayName += " (完成)";
  }

  return {
    step: isExtra ? 8 : currentStep.step,
    stageKey,
    displayName,
    isExtra,
    progressToNext
  };
}

/**
 * Determines whether EXTRA stage mode is active (strictly 34+ correct).
 * @param {number} correctCount
 * @returns {boolean}
 */
export function isExtraStage(correctCount = 0) {
  return correctCount >= 34;
}

/**
 * Returns detailed progressive construction sub-steps for each building
 * @param {number} correctCount
 * @returns {{
 *   stageKey: string,
 *   isExtra: boolean,
 *   groundStep: number,
 *   containerStep: number,
 *   houseStep: number,
 *   buildingStep: number,
 *   highriseStep: number,
 *   tokyoTowerStep: number,
 *   skytreeStep: number,
 *   constructionProgress: number
 * }}
 */
export function getConstructionDetails(correctCount = 0) {
  const count = Math.max(0, correctCount);
  const baseStage = getBackgroundStage(count);

  // Ground markers (0 to 2)
  const groundStep = Math.min(2, count);

  // Container (starts at 3, completes by 6)
  const containerStep = count < 3 ? 0 : Math.min(3, count - 3);

  // House (starts at 7, completes by 11)
  const houseStep = count < 7 ? 0 : Math.min(4, count - 7);

  // Building (starts at 12, completes by 17)
  const buildingStep = count < 12 ? 0 : Math.min(5, count - 12);

  // Highrise (starts at 18, completes by 24)
  const highriseStep = count < 18 ? 0 : Math.min(6, count - 18);

  // Tokyo Tower (starts at 25, completes by 32)
  const tokyoTowerStep = count < 25 ? 0 : Math.min(7, count - 25);

  // Skytree (starts at 33, completes at 33)
  const skytreeStep = count < 33 ? 0 : 8;

  // Monotonic stage construction progress within current active stage
  let constructionProgress = 0;
  if (count < 3) {
    constructionProgress = count / 2;
  } else if (count < 7) {
    constructionProgress = (count - 3) / 3;
  } else if (count < 12) {
    constructionProgress = (count - 7) / 4;
  } else if (count < 18) {
    constructionProgress = (count - 12) / 5;
  } else if (count < 25) {
    constructionProgress = (count - 18) / 6;
  } else if (count < 33) {
    constructionProgress = (count - 25) / 7;
  } else {
    constructionProgress = 1.0;
  }

  return {
    correctCount: count,
    stageKey: baseStage.stageKey,
    displayName: baseStage.displayName,
    step: baseStage.step,
    isExtra: baseStage.isExtra,
    groundStep,
    containerStep,
    houseStep,
    buildingStep,
    highriseStep,
    tokyoTowerStep,
    skytreeStep,
    constructionProgress: Number(constructionProgress.toFixed(2))
  };
}
