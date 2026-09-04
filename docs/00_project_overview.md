# プロジェクト概要 (00_project_overview.md)

## Project Brief

### 1. プロジェクトの目的と概要
部署内で遊ぶことを主目的とした、**仮設足場・積込作業をテーマにした2D横スクロール風タイピングゲーム**（Canonical: `TakamiyaTypingGame` / Display: `TAKAMIYA TYPING GAME` / Alias: `TTG` / slug: `takamiya-typing-game`）を開発・運用する。
教育アプリ然とさせるのではなく、ゲームとして普通に楽しく遊べる・熱中できることを最優先とする。
副次的な効果として以下を目指す：
* タイピング速度向上
* キーボード操作への習熟
* ブラインドタッチ練習

入力問題には会社・業務・仮設足場等に関係する言葉・用語を使用し、正式な問題マスターとして `data/questions/takamiya-typing-game-master-v3.csv`（全180問：初級60・中級60・上級60）を Content SSOT として取り込む。

### 2. 対象アーキテクチャ & 責務境界
* **Production Frontend Runtime**: Google Apps Script (GAS) Web App (`/exec` HtmlService)
* **Frontend Build Source**: `src/` (HTML5, Vanilla CSS, JavaScript ES6+, 2D Pixel Art / Inline SVG)
* **GAS Deployment Artifact**: `backend/gas/Index.html`, `Stylesheet.html`, `ClientBundle.html`
* **Backend**: Google Apps Script (GAS) Web App (JSON endpoints & HtmlService router)
* **Data Store**: Google Spreadsheet (`TakamiyaTypingGame DB`)
* **非使用技術**: Vercel, Firebase, Supabase, 社内ファイル共有DB, Google Workspace組織認証前提機能, 常時サーバー通信
* **通信原則**: ゲーム進行（タイピング判定、タイマー、COMBO、アニメーション、背景進化）はすべてブラウザ側JavaScriptで完結。GAS通信は「初期設定・Player master取得」「本番結果登録」「ランキング取得」に限定。1キー入力ごとの通信は厳禁。

### 3. ゲームモード & 難易度体系
3段階の難易度（初級・中級・上級）× 2つのプレイモード（練習モード・本番モード）を提供。
* **初級（軽トラック）**: 軽トラPixel Art。ターゲットKPS 2.0、長めの反応余裕時間。
* **中級（4tユニック）**: 4tユニック車Pixel Art。ターゲットKPS 3.2、標準反応余裕時間。
* **上級（15tユニック）**: 15t大型ユニック車Pixel Art。ターゲットKPS 4.5、長文・業務文章対応。車体位置を視覚最適化（`visualYOffset: -6`）。
* **練習モード**: ランキング登録なし、タイピング練習特化、入力結果・正確率確認可能、演出は本番同様、制限時間は本番の1.5倍の余裕設定。
* **本番モード**: 90秒制限時間制、SCORE・COMBO・TIME BONUS・MISS Penaltyあり、リザルト画面表示、Google Spreadsheetへのランキング登録。

### 4. 動的走行時間モデル (Dynamic Timing Model)
フォークリフトが左端からトラックへ到達するまでの時間（Per-Question Forklift Timer）は、**難易度 + 実効入力文字数（effectiveKeystrokes）** の両方から決定論的に算出する。
* 算出式: `allowedTime = Math.min(Math.max(reactionAllowance + (effectiveKeystrokes / targetKps), minTime), maxTime)`
* 同一文字数であれば 初級 > 中級 > 上級 の順で入力可能時間が長く、難易度階層が厳格に維持される。
* 全体残り時間（Global Game Timer: 90秒）と問題単位の走行時間（Per-Question Forklift Timer）を明確に分離。

### 5. ゲームプレイ & アニメーション演出
* **基本ループ**: 画面左から仮設足場資材（支柱、手摺、建枠、布板、筋交、ジャッキベース、小物資材パレット等）を爪に載せたフォークリフトが右へ走行。トラック到達前に問題を正しくタイピングする。
* **成功演出（SUCCESS）**: トラック前で停止 → 爪/荷物が上昇 → 荷台へ移動 → 短いSUCCESS演出（Pixel Inline SVG） → SCORE/COMBO更新 → 背景建設進行 → 次の問題へ移行。
* **失敗演出（MISS）**: トラックへ軽く接触 → 車体・画面振動 → 爪上の資材が難易度別の自然な位置へ落下（Difficulty-specific MISS Geometry） → MISS表示（Pixel Inline SVG） → COMBOリセット → Global Game TimerへのPenalty減算 → 次の問題へ（コミカル演出、負傷等なし）。
* **背景進化**: 更地 ➔ コンテナ ➔ 家 ➔ ビル ➔ 高層ビル ➔ 東京タワー ➔ スカイツリー（通常ステージ完成）へと正解数に応じて段階的に成長。
* **EXTRAステージ**: スカイツリー完成後の継続モード。完成都市上空・周辺にAirplane、Helicopter、Balloons、Skydiving、Rainbowが動的に発生。

