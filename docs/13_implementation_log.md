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

## 4. Implementation Phase 3: Pixel Art Visual Assets & Loading Animation (2026-09-02)

### 4.1 実装サマリー
* **Pixel Art Architecture & Palette (`src/visual/pixel/palette.js`)**:
  * 24色キュレーション済みのインダストリアル・ピクセルパレットを定義。外部画像・CDN・重いテクスチャへの依存を一切持たない純粋なインラインSVGピクセルアートシステムを構築。
* **Forklift Sprite & Animation (`src/visual/pixel/forkliftSvg.js`)**:
  * 96x56 logical pxのカウンターバランス式フォークリフト側面図。
  * オーバーヘッドガード、運転席、後部カウンターウェイト、垂直マスト、荷役フォーク爪、マルチフレーム回転タイヤ（3フレーム）、1pxボディボビングを実装。
* **7 Scaffold Load Sprites (`src/visual/pixel/scaffoldLoadsSvg.js`)**:
  * 支柱 (`POST_BUNDLE`)、手摺 (`HANDRAIL_BUNDLE`)、建枠 (`FRAME_STACK`)、布板 (`PLANK_STACK`)、筋交 (`BRACE_BUNDLE`)、ジャッキベースパレット (`JACK_BASE_PALLET`)、小物パーツパレット (`SMALL_PARTS_PALLET`) の全7種ピクセル資材を実装。
  * 問題出題時に直前重複を避けてランダム選定し、フォークリフトの爪の上に追従。
* **3 Difficulty Truck Sprites (`src/visual/pixel/trucksSvg.js`)**:
  * 初級：`KEI_TRUCK`（軽トラック、2軸、ホワイトキャブ、小荷台、クレーンなし）。
  * 中級：`CRANE_4T`（4tユニック車、キャブ直後にブルーの格納式ローダークレーン、中型荷台、リア複輪）。
  * 上級：`CRANE_15T`（15t大型ユニック車、ハイルーフキャブ、オレンジ大型クレーンブーム、ロング荷台、タンデム3軸複輪）。
  * 難易度ごとに明確なサイズ差・視覚特徴を付与しつつ、ゲームタイマー・到達ロジック用接触座標は統一。荷台上の `loadTarget` アンカーを定義。
* **Visual Scene Coordinator & Animation Layer (`src/visual/animation/visualScene.js`, `src/index.css`)**:
  * `BACKGROUND` → `WORLD ROAD` → `TRUCK` → `TRUCK_LOADS` → `FORKLIFT` → `FORKLIFT_LOAD` → `EFFECTS` の厳格なZ-indexレイヤー階層。
* **Automated Tests (`tests/testVisualAssets.js`, `tests/runAllTests.js`)**:
  * 全自動テスト 合計 464 件 PASS（`464 / 464 PASS`）。
* **Browser Real-Device Verification**:
  * 初級（軽トラ）、中級（4tユニック）、上級（15t大型ユニック）すべての難易度でタイピング入力連動、走行、SUCCESS積込、MISS衝突落下アニメーションの実機動作を確認。

---

## 5. Implementation Phase 3.1: Result Accuracy, Truck Loading Progress & Typing Mistake Penalty Correction (2026-09-02)

### 5.1 実装サマリー
* **Result Screen Accuracy Display Defect Resolution (`src/main.js`, `src/engine/gameSession.js`)**:
  * `summary.accuracy` の数値/オブジェクト不整合を解消し、`accuracy: { typed, mistakes, percent }` および `accuracyPercent` を正式提供。
  * 本番モードおよび練習モードのリザルト画面において `92.3%` / `100.0%` 等の正確率が確実に表示されるよう修正完了。
* **SUCCESS Loading Animation Overhaul (`src/visual/animation/visualScene.js`, `src/visual/pixel/trucksSvg.js`)**:
  * 従来の「資材飛翔方式」を完全廃止し、フォークリフト上の資材はフォーク爪上に保持（`REMAINS_ON_FORK`）。
  * トラック荷台に 5段階の積載状態（`LOAD_STAGE_0` 〜 `LOAD_STAGE_5`）を実装。SUCCESSごとに 1段階ずつ足場資材（束管、布板、枠材、固定ストラップ）が整然と積載され、満載（Stage 5）へ成長。
  * SUCCESS時にトラック全体が軽快にポップアップ（float 2-3px & scale 1.035）し、周囲にピクセル・スパークルが発光する祝祭演出を実装。
* **Production Mode Typing Mistake Penalty (`src/config/gameConfig.js`, `src/engine/gameSession.js`)**:
  * 本番モード中のタイピング誤入力時に、難易度別 Global Timer ペナルティを即時減算するロジックを実装：
    * **初級**: `-0.50秒`
    * **中級**: `-0.75秒`
    * **上級**: `-1.00秒`
    * **練習モード**: ペナルティなし（時間無制限維持）
  * 受理対象のローマ字バリアント入力（例: `じ` に対する `zi`, `し` に対する `si`）ではペナルティが一切発生しないことを厳格保証。
* **Automated Tests (`tests/`)**:
  * 合計 506 件の自動テスト全件 PASS（`506 / 506 PASS`）。

---

## 6. Implementation Phase 3.2: MISS Truck Load Reset Correction (2026-09-03)

### 6.1 実装サマリー
* **Authoritative Timeout MISS Truck Load Stage Reset (`src/engine/gameSession.js`, `src/visual/animation/visualScene.js`)**:
  * 走行時間切れによるフォークリフト接触（`handleMissTimeout()` / `triggerMiss()`）発生時、トラック荷台の積載状態（`truckLoadStage`）を即座に `0`（`LOAD_STAGE_0`：空荷）へ完全リセットする仕様を実装。
* **Typing Mistake & Alternate Variant Isolation**:
  * キーのタイピング誤入力（Typing Mistake）時は、タイマー減算・コンボリセット・赤色フラッシュが発生するものの、`truckLoadStage` は維持（例: Stage 4 のまま保持）。
* **Automated Tests (`tests/testVisualAssets.js`)**:
  * 全自動テスト 合計 525 件 PASS（`525 / 525 PASS`）。

---

## 7. Implementation Phase 4: Progressive Pixel Background Construction & Landmark Completion (2026-09-03)

### 7.1 実装サマリー
* **Progressive Construction Architecture (`src/visual/pixel/background/`)**:
  * 更地からスカイツリーまで、正解数（`correctCount`）の増加に応じて1問ごとに建設・成長するインラインSVGピクセルアートシステムを実装。
    * `groundSvg.js`: 更地（測量杭、カラーフラッグ、木製パレット、地割線）
    * `containerSvg.js`: コンテナヤード施設（基礎スラブ、鉄骨骨組み、波板外壁、完成オフィス施設）
    * `houseSvg.js`: 住宅（コンクリート基礎、1階軸組、2階梁組、外壁・瓦屋根、完成住宅）
    * `buildingSvg.js`: 中層ビル（2階躯体、3〜5階垂直延伸、カーテンウォール、窓ガラス格子、屋上設備・エントランス完成）
    * `highriseSvg.js`: 高層ビル（深礎杭、低層躯体、中層・高層延伸、クラウン構造、ブルースカイガラス、航空障害灯完成）
    * `tokyoTowerSvg.js`: 東京タワー（4脚アンカー脚、下部アーチトラス、赤白帯トラス、大展望台、上部細身シャフト、特別展望台、アンテナ尖塔完成）
    * `skytreeSvg.js`: スカイツリー（深礎杭・三角錐トリポッド基礎、円柱トラスシャフト、第1展望台天望デッキ、第2展望台天望回廊、アンテナゲイン塔完成）
    * `cityComposition.js`: 街並み全体のパノラマ合成レイヤー（遠景スカイライン、完成建造物の完全維持・共存）
