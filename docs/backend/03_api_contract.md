# Base Typing Game — API Contract Specification

Google Apps Script Web App が提供する HTTP API のインターフェース仕様です。
すべてのレスポンスは統一エンベロープ形式の JSON で返却されます。

---

## 1. Unified Response Envelopes

### 成功時 (Success)
```json
{
  "ok": true,
  "data": {
    /* 操作ごとの返却データ */
  }
}
```

### 失敗時 (Failure)
```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human readable error description."
  }
}
```

---

## 2. API Operations

### 2.1 `GET ?op=health`
バックエンドサービスの稼働状態・バージョン・タイムゾーン・現在時刻を確認します。

* **Method**: `GET`
* **Query Parameters**:
  * `op`: `health` (未指定時のデフォルト)
* **Response `data`**:
  ```json
  {
    "ok": true,
    "data": {
      "service": "BASE_TYPING_GAME_BACKEND",
      "schemaVersion": "1.0.0",
      "timezone": "Asia/Tokyo",
      "serverTime": "2026-09-03T17:45:00+09:00"
    }
  }
  ```

---

### 2.2 `GET ?op=getPlayers`
有効化されているプレイヤー（社員）の一覧を取得します。

* **Method**: `GET`
* **Query Parameters**:
  * `op`: `getPlayers`
* **Response `data`**:
  ```json
  {
    "ok": true,
    "data": {
      "players": [
        {
          "playerId": "P001",
          "playerName": "佐藤 健一"
        },
        {
          "playerId": "P002",
          "playerName": "鈴木 一郎"
        }
      ]
    }
  }
  ```
* **仕様備考**:
  * `Enabled === true` のプレイヤーのみが返却されます。
  * `SortOrder` 昇順、同一順位の場合は `PlayerName` 昇順でソートされます。
  * 内部行番号や更新日時などのメタデータは含まれません。

---

### 2.3 `POST` (Body: `submitScore`)
本番モード（`PRODUCTION`）終了時のスコアを検証・永続化します。

* **Method**: `POST`
* **Transport Contract (Browser Cross-Origin Safe)**:
  * **Headers**: `Content-Type: text/plain;charset=utf-8` (推奨)
  * **Note**: Google Apps Script Web App はブラウザの CORS preflight (`OPTIONS` リクエスト) に対応していません。そのため、ブラウザからの通信時は `Content-Type: text/plain;charset=utf-8` を指定して Simple Request として送信します。GAS 側の `doPost(e)` は `e.postData.contents` から生 JSON をパースするため、同一のセマンティクスで 302 リダイレクトを経由し、ブラウザ側でレスポンス JSON を直接読み取ることができます。
* **Request Body**:
  ```json
  {
    "op": "submitScore",
    "data": {
      "submissionId": "SUB-1788392000000-8472",
      "playerId": "P001",
      "mode": "PRODUCTION",
      "difficulty": "INTERMEDIATE",
      "score": 18450,
      "correctCount": 22,
      "typedCharacters": 185,
      "typingMistakes": 3,
      "missCount": 1,
      "accuracy": 98.38,
      "maxCombo": 16,
      "wpm": 38.5,
      "kpm": 192.5,
      "reachedStage": "HIGHRISE",
      "startedAt": "2026-09-03T00:00:00.000Z",
      "finishedAt": "2026-09-03T00:01:30.000Z",
      "appVersion": "1.0.0"
    }
  }
  ```

* **初回登録成功レスポンス (200 OK)**:
  ```json
  {
    "ok": true,
    "data": {
      "scoreId": "SC-1788392000123-9182",
      "duplicate": false,
      "playerName": "佐藤 健一",
      "score": 18450,
      "difficulty": "INTERMEDIATE",
      "playedAt": "2026-09-03T18:01:30+09:00"
    }
  }
  ```

* **重複送信時 (Idempotent Duplicate Response)**:
  同一 `submissionId` が再送された場合、二重挿入は行わず初回の `scoreId` を返します。
  ```json
  {
    "ok": true,
    "data": {
      "duplicate": true,
      "scoreId": "SC-1788392000123-9182",
      "submissionId": "SUB-1788392000000-8472",
      "message": "Score with this submissionId already recorded."
    }
  }
  ```

---

## 3. Error Codes Summary

| Code | 発生条件 | 説明 |
| :--- | :--- | :--- |
| `INVALID_REQUEST` | ボディ不正、未知のOperation | リクエスト構造が無効 |
| `MISSING_PARAMETER` | 必須パラメータの欠落 | 必須項目の未指定 |
| `PRACTICE_MODE_NOT_RECORDED` | `mode === "PRACTICE"` | 練習モードの保存試行に対する明示的拒否 |
| `INVALID_DIFFICULTY` | 難易度指定不正 | `BEGINNER`, `INTERMEDIATE`, `ADVANCED` 以外 |
| `INVALID_STAGE` | 到達ステージ指定不正 | `GROUND` 〜 `EXTRA` 以外 |
| `PLAYER_NOT_FOUND` | 指定PlayerIDが未登録 | Playersマスターに該当なし |
| `PLAYER_DISABLED` | 指定PlayerIDが無効化中 | 有効フラグがFALSE |
| `NUMERIC_OUT_OF_BOUNDS` | スコア等の数値境界違反 | 負値、上限超過、NaN、Infinity |
| `LOCK_TIMEOUT` | 排他制御ロック取得失敗 | 同時アクセス集中によるタイムアウト |
| `INTERNAL_ERROR` | 予期せぬ実行時エラー | サーバー側内部例外 |
