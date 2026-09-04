# TakamiyaTypingGame — Backend Architecture & Trust Boundary

## 1. Overview
TakamiyaTypingGame のバックエンドは、**Google Spreadsheet** (`TakamiyaTypingGame DB`) をデータストアとし、**Google Apps Script (GAS) Web App** をフロントエンド配信（HtmlService）およびAPI層として構築されています。

フロントエンドのゲームプレイ（タイピング判定、タイマー進行、アニメーション描画）はローカル環境で100%自己完結し、バックエンドはフロントエンドHTMLの配信、スコア永続化、およびランキング集計・プレイヤーマスターの参照を担当します。

```text
[ Browser Client (HTML/JS) ]
         │
         │ (HTTP GET/POST JSON & HtmlService)
         ▼
[ Google Apps Script (Web App) ]
   ├── doGet Router (Bare: Frontend HtmlService / op: health, getPlayers, getRankings)
   ├── doPost Router (submitScore)
   ├── Pure Validator & Bounds Check
   ├── LockService (Concurrency & Race Guard)
   └── Formula Injection Sanitizer
         │
         ▼
[ Google Spreadsheet: TakamiyaTypingGame DB ]
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
* **`PLAYER_NAME_IS_NOT_AUTHENTICATION`**:
  * プレイヤー名入力は「誰のスコアとして記録するか」を画面上で指定するための自由入力表示名であり、パスワードやPIN、Googleアカウント等による暗号論的またはID基盤的な本人認証ではありません。
* **`SAME_NORMALIZED_NAME_MEANS_SAME_PLAYER`**:
  * 別ブラウザ・別PCからであっても、正規化後の `PlayerNameKey` が一致するプレイヤー名は同一Playerとして扱われ、同一の `PlayerID` に紐付けられます。同姓同名の別人が存在する場合も意図的仕様として同一Playerとして集約されます。
* **`LOCAL_STORAGE_NAME_IS_NOT_A_CREDENTIAL`**:
  * クライアント側 `localStorage`（キー: `ttg.lastPlayerName.v1`）に保存される前回プレイヤー名は利便性のためのプレフィル記憶（UX改善）であり、トークンやクレデンシャル、パスワードではありません。共有PCではいつでも他者名に上書き・編集可能です。
* **サーバー側保護原則**:
  * 存在しない本人確認機能を報告・過大評価せず、サーバー側でのスキーマ検証、入力長制限、Formula Injection対策、二重送信防止、および `LockService` 排他制御によってデータの健全性を担保します。

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

---

## 6. Deployment Security Classification & Trust Model

* **`ANONYMOUS_WEB_APP_ENDPOINT`**:
  * 組織内に Google Workspace ドメインが存在しないため、Web App のアクセス権限は「全員 (Anyone)」として公開デプロイされています。
  * このエンドポイントは Google がホストするパブリック到達可能な URL であり、社内 LAN / Tailnet 専用ではありません。
* **`WEB_APP_URL_IS_NOT_A_SECRET`**:
  * Web App URL 自体を秘密情報（Secret）として扱わず、クライアント側に難読化や隠蔽でセキュリティを持たせることはしません。
  * サーバーサイドでの厳格な入力値バリデーション、異常値・負値拒否、プレイヤーマスター存在照合、および `SubmissionID` 冪等性によって安全性を担保します。
