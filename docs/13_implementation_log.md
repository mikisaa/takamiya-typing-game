# Antigravity 実装・修正履歴ログ (13_implementation_log.md)

本ドキュメントは、実装担当AI「Antigravity」による実装フェーズごとの実装内容、テスト結果、設計補足事項を記録するログファイルです。

---

## 1. Implementation Phase 1: Core Game Foundation (2026-09-02)

### 1.1 実装サマリー
* **Game Config Master (`src/config/gameConfig.js`)**:
  * Planning SSOT（`02_spec.md` 8項）に基づくゲームバランス・動的タイミング・難易度設定マスターの初実装。
* **Question Master Loader (`src/data/questionLoader.js` & `src/data/defaultQuestions.js`)**:
  * `data/questions/takamiya-typing-game-master-v3.csv`（全180問：初級60・中級60・上級60）のロード・ヘッダー検証・重複排除・Questionモデル変換を実装。
* **Typing Engine (`src/engine/typingEngine.js`)**:
  * `Reading` を基準とした動的ローマ字揺れ判定パーサー（`shi`/`si`, `chi`/`ti`, `tsu`/`tu`, `fu`/`hu`, `sha`/`sya`, `ja`/`zya`, 促音、撥音、長音 `-`）。
  * 英数・ASCII混在語（`AI`, `TQM`, `2S`, `4M3H`, `OPE-MANE`, `T-Earth`, `Base` 等）のcase-insensitive直接判定。
  * 1文字ずつのインクリメンタル入力APIとミスタイプ検知・状態スナップショット取得。
* **Dynamic Timing Engine (`src/engine/timingEngine.js`)**:
  * 文字数連動走行時間算出式（`allowedTime = clamp(minTime, maxTime, reactionAllowance + (effectiveKeystrokes / targetKps))`）。
  * 練習モード倍率（1.5x）、難易度階層（初級 > 中級 > 上級）維持。
* **Minimal Developer Harness (`src/devHarness.html`)**:
  * 180問のブラウザ動作・キー入力・動的時間算出確認用デバッグハーネス。
* **Automated Tests (`tests/`)**:
  * 248テスト全件 PASS（Loader検証、Typing Engine揺れ判定、Dynamic Timing式、180問Smoke Test）。

---

## 2. Implementation Phase 2: Playable Game Loop & UI Foundation (2026-09-02)

### 2.1 実装サマリー
* **Question Bundle Generator & Drift Prevention (`scripts/generateQuestionBundle.js`, `tests/testQuestionBundleDrift.js`)**:
  * CSV SSOT (`data/questions/takamiya-typing-game-master-v3.csv`) から JavaScript runtime bundle (`src/data/defaultQuestions.js`) を決定論的に生成するビルドスクリプトと、CSVとの完全一致（180/180一致）を自動検証するドリフトテストを実装。
* **Game State Machine & Session (`src/engine/gameState.js`, `src/engine/gameSession.js`)**:
  * `TITLE` → `SETUP` → `READY` (3..2..1) → `PLAYING` → `SUCCESS_FEEDBACK` / `MISS_FEEDBACK` → `RESULT` / `PRACTICE_RESULT` の厳格な状態遷移管理。
  * Production 90秒 Global Timer（MISS時 -3s/-4s/-5s 難易度別ペナルティ、15コンボ到達時 +5s TIME BONUS / 最大+30s累積）。
  * Forklift Per-Question Timer および動的進行度（`1 - remaining / allowed`）算出。
  * Practice モード（時間無制限、走行時間1.5倍、任意終了、Practice Result）。
* **Score & Metrics Calculator (`src/engine/scoreCalculator.js`)**:
  * スコア計算式（`CorrectChars * 100 * ComboMultiplier + (RemainingSeconds * 50) - (MissCount * 20)`）。
  * 正確率、WPM、KPM、最大コンボ数、プレイ時間のリアルタイム算出。
* **Question Selector & Pool Manager (`src/engine/questionSelector.js`)**:
  * 難易度別60問のシャッフル・直前問題との連続重複防止・プール枯渇時の自動再生成。
* **Background Progression (`src/engine/backgroundProgression.js`)**:
  * 全8段階（GROUND → CONTAINER → HOUSE → BUILDING → HIGHRISE → TOKYO_TOWER → SKYTREE → EXTRA）の状態判定ロジック。
* **Playable Frontend UI (`src/index.html`, `src/index.css`, `src/main.js`)**:
  * タイトル画面、難易度・モード選択画面、3..2..1カウントダウンオーバーレイ、ゲームプレイHUD、資材・フォークリフト走行プレースホルダー、プロンプト・タイピング表示、赤色ミスフラッシュ、リザルト画面、リプレイ・タイトル復帰。
* **Automated & Smoke Tests (`tests/`)**:
  * 合計 361 件の自動テスト全件 PASS。
  * ブラウザ実機スモークテスト（初級本番・中級本番・上級本番・練習モード）全4シナリオ正常完了。

---

## 3. Implementation Phase 2.1: Typing Variant & Mode Copy Correction (2026-09-02)

### 3.1 実装サマリー
* **Mode Description Copy Correction (`src/index.html`, `src/main.js`)**:
  * 本番モード説明文を `時間制限90秒` のみに厳格統一。
  * 練習モード説明文を `時間無制限` のみに厳格統一。
* **Typing Engine Romaji Variant Expansion (`src/engine/typingEngine.js`)**:
  * `じ` の複数受理（`ji` / `zi`）を正式対応。
  * `し` (`shi` / `si` / `ci`)、`ち` (`chi` / `ti`)、`つ` (`tsu` / `tu`)、`ふ` (`fu` / `hu`)。
  * `しゃ/しゅ/しょ` (`sha/shu/sho` / `sya/syu/syo`)。
  * `じゃ/じゅ/じょ` (`ja/ju/jo` / `zya/zyu/zyo` / `jya/jyu/jyo`)。
  * `ちゃ/ちゅ/ちょ` (`cha/chu/cho` / `tya/tyu/tyo` / `cya/cyu/cyo`)。
  * `ぢ` (`di` / `dji`) と `じ` (`ji` / `zi`)、`づ` (`du` / `dzu`) と `ず` (`zu`) をReading SSOT基準で明確に区別。
  * ユーザー入力に応じた動的 Display Target の追従（例: 表示 `JIDOUSHA` に対し `z` 入力で `ZIDOUSHA` に自然切り替え、ミスカウント 0 維持）。
* **Automated & Smoke Tests (`tests/testTypingEngine.js`)**:
  * 新規バリアントテストおよび実 Question Master 問題（B001, B002, B003, B013, I001, I002, I008, A001 等）を用いた alternate sequence テストを追加。
  * 合計 426 件の自動テスト全件 PASS（`426 / 426 PASS`）。
  * 180問 Smoke Test PASS（`180 / 180 PASS`）。
  * ブラウザ実機スモークテスト（Mode Copy 表示およびバリアントタイピング入力）全項目 PASS。

---
