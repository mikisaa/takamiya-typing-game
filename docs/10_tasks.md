# 10_tasks.md — 実装タスク一覧

本ドキュメントは、本プロジェクトの実装・検証・レビュー・完了に至る全ライフサイクルタスクを定義します。

---

## 1. 準備フェーズ (Preflight Phase)

- [TASK-001] 開発環境 & プロジェクトベース構成の準備 @antigravity [LIFECYCLE:PREFLIGHT]
  - ディレクトリ構造（`data/questions/`, `src/`, `src/engine/`, `src/assets/`, `src/services/`, `src/config/`, `src/gas/`）の整備
  - 静的配信用の初期 `index.html` およびベースCSSトークン定義の準備

---

## 2. 実装フェーズ (Implementation Phase @antigravity)

- [TASK-002] Question Master v3 ローダー & 動的走行時間モデル設定の実装 ([FR-014], [FR-016]) @antigravity [LIFECYCLE:IMPLEMENTATION]
  - `data/questions/takamiya-typing-game-master-v3.csv`（全180問）のデータローダー（`src/data/defaultQuestions.js`）の実装
  - `src/config/gameConfig.js`（文字数連動走行時間算出式、難易度別KPS/余裕秒数、Global Timer、ボーナス・ペナルティ設定）の実装

- [TASK-003] タイピング入力 & 動的ローマ字揺れ・ASCII混在語判定エンジンの実装 ([FR-002]) @antigravity [LIFECYCLE:IMPLEMENTATION]
  - `src/engine/typingMatcher.js`（Keydown直接捕捉、Reading基準の複数ローマ字受理、英数混在語のcase-insensitive判定、ミスタイプ検知）の実装

- [TASK-004] 2Dゲームループ & 2種タイマー・スコア・コンボ制御エンジンの実装 ([FR-001], [FR-010], [FR-011]) @antigravity [LIFECYCLE:IMPLEMENTATION]
  - `src/engine/gameEngine.js`（`requestAnimationFrame` 60fpsループ、Global Game Timer [90s]、Per-Question Forklift Timer、COMBO加算、TIME BONUS、スコア計算、リザルト生成）の実装

- [TASK-005] 難易度・モード選択 & 画面UIレイアウトの実装 ([FR-005], [FR-006], [FR-013]) @antigravity [LIFECYCLE:IMPLEMENTATION]
  - `src/index.html` & `src/index.css` & `src/main.js`（タイトル画面、設定・プレイヤー選択、ゲーム画面、リザルト画面、ランキング画面、UI遷移ルーティング）の実装

- [TASK-006] Pixel Artスプライト & 動的速度走行・積込・接触アニメーションの実装 ([FR-003], [FR-004], [FR-007]) @antigravity [LIFECYCLE:IMPLEMENTATION]
  - `src/assets/pixelSprites.js`（軽トラ・4tユニック・15tユニック、7種足場資材、フォークリフト）の実装
  - `src/engine/animationController.js`（動的走行時間連動の等速走行、SUCCESS積込アニメーション、MISS振動・資材落下アニメーション）の実装

- [TASK-007] 背景建設発展 & EXTRAステージ動的演出の実装 ([FR-008], [FR-009]) @antigravity [LIFECYCLE:IMPLEMENTATION]
  - `src/assets/extraEffects.js`（更地〜スカイツリーの7段階成長、EXTRA飛行機・ヘリ・風船・スカイダイビング・虹の動的演出）の実装

- [TASK-008] GASバックエンド & スプレッドシートDAO・APIクライアントの実装 ([FR-012], [FR-013], [FR-015]) @antigravity [LIFECYCLE:IMPLEMENTATION]
  - `src/gas/Code.js`（`doGet`, `doPost`, LockService排他制御、数式エスケープ、Players/Scores/Rankings DAO）の実装
  - `src/services/gasApiClient.js`（マスター取得、スコア送信、月間・歴代自己ベストランキング取得）の実装

---

## 3. テストフェーズ (Test & Verification Phase)

- [TASK-009] タイピング判定・ASCII混在語・動的Timingモデル単体テスト ([TC-002], [TC-010], [TC-011], [TC-014], [TC-016]) @antigravity [LIFECYCLE:TEST]
  - Question Master v3 (180問) のロード完全性、ローマ字揺れ判定、ASCII混在語判定、文字数連動走行時間算出式、コンボ・スコア算出の自動テスト実行

- [TASK-010] アニメーション制御 & 2種タイマー状態遷移テスト ([TC-001], [TC-003], [TC-004], [TC-005], [TC-007], [TC-008], [TC-009], [TC-017]) @antigravity [LIFECYCLE:TEST]
  - 動的走行時間連動のフォークリフト走行、Global/Forkliftタイマー独立動作、成功/失敗演出、難易度別車両、7種資材、背景進化、EXTRA演出、60fpsフレームレート安定性の検証

- [TASK-011] GAS API & スプレッドシート連携・排他制御テスト ([TC-012], [TC-013], [TC-015], [TC-018], [TC-019], [TC-021]) @antigravity [LIFECYCLE:TEST]
  - マスター取得、スコア登録、月間/歴代ランキング集計、数式インジェクション防止、LockService排他制御、静的ホスティング配信適合性の検証

---

## 4. コードレビューフェーズ (Code Review Phase @codex)

- [TASK-012] Codex CLI による独立コード品質・セキュリティ監査 @codex [LIFECYCLE:REVIEW]
  - Codex CLI による静的解析、セキュリティ（Formula Injection/XSS）、責務分離、非同期排他制御の3段階レビュー実施（コード変更なし）

---

## 5. 指摘修正フェーズ (Fix & Refactor Phase @antigravity)

- [TASK-013] レビュー指摘事項の是正・リファクタリング @antigravity [LIFECYCLE:FIX]
  - Codex CLI のレビュー指摘（必須修正・修正推奨）に基づくコード是正とリファクタリング、および `docs/12_review_log.md` への記録

---

## 6. 受入検証フェーズ (Acceptance Phase)

- [TASK-014] ブラウザUI結合 & 全体受入シナリオ検証 ([TC-006], [TC-020]) @antigravity [LIFECYCLE:ACCEPTANCE]
  - PCブラウザ（Chrome/Edge）における練習（1.5倍余裕時間）・本番モード、リザルト、ランキング画面のレスポンシブE2E受入検証

---

## 7. 完了・リリース準備フェーズ (Completion Phase)

- [TASK-015] 実装ログ記録 & ドキュメント最終同期 @antigravity [LIFECYCLE:COMPLETION]
  - `docs/13_implementation_log.md` への変更記録、操作マニュアル（`docs/14_operation_manual.md`）の整備、完了確認
