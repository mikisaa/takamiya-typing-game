/**
 * Backend Configuration Master
 * Authoritative constants, validation limits, error codes, and schema definitions.
 */

export const BACKEND_CONFIG = {
  SERVICE_NAME: "BASE_TYPING_GAME_BACKEND",
  SCHEMA_VERSION: "1.1.0",
  TIMEZONE: "Asia/Tokyo",

  SHEET_NAMES: {
    PLAYERS: "Players",
    SCORES: "Scores",
    META: "Meta"
  },

  SCHEMAS: {
    PLAYERS_HEADERS: [
      "PlayerID",
      "PlayerName",
      "PlayerNameKey",
      "Enabled",
      "SortOrder",
      "CreatedAt",
      "UpdatedAt"
    ],
    SCORES_HEADERS: [
      "ScoreID",
      "SubmissionID",
      "PlayerID",
      "PlayerNameSnapshot",
      "Difficulty",
      "Score",
      "CorrectCount",
      "TypedCharacters",
      "TypingMistakes",
      "MissCount",
      "Accuracy",
      "MaxCombo",
      "WPM",
      "KPM",
      "ReachedStage",
      "StartedAtClient",
      "FinishedAtClient",
      "PlayedAtServer",
      "AppVersion"
    ],
    META_HEADERS: [
      "Key",
      "Value",
      "UpdatedAt"
    ]
  },

  ALLOWED_MODES: ["PRODUCTION"],
  ALLOWED_DIFFICULTIES: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
  ALLOWED_PERIODS: ["MONTHLY", "ALL_TIME"],
  ALLOWED_STAGES: [
    "GROUND",
    "CONTAINER",
    "HOUSE",
    "BUILDING",
    "HIGHRISE",
    "TOKYO_TOWER",
    "SKYTREE",
    "EXTRA"
  ],

  LIMITS: {
    MIN_SCORE: 0,
    MAX_SCORE: 500000,
    MIN_CORRECT_COUNT: 0,
    MAX_CORRECT_COUNT: 1000,
    MIN_TYPED_CHARACTERS: 0,
    MAX_TYPED_CHARACTERS: 20000,
    MIN_TYPING_MISTAKES: 0,
    MAX_TYPING_MISTAKES: 2000,
    MIN_MISS_COUNT: 0,
    MAX_MISS_COUNT: 1000,
    MIN_ACCURACY: 0.0,
    MAX_ACCURACY: 100.0,
    MIN_MAX_COMBO: 0,
    MAX_MAX_COMBO: 1000,
    MIN_WPM: 0.0,
    MAX_WPM: 500.0,
    MIN_KPM: 0.0,
    MAX_KPM: 3000.0,
    MAX_PLAYER_NAME_LENGTH: 30,
    DEFAULT_RANKING_LIMIT: 10,
    MIN_RANKING_LIMIT: 1,
    MAX_RANKING_LIMIT: 100,
    LOCK_TIMEOUT_MS: 10000
  },

  ERROR_CODES: {
    INVALID_REQUEST: "INVALID_REQUEST",
    MISSING_PARAMETER: "MISSING_PARAMETER",
    INVALID_PLAYER_NAME: "INVALID_PLAYER_NAME",
    PRACTICE_MODE_NOT_RECORDED: "PRACTICE_MODE_NOT_RECORDED",
    INVALID_DIFFICULTY: "INVALID_DIFFICULTY",
    INVALID_PERIOD: "INVALID_PERIOD",
    INVALID_LIMIT: "INVALID_LIMIT",
    INVALID_STAGE: "INVALID_STAGE",
    PLAYER_NOT_FOUND: "PLAYER_NOT_FOUND",
    PLAYER_DISABLED: "PLAYER_DISABLED",
    NUMERIC_OUT_OF_BOUNDS: "NUMERIC_OUT_OF_BOUNDS",
    DUPLICATE_SUBMISSION: "DUPLICATE_SUBMISSION",
    LOCK_TIMEOUT: "LOCK_TIMEOUT",
    CONFIG_ERROR: "CONFIG_ERROR",
    INTERNAL_ERROR: "INTERNAL_ERROR"
  }
};
