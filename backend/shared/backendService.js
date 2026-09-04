import { BACKEND_CONFIG } from "./backendConfig.js";
import { validateSubmitScoreRequest, validateGetRankingsQuery } from "./backendValidator.js";
import { aggregateRankings } from "./rankingCore.js";

/**
 * Backend Service Orchestrator
 * Encapsulates the core business and validation workflow independent of GAS runtime.
 */
export class BackendService {
  constructor(db) {
    this.db = db;
  }

  health() {
    return {
      ok: true,
      data: {
        service: BACKEND_CONFIG.SERVICE_NAME,
        schemaVersion: BACKEND_CONFIG.SCHEMA_VERSION,
        timezone: BACKEND_CONFIG.TIMEZONE,
        serverTime: new Date().toISOString()
      }
    };
  }

  getPlayers() {
    try {
      const players = this.db.getPlayers();
      return {
        ok: true,
        data: {
          players
        }
      };
    } catch (err) {
      return {
        ok: false,
        error: {
          code: BACKEND_CONFIG.ERROR_CODES.INTERNAL_ERROR,
          message: "Failed to retrieve players."
        }
      };
    }
  }

  getRankings(queryParams = {}) {
    const valResult = validateGetRankingsQuery(queryParams);
    if (!valResult.valid) {
      return {
        ok: false,
        error: {
          code: valResult.code,
          message: valResult.message
        }
      };
    }

    const { sanitized } = valResult;
    let targetPlayerId = null;
    if (sanitized.playerNameKey) {
      const playerRecord = this.db.findPlayerByNameKey(sanitized.playerNameKey);
      if (playerRecord) {
        targetPlayerId = playerRecord.PlayerID;
      }
    }

    const allScores = this.db.getAllScores();
    const allPlayers = this.db.players || [];

    const rankingData = aggregateRankings(allScores, allPlayers, {
      period: sanitized.period,
      difficulty: sanitized.difficulty,
      limit: sanitized.limit,
      targetPlayerId: targetPlayerId,
      currentMonthKey: queryParams.currentMonthKey
    });

    return {
      ok: true,
      data: rankingData
    };
  }

  submitScore(requestData) {
    const { ERROR_CODES, LIMITS } = BACKEND_CONFIG;

    // 1. Validate payload syntax, types, and metric limits
    const valResult = validateSubmitScoreRequest(requestData);
    if (!valResult.valid) {
      return {
        ok: false,
        error: {
          code: valResult.code,
          message: valResult.message
        }
      };
    }

    const { sanitized } = valResult;

    // 2. Early Idempotent Duplicate Check
    const existingBeforeLock = this.db.findScoreBySubmissionId(sanitized.submissionId);
    if (existingBeforeLock) {
      return {
        ok: true,
        data: {
          duplicate: true,
          scoreId: existingBeforeLock.ScoreID,
          submissionId: existingBeforeLock.SubmissionID,
          message: "Score with this submissionId already recorded."
        }
      };
    }

    // 3. Concurrency Locking
    const lockAcquired = this.db.acquireLock(LIMITS.LOCK_TIMEOUT_MS);
    if (!lockAcquired) {
      return {
        ok: false,
        error: {
          code: ERROR_CODES.LOCK_TIMEOUT,
          message: "Server busy. Could not acquire lock for score submission."
        }
      };
    }

    try {
      // 4. Idempotent Re-Check Under Lock
      const existingInLock = this.db.findScoreBySubmissionId(sanitized.submissionId);
      if (existingInLock) {
        return {
          ok: true,
          data: {
            duplicate: true,
            scoreId: existingInLock.ScoreID,
            submissionId: existingInLock.SubmissionID,
            message: "Score with this submissionId already recorded."
          }
        };
      }

      // 5. Player Resolution & Auto-Creation Under Lock
      let player = this.db.findPlayerByNameKey(sanitized.playerNameKey);
      if (player) {
        // Validate if enabled
        const isEnabled = player.Enabled === true || player.Enabled === "TRUE" || player.Enabled === 1;
        if (!isEnabled) {
          return {
            ok: false,
            error: {
              code: ERROR_CODES.PLAYER_DISABLED,
              message: `Player '${player.PlayerName}' is disabled.`
            }
          };
        }
      } else {
        // Auto-create new player
        player = this.db.createPlayer(sanitized.rawPlayerName, sanitized.playerNameKey);
      }

      // 6. Generate Server-Authoritative ScoreID & Timestamp
      const scoreId = `SC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const playedAtServer = new Date().toISOString();

      // 7. Construct authoritative row
      const scoreRecord = {
        ScoreID: scoreId,
        SubmissionID: sanitized.submissionId,
        PlayerID: player.PlayerID,
        PlayerNameSnapshot: player.PlayerName, // Server-resolved canonical snapshot
        Difficulty: sanitized.difficulty,
        Score: sanitized.score,
        CorrectCount: sanitized.correctCount,
        TypedCharacters: sanitized.typedCharacters,
        TypingMistakes: sanitized.typingMistakes,
        MissCount: sanitized.missCount,
        Accuracy: sanitized.accuracy,
        MaxCombo: sanitized.maxCombo,
        WPM: sanitized.wpm,
        KPM: sanitized.kpm,
        ReachedStage: sanitized.reachedStage,
        StartedAtClient: sanitized.startedAtClient,
        FinishedAtClient: sanitized.finishedAtClient,
        PlayedAtServer: playedAtServer,
        AppVersion: sanitized.appVersion
      };

      // 8. Append Row
      this.db.appendScore(scoreRecord);

      // 9. Success response
      return {
        ok: true,
        data: {
          scoreId: scoreId,
          duplicate: false,
          playerName: player.PlayerName,
          score: sanitized.score,
          difficulty: sanitized.difficulty,
          playedAt: playedAtServer,
          player: {
            playerId: player.PlayerID,
            playerName: player.PlayerName
          }
        }
      };
    } finally {
      // 10. Always release lock
      this.db.releaseLock();
    }
  }
}
