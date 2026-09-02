/**
 * Game Configuration Master (GAME_CONFIG)
 * Centralizes all deterministic game balance, timing, difficulty, and progression parameters.
 * Reference: docs/02_spec.md Section 8
 */
export const GAME_CONFIG = {
  // Global Game Timer settings (Production mode)
  globalGameTimeSeconds: 90,
  maxTimeBonusTotal: 30,
  timeBonusPerCombo: 5,
  comboThresholdForBonus: 15,
  practiceMultiplier: 1.5,
  topRankingLimit: 20,

  // Difficulty specific parameters for Dynamic Timing Model and vehicle themes
  difficulties: {
    beginner: {
      id: "beginner",
      displayName: "初級",
      vehicleName: "軽トラック",
      targetKps: 2.0,
      reactionAllowance: 3.0,
      minAllowedTime: 4.0,
      maxAllowedTime: 12.0,
      missPenaltySeconds: 3,
      materialTypes: ["scaffold_shichu", "scaffold_tesuri", "scaffold_jackbase"]
    },
    intermediate: {
      id: "intermediate",
      displayName: "中級",
      vehicleName: "4tユニック",
      targetKps: 3.2,
      reactionAllowance: 2.0,
      minAllowedTime: 3.5,
      maxAllowedTime: 14.0,
      missPenaltySeconds: 4,
      materialTypes: ["scaffold_shichu", "scaffold_tesuri", "scaffold_tatewaku", "scaffold_nunoita", "scaffold_sujikai"]
    },
    advanced: {
      id: "advanced",
      displayName: "上級",
      vehicleName: "15tユニック",
      targetKps: 4.5,
      reactionAllowance: 1.5,
      minAllowedTime: 5.0,
      maxAllowedTime: 20.0,
      missPenaltySeconds: 5,
      materialTypes: [
        "scaffold_shichu",
        "scaffold_tesuri",
        "scaffold_tatewaku",
        "scaffold_nunoita",
        "scaffold_sujikai",
        "scaffold_jackbase",
        "scaffold_palette"
      ]
    }
  },

  // Background Construction Progression Steps
  backgroundProgression: [
    { step: 1, name: "更地", requiredCount: 0 },
    { step: 2, name: "コンテナ", requiredCount: 3 },
    { step: 3, name: "家", requiredCount: 7 },
    { step: 4, name: "ビル", requiredCount: 12 },
    { step: 5, name: "高層ビル", requiredCount: 18 },
    { step: 6, name: "東京タワー", requiredCount: 25 },
    { step: 7, name: "スカイツリー", requiredCount: 33 }
  ],

  // EXTRA Stage Event Configurations
  extraEvents: {
    maxConcurrentObjects: 3,
    spawnIntervalMs: 4000
  }
};
