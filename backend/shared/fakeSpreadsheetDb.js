import { BACKEND_CONFIG } from "./backendConfig.js";

/**
 * In-Memory Fake Database simulating Google Spreadsheet & LockService.
 * Used for deterministic automated unit and integration tests without network I/O.
 */
export class FakeSpreadsheetDb {
  constructor(initialData = {}) {
    this.players = initialData.players ? [...initialData.players] : [];
    this.scores = initialData.scores ? [...initialData.scores] : [];
    this.meta = initialData.meta ? { ...initialData.meta } : {
      SchemaVersion: BACKEND_CONFIG.SCHEMA_VERSION,
      AppVersion: "1.0.0",
      CreatedAt: new Date().toISOString()
    };
    this.isLocked = false;
  }

  // LockService Simulation
  acquireLock(timeoutMs = 10000) {
    if (this.isLocked) {
      return false;
    }
    this.isLocked = true;
    return true;
  }

  releaseLock() {
    this.isLocked = false;
  }

  // Players Operations
  getPlayers() {
    return this.players
      .filter((p) => p.Enabled === true || p.Enabled === "TRUE" || p.Enabled === 1)
      .sort((a, b) => {
        const orderA = a.SortOrder ?? 999;
        const orderB = b.SortOrder ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return String(a.PlayerName).localeCompare(String(b.PlayerName));
      })
      .map((p) => ({
        playerId: p.PlayerID,
        playerName: p.PlayerName
      }));
  }

  findPlayerById(playerId) {
    return this.players.find((p) => p.PlayerID === playerId) || null;
  }

  addPlayer(player) {
    this.players.push({
      PlayerID: player.PlayerID,
      PlayerName: player.PlayerName,
      Enabled: player.Enabled ?? true,
      SortOrder: player.SortOrder ?? (this.players.length + 1),
      CreatedAt: player.CreatedAt || new Date().toISOString(),
      UpdatedAt: player.UpdatedAt || new Date().toISOString()
    });
  }

  // Scores Operations
  findScoreBySubmissionId(submissionId) {
    return this.scores.find((s) => s.SubmissionID === submissionId) || null;
  }

  appendScore(scoreRecord) {
    this.scores.push({ ...scoreRecord });
  }

  getAllScores() {
    return [...this.scores];
  }

  // Meta Operations
  getMeta(key) {
    return this.meta[key] || null;
  }

  setMeta(key, value) {
    this.meta[key] = value;
  }
}