* **Completed Building Persistence (街の発展の累積維持)**:
  * 次のStageへ進んでも前Stageの建造物は消失せず背景に永続。最終Stageではコンテナ・家・ビル・高層ビル・東京タワー・スカイツリーが共存する大パノラマを形成。
* **Critical EXTRA Boundary Audit & Alignment (`src/engine/backgroundProgression.js`)**:
  * 正解数 33問: `SKYTREE`（スカイツリー完成状態、`isExtra: false`、表示: `スカイツリー (完成)`）
  * 正解数 34問以上: `EXTRA`（`isExtra: true`、表示: `スカイツリー (EXTRA)`、完成街並みを維持）
  * スカイツリー完成状態を明確に1状態独立させ、EXTRAをSkytree完成後の追加正解から開始する仕様を厳格確立。
* **Decoupled 60fps Rendering Performance (`src/visual/animation/visualScene.js`, `src/index.css`)**:
  * 背景パノラマは `correctCount` が変動した時のみ再生成するキャッシュ機構を実装し、フォークリフト走行の60fpsレンダリングを阻害しない最適化を実施。
  * MISS衝突や誤入力時にも背景建造物進行はリセットされず安定維持。
* **Automated Tests (`tests/testBackgroundProgression.js`, `tests/runAllTests.js`)**:
  * 全Main Stage判定（0〜34+）、単調増加する建設進捗度、全建造物の永続描画検証、MISS時・練習モード時の独立性テストを新規追加。
  * 全自動テスト 合計 561 件 PASS（`561 / 561 PASS`）。

---

## 8. Implementation Phase 5: EXTRA Stage Visual Events (2026-09-03)

### 8.1 実装サマリー
* **EXTRA Visual Configuration Master (`src/config/extraVisualConfig.js`)**:
  * イベント種別（`AIRPLANE`, `HELICOPTER`, `BALLOONS`, `SKYDIVER`, `RAINBOW`）、各持続時間、最大同時発生数（`maxConcurrentDynamicEvents: 3`）、レア発生率（`skydiverProbability: 0.12`, `rainbowProbability: 0.25`）、重み付け確率を定義。
* **5 Dedicated Pixel Art Sprites (`src/visual/pixel/extra/`)**:
  * `airplaneSvg.js`: 小型旅客機（48x16px、水平巡航、窓、主翼・尾翼、明滅ナビゲーションライト）。
  * `helicopterSvg.js`: ヘリコプター（42x20px、3フレーム回転メインローター、2フレーム回転テールローター、中央ホバリング・ピッチ動作、着陸スキッド）。
  * `balloonsSvg.js`: 風船クラスタ（28x38px、赤・青・黄・緑・橙の5個の風船、リボン結束、揺らぎ浮上）。
  * `skydiverSvg.js`: スカイダイバー（32x36px、前半1.5秒のコミカルなフリーフォール降下 → 後半パラシュート開傘・安全降下）。
  * `rainbowSvg.js`: 虹（900x135px、5色同心円グラデーション半透明アーチ、フェードイン/フェードアウト付き背景オーバーレイ）。
* **Decoupled Event Lifecycle Manager (`src/visual/animation/extraEventManager.js`)**:
  * 動的空中イベントの生成・更新・破棄サイクルを管理。
  * 最大同時実行数（2〜4）のクランプ、同一動的イベントの重複発生防止（Duplicate Prevention）を厳格保証。
  * スコア・制限時間・コンボロジックには一切関与しない完全な視覚的リワードレイヤーとして独立。
  * セッション終了時・リトライ時の完全初期化（Orphan DOM / Timer Leakage 0）を担保。
* **Visual Scene Integration & Layering (`src/visual/animation/visualScene.js`, `src/index.css`)**:
  * `SKY` (z:1) → `RAINBOW` (z:1.2) → `CITY` (z:2) → `FENCE` (z:3) → `EXTRA DYNAMIC` (z:3.5) → `ROAD` (z:4) → `VEHICLES` (z:10〜30) の厳格なZ-indexレイヤー構成。
  * 正解数 34問到達時（初EXTRA突入）に祝福バルーンを確定生成。
* **Automated Tests (`tests/testExtraEvents.js`, `tests/runAllTests.js`)**:
  * 境界テスト、5種Sprite生成、決定論的/シード付きランダム選択、同時実行数クランプ、重複防止、レアダイバー確率、虹の状態遷移、セッション初期化、MISS独立性、30連続正解急行スモークテストを追加。
  * 全自動テスト 合計 643 件 PASS（`643 / 643 PASS`）。
* **Browser Real-Device Verification**:
  * 実ブラウザ（Chrome）にて、EXTRA到達・虹の出現・飛行機横断・ヘリコプターローター回転＆ホバリング・風船浮上・スカイダイバー開傘降下・4種同時共存シーン・通常ゲームプレイでの正解連携・タイトル復帰時の完全クリアを確認。

---

## 9. Implementation Phase 6: Final UI / HUD / Result Visual Polish & Unified Color System (2026-09-03)

### 9.1 実装サマリー
* **Authoritative 5-Color Unified Design System (`src/visual/pixel/palette.js`, `src/index.css`)**:
  * 全画面の背景を純白 `#FFFFFF`（`--white`）へ刷新し、従来のDark Modeを完全廃止。
  * 厳格な5色Paletteマスターを一元定義：
    * `WHITE`: `#FFFFFF`（Global Background / Clean Sky）
    * `PALE_1`: `#F5FBDA`（Large Panel Background / Light Highlight）
    * `PALE_2`: `#D9EFBD`（Secondary Panel / Hover / Sub Area）
    * `ACCENT`: `#B9D175`（Main Accent / Progress / Active Decoration）
    * `DARK`: `#450C3F`（Primary Text / Border / Icon / Outline / Error）
  * 青・シアン・赤・オレンジ・黄・ティール・純黒等の旧テーマ主要色を全廃し、必要な明暗や金属感・質感はパレット内コントラストおよびパターンで表現。
* **Pixel Art Assets Recolor (100% Palette Compliant)**:
  * 形状・アニメーション・判定座標・ゲームロジックを完全維持したまま、全Pixel Artスプライトを指定5色へ統一：
    * **Forklift**: ボディ `#B9D175`, ハイライト `#D9EFBD`, マスト/フォーク/座席/外枠 `#450C3F`, タイヤ `#450C3F`, ホイールリム `#F5FBDA`/`#B9D175`
    * **Scaffold Loads (7種)**: メインスチール `#D9EFBD`, ハイライト `#F5FBDA`, ディテール `#B9D175`, ジョイント/結束帯 `#450C3F`
    * **3 Trucks**: キャブ `#F5FBDA`, シャドウ `#D9EFBD`, 荷台 `#B9D175`, シャーシ/タイヤ `#450C3F`（難易度差はサイズ・荷台長・クレーン形状で明確化）
    * **World Scene**: 背景空 `#FFFFFF`, ヤード地面 `#F5FBDA`, フェンス/境界 `#450C3F`, レーン白線 `#D9EFBD`
    * **Progressive City & Landmarks**: コンテナ、住宅、オフィスビル、高層ビル、東京タワー（`#450C3F`/`#B9D175`/`#F5FBDA`）、スカイツリー（`#B9D175`/`#F5FBDA`/`#450C3F`）すべて統一パレット内で再彩色
    * **EXTRA Events**: 飛行機、ヘリコプター、風船、スカイダイバー、植物風ボタニカル虹（`#450C3F`, `#B9D175`, `#D9EFBD`, `#F5FBDA` の4層同心円アーチ）
    * **Effects**: SUCCESSスパークル（`#B9D175`/`#F5FBDA`）、MISS衝突バースト（`#450C3F`/`#B9D175`）
