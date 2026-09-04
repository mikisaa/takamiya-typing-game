# 10_tasks.md — 実装タスク一覧

本ドキュメントは、本プロジェクトの実装・検証・レビュー・完了に至る全ライフサイクルタスクを定義します。
v1.1.0 現在、全タスクが完了し `[COMPLETED]` です。

---

## 1. 準備フェーズ (Preflight Phase)

- [TASK-001] 開発環境 & プロジェクトベース構成の準備 @antigravity [LIFECYCLE:PREFLIGHT] [COMPLETED]
  - ディレクトリ構造の整備、初期 `index.html` およびベースCSSトークン定義の準備

---

## 2. 実装フェーズ (Implementation Phase @antigravity)

- [TASK-002] Question Master v3 ローダー & 動的走行時間モデル設定の実装 @antigravity [LIFECYCLE:IMPLEMENTATION] [COMPLETED]
  - `data/questions/takamiya-typing-game-master-v3.csv`（全180問）のデータローダー（`src/data/defaultQuestions.js`）の実装
  - `src/config/gameConfig.js`（文字数連動走行時間算出式、難易度別KPS/余裕秒数等）の実装

- [TASK-003] タイピング入力 & 動的ローマ字揺れ・ASCII混在語判定エンジンの実装 @antigravity [LIFECYCLE:IMPLEMENTATION] [COMPLETED]
  - `src/engine/typingMatcher.js`（Keydown直接捕捉、Reading基準の複数ローマ字受理等）の実装

- [TASK-004] 2Dゲームループ & 2種タイマー・スコア・コンボ制御エンジンの実装 @antigravity [LIFECYCLE:IMPLEMENTATION] [COMPLETED]
  - `src/engine/gameEngine.js`（`requestAnimationFrame` 60fpsループ、Global Game Timer [90s]等）の実装

- [TASK-005] 難易度・モード選択 & 画面UIレイアウトの実装 @antigravity [LIFECYCLE:IMPLEMENTATION] [COMPLETED]
  - `src/index.html` & `src/index.css` & `src/main.js`（タイトル画面、設定画面、リザルト画面等）の実装

- [TASK-006] Pixel Artスプライト & 動的速度走行・積込・接触アニメーションの実装 @antigravity [LIFECYCLE:IMPLEMENTATION] [COMPLETED]
  - `src/assets/pixelSprites.js`（軽トラ・4tユニック・15tユニック、7種資材）の実装

- [TASK-007] 背景建設発展 & EXTRAステージ動的演出の実装 @antigravity [LIFECYCLE:IMPLEMENTATION] [COMPLETED]
  - `src/assets/extraEffects.js`（更地〜スカイツリーの7段階成長、EXTRA動的演出）の実装

- [TASK-008] GASバックエンド & スプレッドシートDAO・APIクライアントの実装 @antigravity [LIFECYCLE:IMPLEMENTATION] [COMPLETED]
  - `backend/gas/*.gs`（`doGet`, `doPost`, LockService排他制御、数式エスケープ）の実装

---

## 3. テストフェーズ (Test & Verification Phase)

- [TASK-009] タイピング判定・ASCII混在語・動的Timingモデル単体テスト @antigravity [LIFECYCLE:TEST] [COMPLETED]
- [TASK-010] アニメーション制御 & 2種タイマー状態遷移テスト @antigravity [LIFECYCLE:TEST] [COMPLETED]
- [TASK-011] GAS API & スプレッドシート連携・排他制御テスト @antigravity [LIFECYCLE:TEST] [COMPLETED]

---

## 4. コードレビューフェーズ (Code Review Phase @codex)

- [TASK-012] Codex CLI による独立コード品質・セキュリティ監査 @codex [LIFECYCLE:REVIEW] [COMPLETED]

---

## 5. 指摘修正フェーズ (Fix & Refactor Phase @antigravity)

- [TASK-013] レビュー指摘事項の是正・リファクタリング @antigravity [LIFECYCLE:FIX] [COMPLETED]

---

## 6. 受入検証フェーズ (Acceptance Phase)

- [TASK-014] ブラウザUI結合 & 全体受入シナリオ検証 @antigravity [LIFECYCLE:ACCEPTANCE] [COMPLETED]

---

## 7. 完了・リリース準備フェーズ (Completion Phase)

- [TASK-015] 実装ログ記録 & ドキュメント最終同期 (v1.0.0) @antigravity [LIFECYCLE:COMPLETION] [COMPLETED]

---

## 8. Phase 12: v1.1.0 GAS フロントエンド移行 & リブランディング (Phase 12 Tasks)

- [TASK-016] 全面リブランディング & localStorage移行の実装 @antigravity [LIFECYCLE:IMPLEMENTATION] [COMPLETED]
  - `TakamiyaTypingGame` / `TAKAMIYA TYPING GAME` / `TTG` への名称変更、`ttg.lastPlayerName.v1` への安全移行

- [TASK-017] 自作ピクセルインラインSVGアイコンの実装 @antigravity [LIFECYCLE:IMPLEMENTATION] [COMPLETED]
  - `src/visual/pixel/uiIconsSvg.js` の作成、モードカード、ランキング、ステージ、SUCCESS/MISS、リザルト指標への適用

- [TASK-018] 15tトラック上方補正 & 難易度別MISS資材落下ジオメトリの実装 @antigravity [LIFECYCLE:IMPLEMENTATION] [COMPLETED]
  - `TRUCK_METADATA` の `CRANE_15T.visualYOffset = -6`、各難易度の `missDrop` パラメータ定義とアニメーション連動

- [TASK-019] 決定論的GASフロントエンドビルドスクリプトの実装 @antigravity [LIFECYCLE:IMPLEMENTATION] [COMPLETED]
  - `scripts/buildGasFrontend.js`（esbuild バンドラー、CSS インライン化、Index.html テンプレート生成）の作成

- [TASK-020] GAS Web App doGet ルーティング & クラウドデプロイ @antigravity [LIFECYCLE:DEPLOY] [COMPLETED]
  - `backend/gas/Code.gs` の `doGet` ルーター更新、clasp push、GASプロジェクト名・スプレッドシート名更新、Web App v12 デプロイ

- [TASK-021] 実機ブラウザ E2E & リグレッションテスト検証 @antigravity [LIFECYCLE:ACCEPTANCE] [COMPLETED]
  - 907件ローカルテスト全件PASS、70件実GASエンドポイントテスト全件PASS、実機E2E受入検証完了
