# Base Typing Game — Backend Architecture & Trust Boundary

## 1. Overview
Base Typing Game のバックエンドは、**Google Spreadsheet** をデータストアとし、**Google Apps Script (GAS) Web App** をAPI層として構築されています。

フロントエンドのゲームプレイ（タイピング判定、タイマー進行、アニメーション描画）はローカル環境で100%自己完結し、バックエンドはスコア永続化および将来のランキング集計・プレイヤーマスターの参照のみを担当します。

```text
[ Browser Client (HTML/JS) ]
         │
         │ (HTTP GET/POST JSON - Phase 8以降で接続)
         ▼
[ Google Apps Script (Web App) ]
   ├── doGet Router (health, getPlayers)
   ├── doPost Router (submitScore)
   ├── Pure Validator & Bounds Check
   ├── LockService (Concurrency & Race Guard)
   └── Formula Injection Sanitizer
         │
         ▼
[ Google Spreadsheet (Database) ]
   ├── Sheet: Players (社員マスター)
   ├── Sheet: Scores (本番スコア永続ログ)
   └── Sheet: Meta (スキーマバージョン管理)
```

---

## 2. Critical Environment Constraint: Google Workspace 非依存

本プロジェクトを運用する部署・会社環境には **Google Workspace (旧 G Suite) 環境が存在しません**。

したがって、以下の前提は一切排除されています：
* Google Workspace Organization ドメインアカウント
* Google Directory API
* Google アカウントによる社員ログイン認証
* Google Group による権限管理

### プレイヤー管理の信頼境界 (Trust Boundary)
* **`PLAYER_SELECTION_IS_NOT_AUTHENTICATION`**:
  * プレイヤー選択は「誰のスコアとして記録するか」を画面上で指定するためのマスター選択であり、暗号論的またはID基盤的な本人認証ではありません。
  * 社内エンターテインメント・部署内利用の前提に立ち、サーバー側でのスキーマ検証、入力値の健全性チェック、二重送信防止、プレイヤーマスター照合を実施します。
  * 存在しないセキュリティを存在するかのように過大評価・誤認させないことを厳格な設計原則とします。

---

## 3. Question Master SSOT の維持

* 正式な問題データSSOTは、引き続きリポジトリ内の `data/questions/takamiya-typing-game-master-v3.csv`（180問）です。
* Google Spreadsheet 側へ180問のコピーを行って二重SSOTを形成することは禁止されており、スプレッドシート側に `Questions` シートは作成しません。

---

## 4. Timezone & Authoritative Server Timestamp

* ランキングおよびスコア記録の正式タイムゾーンは **`Asia/Tokyo` (JST)** です。
* クライアント端末側の時刻（`StartedAtClient`, `FinishedAtClient`）は診断参考情報として記録しますが、月間ランキングの月判定やソートにはサーバー生成タイムスタンプ **`PlayedAtServer`** をAuthoritative（正）として採用します。

---

## 5. Security & Protection Mechanisms

1. **Formula Injection 対策**:
   * スプレッドシートに書き込む文字列の先頭が `=`, `+`, `-`, `@` で始まる場合、自動的に先頭に `'`（シングルクォート）を付加して関数実行を無効化します。
2. **Idempotent Duplicate Protection (二重送信防止)**:
   * クライアントが1ゲームごとに生成する一意の `SubmissionID` を利用し、ネットワークリトライや連打による多重POSTが発生しても、同一 `SubmissionID` のレコードは1件しかINSERTされません。2回目以降は既存の `ScoreID` を含む冪等な成功レスポンス（`duplicate: true`）を返します。
3. **LockService による同時実行制御**:
   * スコア挿入処理は `LockService.getScriptLock()` により排他制御を行い、同時リクエストによるレースコンディションやロストアップデートを防止します。