* **UI / HUD & Template Polish (`src/index.html`, `src/index.css`, `src/main.js`)**:
  * OS依存絵文字（🏛️, 💥, ✨, 🚚, 🏆, 🔧 等）を全画面・DOMテンプレート・JS出力から完全撤去。
  * タイトル画面：白背景、`#F5FBDA` カード、`#450C3F` ピクセルボーダー、`[本]` / `[練]` アイコン、正確なモード説明文（本番「`時間制限90秒`」、練習「`時間無制限`」）を厳格維持。
  * 難易度選択：KPSや余裕時間などの内部デバッグ数値をUIから完全撤去し、洗練されたプロダクションUIへ統一。
  * HUD & ゲームプレイ：白背景ビューポート、`更地` バッジ、`#450C3F` 高コントラスト文字、タイピング進捗（入力済 `#D9EFBD` / 未入力 `#450C3F`）、MISS時の `#450C3F` ボーダーフラッシュ＆シェイク。
  * リザルト画面：白背景＋`#F5FBDA` パネル、全10大必須メトリクス（SCORE, 正解数, 正答率 e.g. `98.4%`, Typing Mistake, MISS, 入力文字数, 最大COMBO, WPM, KPM, 到達ステージ）＋練習モード時のプレイ時間を完全提供。
* **Automated Tests (`tests/testPaletteCompliance.js`, `tests/runAllTests.js`)**:
  * 5色公式パレット定数、パレット内トークンの厳格な5色準拠検証、旧テーマ主要色の非混入、CSS変数の定義整合性、モード説明文完全一致、OS絵文字ゼロ検証、リザルト必須項目要素の存在検証を自動化。
  * 全自動テスト 合計 671 件 PASS（`671 / 671 PASS`）。
* **Browser Real-Device Verification**:
  * 実ブラウザ（Chrome）にて、タイトル画面・難易度選択・カウントダウン・通常ゲームプレイ・ランドマーク描画・EXTRAイベント・リザルト画面の全フローを検証完了。

---

## 10. Implementation Phase 7: Google Spreadsheet & GAS Backend Foundation (2026-09-03)

### 10.1 実装サマリー
* **Backend Architecture & Trust Boundary (`docs/backend/01_architecture.md`)**:
  * 会社環境に **Google Workspace (旧 G Suite) が存在しない** ことを正式前提として確定。
  * `PLAYER_SELECTION_IS_NOT_AUTHENTICATION`：プレイヤー選択は認証ではなく表示名指定である信頼境界を明文化。
  * Question Master SSOT（`data/questions/takamiya-typing-game-master-v3.csv` 180問）を100%維持し、スプレッドシートへの二重コピー・`Questions` シート作成を完全防止。
  * ランキング判定・スコア日時のAuthoritativeタイムゾーンを `Asia/Tokyo`（JST）と規定。
* **Spreadsheet Schema Specification (`docs/backend/02_spreadsheet_schema.md`)**:
  * `Players` シート（6列：`PlayerID`, `PlayerName`, `Enabled`, `SortOrder`, `CreatedAt`, `UpdatedAt`）。
  * `Scores` シート（19列：`ScoreID`, `SubmissionID`, `PlayerID`, `PlayerNameSnapshot`, `Difficulty`, `Score`, `CorrectCount`, `TypedCharacters`, `TypingMistakes`, `MissCount`, `Accuracy`, `MaxCombo`, `WPM`, `KPM`, `ReachedStage`, `StartedAtClient`, `FinishedAtClient`, `PlayedAtServer`, `AppVersion`）。
  * `Meta` シート（3列：`Key`, `Value`, `UpdatedAt`）。
* **Modular GAS Source (`backend/gas/`)**:
  * `appsscript.json`: `timeZone: "Asia/Tokyo"`, `runtimeVersion: "V8"`。
  * `Config.gs`: 定数、上限値、エラーコード、スキーマ列定義。
  * `Response.gs`: 統一エンベロープ（`ok: true / error`）JSONレスポンスビルダー。
  * `Spreadsheet.gs`: スプレッドシート取得（Script Properties `SPREADSHEET_ID`）、ヘッダー初期化、Formula Injectionサニタイズ。
  * `Players.gs`: `getPlayers` リポジトリ（有効プレイヤー抽出・ソート）。
  * `Scores.gs`: スコア永続化、二重登録防止検索（`SubmissionID` 照合）。
  * `Validation.gs`: ペイロード型検査、難易度（`BEGINNER`〜`ADVANCED`）、ステージ（`GROUND`〜`EXTRA`）、数値範囲検証。
  * `Code.gs`: `doGet` / `doPost` ルーター、`LockService` による排他制御と冪等処理。
* **Shared Pure Logic & In-Memory Fake DB (`backend/shared/`)**:
  * `backendConfig.js`, `backendValidator.js`, `fakeSpreadsheetDb.js`, `backendService.js`。
  * 外部通信を伴わずローカルNode環境で確定的にテスト可能な設計を採用。
* **Automated Backend Tests (`tests/testBackendFoundation.js`, `tests/runAllTests.js`)**:
  * スキーマ定義・CSV SSOT維持・health・getPlayers・submitScore正常系・二重送信冪等性（`duplicate: true`）・練習モード拒絶（`PRACTICE_MODE_NOT_RECORDED`）・難易度検証・ステージ検証・未知/無効プレイヤー拒絶・数値境界検証・Formula Injection対策・同時実行ロックタイムアウトの全59検証項目を追加。
  * 全自動テスト 合計 730 件 PASS（`730 / 730 PASS`）。
* **Cloud Resource Creation & Audit**:
  * `clasp` を通じて Google Apps Script プロジェクト（`Base Typing Game Backend`）を作成し、ソースコード8ファイルをリモートプッシュ完了。
  * 初回Web Appデプロイのアクセス権限承認（OAuth同意）にはブラウザ経由の人間による承認操作が必要となるため、`MANUAL_GOOGLE_AUTH_REQUIRED` 境界を厳格に報告。
* **Frontend Isolation**:
  * フロントエンド（`src/`）コードは一切変更せず、既存の完全なゲームループ・Visual演出・ローカルプレイ可能性を100%維持。

---

## 11. Implementation Phase 7.1: GAS Cloud Activation & Real Integration Acceptance (2026-09-04)

### 11.1 実装サマリー
* **Google Spreadsheet Resource Confirmation & Initialization**:
  * スプレッドシート `Base Typing Game DB` を実作成・初期化（ID: `1-HUuzXK27t2eRJEwgSMVO1bNVkVRwVTyzb4LftW5TX8`）。
  * `Players`（6列）、`Scores`（19列）、`Meta`（3列）の3シートのみを作成し、ヘッダーを1行固定で凍結。
  * `Questions` シートは作成せず、CSV（180問）のQuestion SSOTを厳格に維持。
  * `Meta` シートに `SchemaVersion` / `AppVersion` (`1.0.0`) をシード投入。
  * `Players` シートに初期テストプレイヤー `TEST001` (`TEST PLAYER`, `TRUE`, `9999`) をシード投入。
* **GAS Script Properties & OAuth Authorization**:
  * `Base Typing Game Backend` プロジェクトの Script Properties へ `SPREADSHEET_ID` を設定完了（コード内ハードコードゼロを徹底）。
  * エディタから `adminInitDatabase()` を実行し、`miki@takamiya.co` アカウントによる OAuth 権限承認（SpreadsheetApp, ScriptProperties, LockService）を完了。
  * マルチスレッド環境での即時一貫性を担保するため、`appendScoreRow` および `findScoreBySubmissionId` に `SpreadsheetApp.flush()` を追加実装。
