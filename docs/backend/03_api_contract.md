# TakamiyaTypingGame — API Contract Specification

Google Apps Script Web App が提供する HTTP API およびフロントエンド配信のインターフェース仕様です。
クエリパラメータなしの Bare アクセス時は Frontend HTML を配信し、API クエリ時は統一エンベロープ形式の JSON を返却します。

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

## 2. API Operations & Frontend Routing

### 2.0 Bare URL: `GET /exec` (Frontend Delivery)
パラメータなしでアクセスされた場合、Google Apps Script HtmlService によりフロントエンド画面を提供します。

* **Method**: `GET`
* **Response**: `HTML (text/html; charset=utf-8)`
* **Content**: `backend/gas/Index.html`（CSSおよびClient JSバンドル内包）

---

### 2.1 `GET ?op=health`
バックエンドサービスの稼働状態・バージョン・タイムゾーン・現在時刻を確認します。

* **Method**: `GET`
* **Query Parameters**: `op=health`
* **Response `data`**:
  ```json
  {
    "ok": true,
    "data": {
      "service": "TAKAMIYA_TYPING_GAME_BACKEND",
      "schemaVersion": "1.1.0",
      "timezone": "Asia/Tokyo",
      "serverTime": "2026-09-04T17:45:00+09:00"
    }
  }
  ```

---

### 2.2 `GET ?op=getPlayers`
有効化されているプレイヤー（社員）の一覧を取得します。

* **Method**: `GET`
* **Query Parameters**: `op=getPlayers`
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

---

### 2.3 `GET ?op=getRankings`
期間および難易度ごとのランキングを取得します。

* **Method**: `GET`
* **Query Parameters**:
  * `op`: `getRankings`
  * `period`: `monthly` または `allTime` (デフォルト: `monthly`)
  * `difficulty`: `BEGINNER`, `INTERMEDIATE`, `ADVANCED` (デフォルト: `BEGINNER`)
* **Response `data`**:
  ```json
  {
    "ok": true,
    "data": {
      "period": "monthly",
      "difficulty": "BEGINNER",
      "serverTime": "2026-09-04T17:45:00+09:00",
      "totalPlayers": 2,
      "entries": [
        {
          "rank": 1,
          "playerId": "PL-001",
          "playerName": "山田 太郎",
          "score": 18450,
          "accuracy": 98.38,
          "maxCombo": 16,
          "playedAt": "2026-09-04T16:01:30+09:00"
        }
      ]
    }
  }
  ```

---

### 2.4 `POST` (Body: `submitScore`)
本番モード（`PRODUCTION`）終了時のスコアを検証・永続化します。

* **Method**: `POST`
* **Headers**: `Content-Type: text/plain;charset=utf-8` (Simple Request 形式)
* **Request Body**:
  ```json
  {
    "op": "submitScore",
    "data": {
      "submissionId": "SUB-1788392000000-8472",
      "playerName": "山田 太郎",
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
      "startedAt": "2026-09-04T07:00:00.000Z",
      "finishedAt": "2026-09-04T07:01:30.000Z",
      "appVersion": "1.1.0"
    }
  }
  ```

* **初回登録成功レスポンス (200 OK)**:
  ```json
  {
    "ok": true,
    "data": {
      "scoreId": "SC-1788470000123-9182",
      "duplicate": false,
      "playerName": "山田 太郎",
      "score": 18450,
      "difficulty": "INTERMEDIATE",
      "playedAt": "2026-09-04T16:01:30+09:00",
      "player": {
        "playerId": "PL-1788470000000-4821",
        "playerName": "山田 太郎"
      }
    }
  }
  ```

---

## 3. Error Codes Summary

| Code | 発生条件 | 説明 |
| :--- | :--- | :--- |
| `INVALID_REQUEST` | ボディ不正、未知のOperation | リクエスト構造が無効 |
| `MISSING_PARAMETER` | 必須パラメータの欠落 | 必須項目の未指定 |
| `INVALID_PLAYER_NAME` | 空白、空白のみ、または上限（30文字）超過 | プレイヤー名が不正 |
| `PRACTICE_MODE_NOT_RECORDED` | `mode === "PRACTICE"` | 練習モードの保存試行に対する明示的拒否 |
| `INVALID_DIFFICULTY` | 難易度指定不正 | `BEGINNER`, `INTERMEDIATE`, `ADVANCED` 以外 |
| `INVALID_STAGE` | 到達ステージ指定不正 | `GROUND` 〜 `EXTRA` 以外 |
| `PLAYER_DISABLED` | 指定プレイヤーが無効化中 | スプレッドシート上で Enabled が FALSE |
| `NUMERIC_OUT_OF_BOUNDS` | スコア等の数値境界違反 | 負値、上限超過、NaN、Infinity |
| `LOCK_TIMEOUT` | 排他制御ロック取得失敗 | 同時アクセス集中によるタイムアウト |
| `INTERNAL_ERROR` | 予期せぬ実行時エラー | サーバー側内部例外 |