### 6. タイピングUX & ローマ字入力エンジン
* 日本語問題、ローマ字ターゲット、入力済み文字、未入力文字、ミスタイプ視覚フィードバックを明瞭に区分。
* 入力欄へのフォーカス操作不要（直接Keydown捕捉）。
* `RecommendedRomaji` は代表例であり、`Reading` を基準とした一般的な日本語ローマ字入力の複数表記（shi/si, chi/ti, tsu/tu, fu/hu, sha/sya, cha/tya, ja/zya, 促音、撥音等）を完全受理。
* 英数・ASCII混在語（AI, TQM, 2S, 4M3H, OPE-MANE, OPERA, TLEVER, T-Earth, Base等）はASCII部分を大文字小文字不問（case-insensitive）でそのまま入力可能。

### 7. UI デザイン & アイコン契約 (v1.2.0)
* **UI ボタニカル 5色パレット**: メニュー、HUDコンテナ、ボタン、カード、ランキング、リザルト画面は `#FFFFFF`, `#F5FBDA`, `#D9EFBD`, `#B9D175`, `#450C3F` を厳格に遵守。
* **Zero OS Emoji**: Unicode / OS 絵文字を完全排除。
* **一目で分かる UI ベクターアイコンシステム (v1.2.0)**:
  * モード選択カード（本番トラック / 練習キーボード）、ランキング（表彰台）、ステージ街並み、SUCCESS (check-circle)、MISS (x-circle)、リザルト指標（スピードメーター、ブルズアイ、炎、ビル）を誰もが一目で判読できる明瞭なインラインベクターSVGへ刷新（OS絵文字ゼロ、React依存ゼロ）。
* **ゲームプレイシーンの現実色・自然色化 (v1.2.0)**:
  * ゲームシーン（フォークリフト、足場資材、トラック、地面、空、背景建造物、東京タワー、スカイツリー、EXTRA演出）について旧5色制約を解除し、実物・現実に近い自然なカラーパレット（`scenePalette.js`）を適用。
  * UI（ボタニカル5色パレット）と Gameplay World（現実色）の責務境界を明確に分離。
* **リザルト画面「入力文字数」有限非負整数保証 (v1.2.0)**:
  * 本番・練習リザルトにおいて入力文字数が常に正確な有限非負整数（`〇 文字`、0入力時も `0 文字`）として表示されるよう計算経路を根本修正。
* **タイトル画面文言整理 (v1.2.0)**:
  * 旧サブタイトルを完全削除し、タイトルとモードカード間のレイアウト余白を最適化。
  * ランキング説明文を `今月・歴代` に変更。

### 8. ランキング & データモデル
* ランキング期間: 「今月」「歴代」の2種類のみ。
* 難易度別集計（初級・中級・上級）。本番モードのみ対象。
* 期間×難易度ごとに各プレイヤーの自己最高スコアを表示（同一人物による上位独占を防止）。
* プレイヤー名は自由入力（最大30文字）。同一ブラウザでは `localStorage`（キー: `ttg.lastPlayerName.v1`、旧キーからの自動移行対応）に記憶。
* サーバー側で正規化した `PlayerNameKey` により別ブラウザ・別PC間でも同一PlayerIDへと集約。

### 9. セキュリティ & 信頼性
* GAS側パラメータ検証（難易度、スコア整合性、文字数等）。
* Spreadsheet formula injection対策（先頭 `=`, `+`, `-`, `@` のエスケープ）。
* GAS LockServiceによる同時書き込み排他制御。
* プレイヤー名は本人認証ではなく（`PLAYER_NAME_IS_NOT_AUTHENTICATION`）、同姓同名の別人は意図的仕様として同一Playerとして扱う（`SAME_NORMALIZED_NAME_MEANS_SAME_PLAYER`）。