* **Real Web App Deployment**:
  * 種類: `ウェブアプリ (Web App)`
  * 実行ユーザー: `自分 (miki@takamiya.co)`
  * アクセスできるユーザー: `全員 (Anyone)`
  * 正式 Web App URL: `https://script.google.com/macros/s/AKfycbzdPNsWV5kNdtpsF91jkca3lkJSLdVxG_2Ux8V5a5f1kMWLJmogiUG8mzbSiRk3S3xeeQ/exec`
* **Real Live HTTP Acceptance Tests (`scripts/testRealGasBackend.js`)**:
  * デプロイ済み実 Web App エンドポイントに対して 40 件の実 HTTP リクエストテストを実施し、全件 PASS：
    * `health`: 正常稼働、`Asia/Tokyo` タイムスタンプ取得。
    * `getPlayers`: `TEST001` 取得、内部メタデータ非漏洩確認。
    * `submitScore`: 正常系本番スコア永続化、サーバー生成 `ScoreID`、スナップショット名取得。
    * `Duplicate (Idempotency)`: 同一 `SubmissionID` 再送時に二重行追加なし・初回 `ScoreID` 冪等返却。
    * `Invalid Rejections`: 未知プレイヤー、練習モード（`PRACTICE_MODE_NOT_RECORDED`）、不正難易度、負値スコア、超過正答率、不正ステージの全拒絶を確認。
    * `Formula Injection`: `=cmd` 等の関数型文字列がシングルクォートで安全にエスケープされ、スプレッドシート上で関数実行されないことを実証。
    * `Concurrency & Same-ID Race`: 3件同時並行リクエスト正常処理、同一ID 3並行リクエストで正確に1件のみ新規作成＋2件冪等重複返却を確認。
* **Browser Cross-Origin Compatibility Acceptance (`http://localhost:8080`)**:
  * 実ブラウザ（Chrome）上の `http://localhost:8080/index.html` から GAS Web App へ直接 `fetch` を実行：
    * `GET ?op=health`: 200 OK、JSON 正常可読。
    * `GET ?op=getPlayers`: 200 OK、JSON 正常可読。
    * `POST submitScore`: `Content-Type: text/plain;charset=utf-8` を指定した Simple Request 方式により、CORS preflight (`OPTIONS`) エラーを回避し、302 リダイレクトを経由して 200 OK・JSON 正常受領を確認。
* **Test Data Cleanup**:
  * スプレッドシート `Scores` シートに投入された 17 行のインテグレーションテストデータを安全に削除し、1 行目ヘッダーのみのクリーンな本番受付待機状態へ初期化。
  * `TEST001` はマスターに保持。
* **Automated Unit Tests**:
  * 全 730 件の自動テスト全件 PASS（`730 / 730 PASS`）。

---

## 12. Implementation Phase 8 Revised: Free-Entry Player Name, Browser Memory & Cross-Browser Player Resolution (2026-09-04)

### 12.1 実装サマリー
* **Authoritative Player Requirement Migration**:
  * 従来のマスター事前選択方式を廃止し、本番モード開始時のプレイヤー名自由入力方式を全面実装。
  * `PLAYER_NAME_IS_NOT_AUTHENTICATION`: プレイヤー名は認証・認可ではなく、表示用および同一表記識別用ラベルとして定義。
  * `SAME_NORMALIZED_NAME_MEANS_SAME_PLAYER`: 全角・半角スペース、大文字・小文字（ASCII）、Unicode NFKC正規化により、表記揺れを単一の `PlayerNameKey` に集約。
  * `LOCAL_STORAGE_NAME_IS_NOT_A_CREDENTIAL`: `localStorage` に前回の入力名を安全に記憶（`baseTypingGame.lastPlayerName.v1`）。次回開始時に自動入力。共有PC等での名前変更も常時可能。
* **Backend Architecture & Google Spreadsheet Schema (v1.1.0)**:
  * `Players` シートを 7 列スキーマ（`PlayerID`, `PlayerName`, `PlayerNameKey`, `Enabled`, `SortOrder`, `CreatedAt`, `UpdatedAt`）へマイグレーション。
  * `Meta` シートの `SchemaVersion` を `1.1.0` へ更新。
  * `clasp push -f` により GAS ソースコード 8 ファイルをリモート更新し、GAS Web App デプロイを新バージョンへ更新。
  * `LockService` 排他制御下で `PlayerNameKey` による既存プレイヤー検索・自動新規採番（`PL-<timestamp>-<rand>`）を実装。
* **Frontend UI & Game Loop Integration**:
  * `src/storage/playerStorage.js`: 安全な `localStorage` 読み書きユーティリティ（例外ハンドリング・フォールバック完備）。
  * `src/api/backendClient.js`: Simple Request 方式（`Content-Type: text/plain;charset=utf-8`）による GAS Web App API クライアント。
  * `src/index.html` & `src/index.css`:
    * 本番モード設定画面に `#inputPlayerName`（最大30文字、5色パレット厳格準拠、フォーカスアニメーション）を配置。
    * ゲーム画面 HUD に `#hudPlayerBadge`（プレイヤー名バッジ）を追加。
    * リザルト画面に `#resultSaveContainer`（保存中 / 保存完了 / 保存失敗＋再送信ボタン）を追加。
  * `src/main.js`:
    * 本番モード選択時: 入力欄を表示し `localStorage` から自動入力。出庫準備完了（START）クリック時に入力バリデーション（空・空白のみ拒絶、30文字以内）および `localStorage` への保存を実行。
    * オフライン動作保証: ゲーム開始時は一切のネットワーク通信を行わず、即座に 3..2..1 カウントダウンを開始。
    * 練習モード: プレイヤー名入力欄・HUDプレイヤーバッジ・リザルト保存コンテナを完全非表示（通信量ゼロ）。
    * リザルト画面: ゲーム終了時にバックグラウンドでスコアを自動非同期送信。「スコア保存中...」→「スコア保存完了」を表示。
    * リプレイ: 直前のプレイヤー名を保持して即座に再戦可能。
* **Automated Tests**:
  * 全自動テスト 合計 772 件 PASS（`772 / 772 PASS`）。
  * `tests/testBackendFoundation.js`: スキーマ v1.1.0、7列構成、正規化、自動作成、表記揺れ同一ID解決、バリデーション単体テスト。
  * `tests/testPhase8PlayerAndFrontend.js`: `localStorage` 記憶・上書き・例外安全・GameSession 統合テスト。
* **Real Cloud Backend HTTP Acceptance Tests (`scripts/testRealGasBackend.js`)**:
  * 実 Web App エンドポイントに対して 40 件のテストを実施し、全件 PASS（`40 / 40 PASS`）：
    * 初回入力名による `PL-...` 自動採番。
    * 全角スペース表記揺れ（`佐藤　テスト` vs `佐藤 テスト`）による同一 `PlayerID` 解決。
    * 冪等重複送信防止、バリデーション（空文字・長大文字列・練習モード拒絶）、並行送信・同一IDレース処理の完全稼働を実証。
* **Real Browser Verification & Visual Evidence**:
  * 実ブラウザ（Chrome）にて入力欄表示、空文字バリデーションエラー、HUDプレイヤー名バッジ、練習モード非表示、`localStorage` による自動補完、リザルト画面の「スコア保存完了」バッジの正常表示を確認。
  * スプレッドシート `Scores` および `Players` シートのテストデータをクリーンアップ完了。

---

## 13. Implementation Phase 9: Monthly / All-Time Ranking Backend & UI (2026-09-04)

### 13.1 実装サマリー
* **Ranking Core Architecture & Pure Business Logic (`backend/shared/rankingCore.js`)**:
  * スプレッドシートの全有効スコアから「今月」「歴代」×「初級・中級・上級」のランキングを生成する Pure Logic モジュールを実装。
  * **6段階決定論的コンパレータ (Best Record Comparator)**:
    1. `Score` 降順（高スコア優先）
    2. `Accuracy` 降順（高正答率優先）
    3. `CorrectCount` 降順（正解数優先）
    4. `MaxCombo` 降順（最大コンボ優先）
    5. `PlayedAtServer` 昇順（早期達成優先）
    6. `ScoreID` 昇順（決定論的文字列比較による同順位タイブレーク確定）
  * **Leaderboard Anti-Spam & PlayerID Grouping**:
    * 同一 `(Period × Difficulty × PlayerID)` について、上記コンパレータにより最高記録1件のみを採用。
    * 同一プレイヤーによるランキング占有を完全防止。
    * 表記揺れや複数ブラウザからの入力も Phase 8 の `PlayerID` 統合により1件へ集約。
  * **Authoritative JST Monthly Boundary**:
    * `Asia/Tokyo` タイムゾーン基準の暦月判定（`yyyy-MM`）をサーバー側で厳格に判定。クライアント時計による月境界判定を完全排除。
* **Public Data Minimization & Privacy Boundary**:
  * エンドポイントは anonymous Web App であるため、返却データを公開用最小限に制限。
  * 原則非返却: `PlayerID`, `PlayerNameKey`, `SubmissionID`, `ScoreID`, クライアントタイムスタンプ, `AppVersion`, スプレッドシートID。
  * 公開返却: `rank`, `playerName`, `score`, `accuracy`, `correctCount`, `maxCombo`。
  * 契約記録: `RANKING_PLAYER_NAMES_ARE_VISIBLE_TO_ENDPOINT_CALLERS`。
* **Google Apps Script Backend (`backend/gas/Rankings.gs`, `Code.gs`)**:
  * `doGet` ルーターへ `op=getRankings` を追加。
  * 単一 Range Read (`getDataRange().getValues()`) による一括読み込みで N+1 アクセスを完全防止。
  * クエリバリデーション（`period`, `difficulty`, `limit`, optional `playerName`）を実装。
  * 現在プレイヤー解決: クエリ `playerName` から Phase 8 正規化ロジックで `PlayerID` を特定し、TOP 10 外であっても `currentPlayer`（順位・スコア）を返却。
  * `clasp push -f` および新バージョンデプロイ（Version 9, 実行: 自分, アクセス: 全員）を実施。
* **Frontend UI & Screen Integration (`src/index.html`, `src/index.css`, `src/main.js`)**:
  * `src/index.html`:
    * タイトル画面: 「ランキング」ボタン（`#btnOpenRanking`）を追加。
    * 本番リザルト画面: 「ランキングを見る」ボタン（`#btnResultRanking`）を追加。
    * 練習リザルト画面: ランキングボタン非表示（練習モードはランキング対象外）。
    * 新規画面 `#screenRanking`: 期間タブ（今月・歴代）、難易度タブ（初級・中級・上級）、テーブル表示部、読み込み中、空状態、エラー・再読み込みボタン、TOP 10 外現在プレイヤー情報枠、タイトルへ戻るボタン。
  * `src/index.css`:
    * Phase 6 統一パレット（`#FFFFFF`, `#F5FBDA`, `#D9EFBD`, `#B9D175`, `#450C3F`）に厳格準拠。
    * システム絵文字（🥇, 🥈, 🥉, 🏆, ⭐）を一切排除し、枠線・背景・タイポグラフィで TOP 3 を強調。
    * 現在プレイヤー行を `#D9EFBD` でハイライト。
    * 長大プレイヤー名の省略（ellipsis）および 1920×1080〜1280×720 のレスポンシブ対応。
  * `src/main.js`:
    * タイトル → ランキング画面遷移。
    * リザルト → ランキング画面遷移時、プレイした難易度を引き継ぎ、最新保存スコアを確実に反映するため強制最新取得（`forceFresh = true`）。
    * 高速タブ切り替え時の非同期レスポンス競合防止（`rankingRequestToken` による Stale Response Protection）。
    * 同一セッション内のインメモリタブキャッシュによる無駄な API リクエスト削減。
* **Automated Tests**:
  * 全自動テスト 合計 840 件 PASS（`840 / 840 PASS`、Phase 8 比 +68 件）。
  * `tests/testRankingCore.js`: JST 月境界判定、6段階コンパレータ、1プレイヤー最高記録集約、期間分離、難易度分離、クロスブラウザ集約、リミット/トータルプレイヤー数、TOP 10 内外現在プレイヤー、公開データ最小化、クエリバリデーション、空DBハンドリング。
* **Real Cloud Backend HTTP Acceptance Tests (`scripts/testRealGasBackend.js`)**:
  * 実 Web App エンドポイントに対して 70 件のテストを実施し、全件 PASS（`70 / 70 PASS`）：
    * `MONTHLY` / `ALL_TIME` ランキング取得。
    * `BEGINNER`, `INTERMEDIATE`, `ADVANCED` 難易度別集約。
    * 同一テストプレイヤーへ複数スコア送信時の最高記録単一採用確認。
    * `currentPlayer` 順位解決確認。
    * 公開データ最小化（内部 ID 漏洩ゼロ）確認。
    * 不正パラメータ（`period=YEARLY`, `difficulty=EXPERT`, `limit=0`）の安全な拒絶確認。
* **Real Browser Verification & Visual Evidence**:
  * タイトル画面「ランキング」ボタン押下 → ランキング画面表示確認。
  * 「今月」「歴代」「初級」「中級」「上級」全タブ切り替え・データ描画確認。
  * 本番モードプレイ → スコア保存完了 →「ランキングを見る」押下 → 最新スコアが即座にランキングへ反映され、現在プレイヤー行が強調表示されることを確認。
  * 練習モードリザルト画面に「ランキングを見る」ボタンが存在しないことを確認。
* **Test Data Cleanup**:
  * スプレッドシート `Scores` シートのテストスコア行を全削除し、ヘッダーのみのクリーンな状態へ復元。
  * `Players` シートのテスト用プレイヤー行を削除し、ヘッダーおよび `TEST001` のみ保持。
* **Scope Exclusions Maintained**:
  * Player 管理画面: `NOT IMPLEMENTED`
  * PIN / Password / 認証: `NOT IMPLEMENTED`
  * 年間 / 週間 / 拠点別ランキング: `NOT IMPLEMENTED`
  * Production Frontend Deployment: `NOT IMPLEMENTED`
  * AI Development Core: 変更なし

---

## 14. Implementation Phase 10A: Production Frontend Hosting Architecture & Release Readiness Gate (2026-09-04)

### 14.1 実装サマリー
* **Hosting Architecture Audit & Feasibility**:
  * **Option A: Google Apps Script HtmlService (`REJECT`)**:
    * フロントエンドの 25 以上の ES Modules（`import`/`export`）を直接配信できず、インライン化または単一バンドル化（Webpack/Rollup/Vite）へのビルドパイプライン再構築が必須となる。
    * iframe サンドボックス（`*.script.googleusercontent.com`）によるキーボードイベント・フォーカス阻害リスク。
    * サードパーティストレージ分割による `localStorage` 喪失・制限リスク。
  * **Option B: GitHub Pages (`PASS` — 正式採用)**:
    * 現在のコードベース（Vanilla CSS, Native ES Modules, SVG Pixel Sprites）をそのまま無変換・Zero-Build で配信可能。
    * Top-Level Origin（`https://<org>.github.io/<repo>/`）での動作が保証され、`localStorage` の第一者永続性が完全担保。
    * Simple Request（`POST text/plain;charset=utf-8`）による GAS Web App とのクロスオリジン通信、および全路 HTTPS による Mixed Content ゼロを実証。
    * グローバル CDN による高速初期ロード（< 1s）および Git SSOT との完全一致。
  * **Option C: 社内共有フォルダ / その他 SaaS (`REJECT`)**:
    * 会社制約（Forms, Power Apps, Automate, SharePoint, Vercel, Firebase, Supabase 禁止）およびブラウザセキュリティ制限（`file://` による `fetch`/`localStorage` 阻害）に基づき却下。
* **Zero-Build & Question SSOT Integrity**:
  * `takamiya-typing-game-master-v3.csv`（180問）が引き続き Question Master SSOT。
  * `npm run build:bundle` で生成された `src/data/defaultQuestions.js` は Git 管理下にあり、本番デプロイ時に追加のバンドラー構築は不要。
* **Production Versioning Contract**:
  * Frontend Application Version: `1.0.0`（`package.json`, `index.html`, スコア送信メタデータ）
  * Backend SchemaVersion: `1.1.0`（スプレッドシート `Meta` シート, 7列 `Players` スキーマ）
* **TEST001 Production Handling**:
  * `Scores` シートはヘッダーのみ（スコア 0件）のためランキングへは一切露出しない。
  * 本番運用開始前チェックリストとして `TEST001` の無効化（`Enabled: FALSE`）または隔離を定義。
* **Production Acceptance Matrix Defined**:
  * 次工程（Phase 10B）で実施する本番 E2E 検証マトリクス（本番モード一連フロー、練習モード非送信、クロスブラウザ集約、パフォーマンス基準）を確定。
* **Scope Exclusions Maintained**:
  * Production Frontend Deployment: `NOT IMPLEMENTED`（次工程 Phase 10B にて実施）
  * 機能追加（BGM, サウンド, 実績, 管理画面等）: `NONE`
  * AI Development Core: 変更なし
  * 全自動テスト 840件 全件 PASS 維持。

---

## 15. Implementation Phase 10B: GitHub Pages Controlled Production Deployment & Final E2E Acceptance (2026-09-04)

### 15.1 実装サマリー
* **GitHub Repository & Pages Setup**:
  * Authoritative Repository: `https://github.com/mikisaa/base-typing-game`
  * Owner: `mikisaa`, Repo: `base-typing-game`, Visibility: `public`
  * Remote `origin` を設定し、`main` ブランチのトラッキングを確立。
  * Pages 設定: GitHub Actions ワークフローによるデプロイ方式（`build_type: workflow`）を有効化。
* **Production Deployment Workflow (`.github/workflows/deploy-pages.yml`)**:
  * Official Actions: `actions/checkout@v4`, `actions/setup-node@v4`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4` を採用。
  * Concurrency: `group: "pages"`, `cancel-in-progress: false` による競合防止。
  * Permissions: `contents: read`, `pages: write`, `id-token: write` を最小限設定。
  * ゲート検証: CI 上で `npm ci` ➔ `npm test`（840 PASS） ➔ Question Bundle Drift チェック ➔ 静的アセット必須構成検証を自動実行。
  * **Production Artifact Isolation**: `src/` ディレクトリのみを Pages アーティファクトとしてアップロード。`backend/`, `docs/`, `tests/`, `scripts/`, `package.json`, `.clasp.json` 等の開発・内部ファイルは 404 となり一切非公開。
* **Production URL 確立**:
  * Authoritative Production URL: `https://mikisaa.github.io/base-typing-game/`（HTTPS 200 OK、Mixed Content ゼロ）
* **本番環境実機 E2E 受入検証**:
  * **初期ロード & UI アイデンティティ**: Chrome / Edge で `BASE TYPING GAME`, `Version 1.0.0 (Unified Botanical Palette)` を確認。404 ゼロ、CORS エラー ゼロ、コンソール致命的エラー ゼロ。
  * **プレイヤー名記憶 & 自由入力**: `RELEASE SMOKE TEST` 入力 ➔ リロード後の自動補完 ➔ 自由編集（ロックなし）を検証。
  * **初級 E2E**: 90秒グローバルタイマー完走 ➔ 軽トラック・フォークリフト・背景アニメーション ➔ スコア非同期送信（`2960`点） ➔ 「スコア保存完了」 ➔ リザルトからランキング遷移 ➔ 「今月」「歴代」で自プレイヤーハイライト表示を確認。
  * **中級 / 上級 E2E**: 4tユニック・15tユニックのスプライト表示、動的タイマー、タイピング正常性を確認。
  * **練習モード E2E**: プレイヤー名入力非表示、HUD バッジ非表示、タイマー `PRACTICE`（無制限）、スコア非送信（DB 追加なし）、リザルト画面に「ランキングを見る」ボタン非表示を確認。
  * **Microsoft Edge 受入 & クロスブラウザ PlayerID 集約**:
    * Chrome と Edge の `localStorage` 独立分離（初期状態 null）を確認。
    * Edge から同名 `RELEASE SMOKE TEST` で送信したスコアが、GAS バックエンド側で同一の `PlayerID`（`PL-1788523692693-9848`）へと集約され、ランキングでも単一エントリーとして最高スコア更新（`3500`点）されることを実証。
  * **レスポンシブ検証**: 1920×1080, 1366×768, 1280×720 にて UI 崩れ・クリッピングなしを確認。
* **本番テストデータ クリーンアップ**:
  * Google スプレッドシート `Scores` シート: 2行目以降の全テストスコア行を削除（ヘッダー行のみ保持）。
  * Google スプレッドシート `Players` シート: 2行目以降の全テストプレイヤー行（`TEST001`, `RELEASE SMOKE TEST` 等）を削除（ヘッダー行のみ保持）。
  * テスト端末ブラウザ: `localStorage.clear()` を実行し、残留プレイヤー名を全消去。
  * クリーンアップ後疎通: タイトル画面正常表示、本番モード入力欄が空、ランキング画面が空状態メッセージ（`totalPlayers: 0`, `entries: []`）となることを本番 URL 上で確認。
* **Release Tag**:
  * Git タグ: `v1.0.0`
* **Scope Exclusions Maintained**:
  * 新規機能（BGM, サウンド, 実績, 新モード, 管理画面等）: `NONE`
  * AI Development Core: 変更なし
  * 全自動テスト 840件 全件 PASS 維持。

---

## 16. Implementation Phase 11: Production Operational Handoff & v1.0.0 Development Closure (2026-09-04)

### 16.1 実装サマリー
* **Initial State Audit**:
  * Local HEAD: `41030dc`, Remote origin/main: `41030dc` (Ahead 0 / Behind 0, Clean)
  * Release Tag `v1.0.0` dereferenced commit SHA: `41030dc` (完全一致)
  * GitHub Actions deployment `33872045296`: Status `completed`, Conclusion `success`
* **Production Smoke (Read-Only)**:
  * Frontend: `https://mikisaa.github.io/base-typing-game/` (HTTP 200 OK, Version `1.0.0`, Title `BASE TYPING GAME`)
  * GAS Backend: `https://script.google.com/macros/s/.../exec?op=health` (`ok: true`, `service: BASE_TYPING_GAME_BACKEND`, `schemaVersion: 1.1.0`)
  * Live Ranking: `ok: true`, `totalPlayers: 0`, `entries: []` (Clean Database 状態を完全維持、新規テストデータ再混入ゼロ)
* **Development Closure Status**:
  * 正式ステータスを確定・記録：
    ```text
    APPLICATION_IMPLEMENTATION_COMPLETE
    PRODUCTION_DEPLOYMENT_COMPLETE
    V1_0_0_RELEASE_COMPLETE
    NORMAL_DEVELOPMENT_CLOSED
    PRODUCTION_OPERATION_ACTIVE
    ```
* **Operational SSOT & Inventory Documentation**:
  * `docs/14_operation_manual.md` を全面的に刷新・拡充。
  * Production Components Inventory（Frontend, Backend, DB, Repo, Question SSOT）の明文化。
  * Source of Truth (SSOT) マトリクスの規定による二重管理防止。
  * 通常アップデートワークフロー（Issue ➔ Requirement ➔ Planning ➔ Tests ➔ Push ➔ Pages デプロイ）の確立。
  * ロールバック手順（Frontend: `git revert` + Actions、Backend: GAS デプロイ切戻し）の標準化。
  * データベースバックアップ境界および本番データ保護ルール（手動スナップショット推奨、テストデータ混入禁止、スコア直接改ざん禁止）の策定。
  * プレイヤー名規約（`PLAYER_NAME_IS_NOT_AUTHENTICATION`）およびランキング規約（Best Score Anti-Spam）の固定。
  * インシデント重大度分類（P0〜P3）およびユーザーフィードバック分類（8カテゴリ）の策定。
  * v1.0.0 Frozen Contracts（90秒タイマー、練習無制限、3難易度、自由入力、5色パレット、プログレッシブ建設、EXTRA演出）の明文化。
  * セマンティックバージョン管理方針（SemVer: Patch `1.0.x`, Minor `1.x.0`, Major `2.0.0`）および将来開発エントリーゲート（5項目判断）の確定。
  * パブリックリポジトリ & GitHub Issues 運用ガイドライン（社内機密情報・個人情報の書き込み禁止）の明記。
* **README Audit & Refinement**:
  * `README.md` をパブリックリポジトリ向けに刷新（ゲーム概要、本番 URL、機能一覧、アーキテクチャ、テスト実行方法、セキュリティガイドライン）。
* **Automated Tests**:
  * 全 17 テストスイート（840 テスト）全件 PASS を維持。
* **Tag Integrity**:
  * 既存 `v1.0.0` タグを一切変更・上書きせず、Phase 10B リリース時のコミットを指す状態を完全に維持。


---

## 17. Implementation Phase 12: GAS Frontend Migration, Global Rebrand & Visual Scene Corrections (2026-09-04)

### 17.1 実装サマリー
* **Initial State Audit & Baseline**:
  * Formal State: `BASE_TYPING_GAME_V1_0_0_OPERATIONAL_HANDOFF_COMPLETE`
  * Local HEAD: `41030dc`, Remote origin/main: `41030dc`, Tag: `v1.0.0`
  * Baseline Automated Tests: 840 / 840 PASS
  * Live GAS Regression Tests: 70 / 70 PASS
* **Frontend Hosting Migration (GitHub Pages ➔ Google Apps Script Web App)**:
  * 単一配布URL: `https://script.google.com/macros/s/AKfycbzdPNsWV5kNdtpsF91jkca3lkJSLdVxG_2Ux8V5a5f1kMWLJmogiUG8mzbSiRk3S3xeeQ/exec`
  * `backend/gas/Code.gs` の `doGet(e)` にルーティングを実装：
    * クエリパラメータなし（Bare `/exec`）➔ `HtmlService.createTemplateFromFile("Index").evaluate()` によりフロントエンド画面を提供。
    * クエリパラメータ `op` が存在（`health`, `getPlayers`, `getRankings`）➔ 既存 JSON REST API を完全維持。
    * `doPost(e)` による `submitScore` API も100%維持。
  * **決定論的 GAS フロントエンドビルダー (`scripts/buildGasFrontend.js`)**:
    * `esbuild` を導入し、`src/` 配下のNative ES Modulesを単一ブラウザクライアントバンドル `backend/gas/ClientBundle.html` へトランスパイル。
    * `src/index.css` を `<style>` タグで囲んだ `backend/gas/Stylesheet.html` へ生成。
    * `backend/gas/Index.html` テンプレートを生成し、Apps Script HtmlServiceパターンで安全にinclude。
    * 生成バンドル内に未解決 `import`、相対ファイルパス、GitHub Pages依存が存在しないことを検証する自動テスト（`tests/testGasBuild.js`）を追加。
* **Global Product Rebrand (`TakamiyaTypingGame` / `TTG`)**:
  * Canonical Product Name: `TakamiyaTypingGame`
  * Display Name: `TAKAMIYA TYPING GAME`（日本語文中: `Takamiya Typing Game`）
  * Short Name / Alias: `TTG`
  * Repository Slug: `takamiya-typing-game`
  * `package.json`: `name: "takamiya-typing-game"`, `version: "1.1.0"`
  * Backend Service Name: `TAKAMIYA_TYPING_GAME_BACKEND`（定数: `TTG_BACKEND`）
  * Google Apps Script プロジェクト名: `TakamiyaTypingGame` へ変更。
  * Google スプレッドシート名: `TakamiyaTypingGame DB` へ変更（ID: `1-HUuzXK27t2eRJEwgSMVO1bNVkVRwVTyzb4LftW5TX8` を維持）。
  * `localStorage` キー移行:
    * 新キー: `ttg.lastPlayerName.v1`
    * `src/storage/playerStorage.js` に例外安全なマイグレーションロジックを実装（新キー存在時利用 ➔ なければ旧キー `baseTypingGame.lastPlayerName.v1` を読み出し・新キー保存・旧キー安全削除）。
  * Local folder path: Workspace ContextおよびAI Development Coreの安定性を保つため、`base-typing-game` を Technical Exception として維持。
* **UI Bespoke Pixel Inline SVG Icons (Zero OS Emoji)**:
  * `src/visual/pixel/uiIconsSvg.js` を新規作成。5色パレット（`#FFFFFF`, `#F5FBDA`, `#D9EFBD`, `#B9D175`, `#450C3F`）に厳密に準拠した自作ピクセルインラインSVG体系を構築。
  * モード選択カード: 文字代替（`[本]`、`[練]`）を完全撤廃し、本番モード＝物流トラック、練習モード＝メカニカルキーボードのピクセルSVGを配置。
  * ランキングボタン: 表彰台・スコアボードピクセルSVG（`podium`）を配置。
  * ステージバッジ: 現場記号ピクセルSVG（`stage`）を配置。
  * SUCCESS / MISS フィードバック: キラキラ輝き（`sparkle`）および衝突・資材落下（`collision`）ピクセルSVGを表示。
  * リザルト画面: スコア、正確率、コンボ等の主要指標横に小型ピクセルSVGを配置。
  * OS絵文字・Unicode絵文字・外部アイコンライブラリの使用ゼロを検証。
* **Visual Scene Corrections (15t大型トラック & 難易度別MISS資材落下)**:
  * `src/visual/pixel/trucksSvg.js` の `TRUCK_METADATA`:
    * 上級15tユニック車に `visualYOffset = -6` を設定。車体を上方に移動し、地面およびフォークリフトとの高さバランスを最適化。初級・中級トラックの位置は一切変更なし。
    * 難易度別のMISS時資材落下ジオメトリ（`missDrop: { deltaX, deltaY, rotation }`）を `TRUCK_METADATA` に定義：
      * Beginner: `dx: 48, dy: 14, rot: 18deg`（軽トラ手前の自然な空間へ着地）
      * Intermediate: `dx: 40, dy: 10, rot: 16deg`（4tユニックキャブ手前へ着地）
      * Advanced: `dx: 30, dy: 6, rot: 14deg`（15tユニック大型車体手前へ着地）
  * `src/visual/animation/visualScene.js`:
    * `renderTruck()` で `visualYOffset` を反映。
    * `triggerMiss()` およびアニメーション更新ループで、トラック定義の `missDrop` パラメータを動的に参照して資材落下開始・着地座標を計算。
* **GitHub Pages Cutover**:
  * `.github/workflows/deploy-pages.yml` を削除。
  * `.github/workflows/ci.yml`（CIテスト & GASフロントエンドビルド整合性検証のみ）へ置換。Pagesデプロイを停止。
* **実機ブラウザ E2E & パフォーマンス検証**:
  * GAS Web App 実URL（`https://script.google.com/macros/s/AKfycbzdPNsWV5kNdtpsF91jkca3lkJSLdVxG_2Ux8V5a5f1kMWLJmogiUG8mzbSiRk3S3xeeQ/exec`）にて実機検証を実施。
  * Chrome / Edge での高速連続タイピング、キーボードフォーカス、日本語ローマ字判定、アニメーション（60fps）、スコア非同期保存（`"スコア保存完了"`）、ランキング画面表示を確認。
  * recording: `gas_e2e_verification_1788530202551.webp`
* **Automated Tests**:
  * ベースライン: 840 テスト
  * 新規追加テスト: 67 テスト（`tests/testRebrandAndSvg.js`, `tests/testGasBuild.js`）
  * 合計: **907 / 907 PASS** (0 failed)
  * 実稼働 GAS エンドポイント回帰テスト: **70 / 70 PASS** (0 failed)

---

## 2026-09-05: Phase 13 — Result Metric Fix, Recognizable Icon System, Copy Cleanup & Realistic Gameplay Colors (v1.2.0)

* **Phase 目的**:
  1. 本番リザルト画面の「入力文字数」が `NaN文字` になる不具合の根本解消。
  2. インラインSVGアイコンを一般UIアイコン（トラック、キーボード、表彰台、check-circle、x-circle等）と同程度に一目で意味が伝わる明瞭なベクターアイコンへ変更。
  3. タイトル画面の文言整理（サブタイトル削除、ランキング説明文を `今月・歴代` に変更）。
  4. ゲーム画面（フォークリフト・資材・トラック・背景・EXTRA）の5色カラーパレット制約を解除し、実物・現実に近い自然な色（Realistic Colors）へ刷新。
* **Root Cause & Fix — Production Result `NaN文字`**:
  * **根本原因**: `GameSession.getSummary()` において `typedCharacterCount: this.typedCharacterCount` は返されていたが、`totalKeystrokes` および `correctKeystrokes` が定義されていなかった。一方、`src/main.js:396` では `metricChars.textContent = `${summary.totalKeystrokes || (summary.correctKeystrokes + summary.typingMistakeCount)} 文字`` と計算しており、`undefined + summary.typingMistakeCount` の演算によって `NaN` 文字列が発生していた。
  * **修正内容**:
    * `src/engine/gameSession.js`: `getSummary()` に明示的に `typedCharacterCount`, `typedCharacters: this.typedCharacterCount`, `totalKeystrokes: this.typedCharacterCount + this.typingMistakeCount`, `correctKeystrokes: this.typedCharacterCount` を定義。
    * `src/main.js`: `summary.typedCharacterCount ?? summary.typedCharacters ?? 0` を使用し、常に有限非負整数（0文字入力時も `0 文字`）が表示されるよう一元化。
    * `submitProductionScore` のペイロード `typedCharacters` とリザルト表示指標の Single Source of Truth（同一値）を保証。
* **Recognizable UI Vector Icons System**:
  * `src/visual/pixel/uiIconsSvg.js` を刷新。ピクセルアートに拘泥せず、Lucide / Material Icons 等の一般的なUIベクターアイコンと同等の高い視認性・意味伝達性を実現。
  * 本番モード: 配送用トラックのクリーンなシルエット（荷台、運転席、車輪）。
  * 練習モード: 角丸ボディにキー配列とスペースバーを備えた明確なキーボード。
  * ランキング: 1位に星を配した表彰台（ポディウム）。
  * ステージ: 街並み・オフィスビル。
  * SUCCESS: 一目で成功とわかる `check-circle`（円形＋チェックマーク）。
  * MISS: 一目で失敗とわかる `x-circle`（円形＋バツマーク）。
  * リザルト指標: スピードメーター（SCORE）、ブルズアイ（ACCURACY）、炎（COMBO）、ビル（STAGE）。
  * UIアイコンはすべて TTG Botanical 5色パレット（`#FFFFFF`, `#F5FBDA`, `#D9EFBD`, `#B9D175`, `#450C3F`）に厳密準拠。Reactや外部フォント依存ゼロ、OS絵文字ゼロ。
* **Title Screen Copy Cleanup**:
  * `src/index.html`: 旧サブタイトル `<p class="subtitle">仮設足場資材の積込作業をテーマにした爽快タイピングゲーム</p>` を完全削除。
  * `src/index.css`: `.main-title` のマージン（`margin-bottom: 1.75rem`）を調整し、タイトルとボタン間の自然な余白を確保。
  * ランキングボタン説明文を完全一致で `今月・歴代` に更新（旧: `今月・歴代の最高記録`）。
  * バージョン表記を `Version 1.2.0 (TTG Realistic Edition)` に更新。
* **Gameplay Scene Realistic Colors Contract**:
  * `src/visual/pixel/scenePalette.js` を新設し、ゲーム世界専用の意味ベースカラー定数を集約。
  * フォークリフト: インダストリアルイエロー（`#F59E0B`, `#FDE047`, `#D97706`）、ダークスチールマスト・キャビン（`#334155`, `#1E293B`）、ダークスチールフォーク（`#475569`）。
  * 仮設足場資材: 亜鉛メッキ鋼管スチールグレー（`#94A3B8`, `#CBD5E1`, `#E2E8F0`, `#F8FAFC`）、木製パレット（`#D97706`, `#78350F`）、PPバンド（`#1E3A8A`）。
  * トラック: 実車らしいホワイトキャブ（`#F8FAFC`, `#CBD5E1`）、ダークシャーシ（`#1E293B`）、スチール荷台（`#64748B`）、安全色レッドのユニッククレーン（`#DC2626`）。
  * タイヤ: ダークラバー（`#0F172A`, `#1E293B`）。
  * 背景・空: 白一色の空から自然なスカイブルーグラデーション（`#BAE6FD` ➔ `#E0F2FE` ➔ `#F0F9FF`）へ変更。
  * 地面: 資材ヤードに相応しいコンクリート・アスファルトグレー（`#94A3B8`, `#475569`）および白色車線ストライプ（`#F8FAFC`）。
  * 建造物: 多彩な外壁色（ベージュ `#FEF3C7`, テラコッタ `#991B1B`, スレート `#CBD5E1`, ガラスブルー `#0284C7`, `#38BDF8`）。
  * ランドマーク: 東京タワーを赤白（`#DC2626`, `#FFFFFF`）、スカイツリーをシルバー・淡色スチール（`#F1F5F9`, `#94A3B8`, `#0284C7`）へ変更。
  * EXTRA: `rainbowSvg.js` にて本物の7色スペクトル虹（赤・橙・黄・緑・シアン・青・紫）を描画。
  * **パレット分離**: UI（`UI_PALETTE` = Botanical 5色）と Gameplay World（`SCENE_PALETTE` = Realistic Colors）を明確に分離し、UIの色彩ドリフトを防止。
* **Automated Tests**:
  * ベースライン: 907 テスト
  * 新規追加・更新テスト: 75 テスト（NaN回帰、アイコン識別性、コピー、現実色パレット等）
  * 合計: **982 / 982 PASS** (0 failed)
  * 実稼働 GAS エンドポイント結合テスト: **70 / 70 PASS** (0 failed)
* **Production Deployment**:
  * Authoritative GAS Deployment ID: `AKfycbzdPNsWV5kNdtpsF91jkca3lkJSLdVxG_2Ux8V5a5f1kMWLJmogiUG8mzbSiRk3S3xeeQ`
  * Version: `@13 (TakamiyaTypingGame v1.2.0)`
  * URL 不変（利用者への再配布不要）。

