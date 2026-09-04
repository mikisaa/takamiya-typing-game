# 01_requirements.md — 要件定義書

## 1. プロジェクトのゴールとスコープ (Goal & Scope)

### 1.1 プロジェクトゴール
部署内での利用を主目的とした、**仮設足場・積込作業をテーマにした2D横スクロール風タイピングゲーム**（Canonical: `TakamiyaTypingGame` / Display: `TAKAMIYA TYPING GAME` / Alias: `TTG` / slug: `takamiya-typing-game`）を構築・運用する。
教育アプリ然とさせるのではなく、ゲームとして普通に楽しく遊べる・熱中できる体験を提供することで、社員のタイピング速度向上、キーボード操作習熟、ブラインドタッチ練習を支援する。
問題データとして、ChatGPTでレビュー・修正済みの正式な問題マスター `data/questions/takamiya-typing-game-master-v3.csv`（全180問：初級60・中級60・上級60）を Content SSOT として取り込み、問題長に応じた適切な走行時間でタイピング練習・競技が行える設計とする。

### 1.2 スコープ境界 (Scope Boundary)
* **対象環境**: PCデスクトップブラウザ（Chrome / Edge / Firefox）。
* **アーキテクチャ範囲**: Google Apps Script (GAS) Web App 単一URL配布（HtmlService によるフロントエンド配信 + 既存 JSON REST API） + Google Spreadsheet (`TakamiyaTypingGame DB`)。
* **データ範囲**: プレイヤーマスター、Question Master v3（全180問）、プレイ履歴・スコア記録、期間別ランキング。
* **v1.1.0 変更スコープ**:
  1. Frontend配布をGitHub PagesからGoogle Apps Script Web App URLへ移行。
  2. BaseTypingGameからTakamiyaTypingGame（略称: TTG）への全面リブランディング。
  3. UIの漢字・文字代替を自作ピクセルインラインSVGアイコンへ置換（OS絵文字ゼロ維持）。
  4. 15t大型トラックの車体高調整（`visualYOffset: -6`）および難易度別MISS時資材落下位置調整（Difficulty-specific MISS Geometry）。

---

## 2. 機能要件 (Functional Requirements)

- [FR-001] 2D横スクロール風ゲームプレイループ & 2種タイマー制御
  - 画面左から仮設足場資材を爪に載せたフォークリフトが右方向へ走行し、右端に停車中のトラックへ到達する前に、表示された単語・文章を正確にタイピングする。
  - ゲーム全体の残り時間を管理する「Global Game Timer（本番90秒）」と、1問ごとのフォークリフト走行時間を管理する「Per-Question Forklift Timer」を明確に分離して制御する。

- [FR-002] タイピング入力 & ローマ字判定エンジン
  - 画面上の入力欄フォーカス操作を不要とし、ゲーム画面内のキーボード入力を直接捕捉（Keydown）する。
  - 日本語問題文、ローマ字ターゲット、入力済み文字、未入力文字、ミスタイプ視覚フィードバックを明瞭に区分表示する。
  - `RecommendedRomaji` は代表例として扱い、実際の判定は `Reading` を基準として一般的な日本語ローマ字入力の複数表記（例: 「し」→ `shi`/`si`、「ち」→ `chi`/`ti`、「つ」→ `tsu`/`tu`、「ふ」→ `fu`/`hu`、「じ」→ `ji`/`zi`、「じゅ」→ `ju`/`zyu`/`jyu`、「促音」→ 子音重ね/`xtsu`/`ltu`、「撥音」→ `n`/`nn`/`xn` 等）を完全受理する。
  - 英数字・ASCII混在語（例: `AI`, `TQM`, `2S`, `4M3H`, `OPE-MANE`, `OPERA`, `TLEVER`, `T-Earth`, `Base` 等）について、ASCII部分はそのまま大文字小文字不問（case-insensitive）で入力可能とする。

- [FR-003] 積込成功演出 (SUCCESS Flow)
  - Per-Question Forklift Timer 以内（トラック到達前）に入力完了した場合、フォークリフトがトラック前で停止し、爪/荷物が上昇して荷台へ資材が移動するアニメーションを行い、「SUCCESS」演出とともにSCORE/COMBOを加算し、背景建設を進行させて次の問題へ移行する。

- [FR-004] タイムオーバー・失敗演出 (MISS Flow)
  - 入力が間に合わず Per-Question Forklift Timer が満了（トラックへ到達）した場合、トラック接触時の振動と爪上の資材が難易度に応じた適切な座標へ落下するアニメーションを行い、COMBOをリセットし、Global Game Timer から難易度別 Penalty を減算して次の問題へ移行する（人身負傷等のリアル事故描写は行わない）。

- [FR-005] 難易度体系 & 積込対象車両テーマ
  - 「初級」「中級」「上級」の3段階難易度を提供する。
  - 初級: 軽トラック（白系・小型Pixel Art）。ターゲットKPS 2.0、長めの反応余裕時間。
  - 中級: 4tユニック車（中型平ボディ・クレーン付Pixel Art）。ターゲットKPS 3.2、標準反応余裕時間。
  - 上級: 15tユニック車（大型長荷台・大型クレーン付Pixel Art）。ターゲットKPS 4.5、長文・業務文章対応。車体位置は画面バランス上最適な上方オフセット（`visualYOffset: -6`）を適用。

- [FR-006] プレイモード体系 (練習モード & 本番モード)
  - 全難易度において「練習モード」と「本番モード」を提供する。
  - 練習モード: ランキング登録なし、Per-Question Forklift Timer は本番の1.5倍の余裕時間（`practiceMultiplier = 1.5`）、正確率や入力結果の確認可能、車両・資材・積込演出は本番同様に実行。
  - 本番モード: Global Game Timer（90秒）制限時間制、SCORE・COMBO・TIME BONUS・MISS Penaltyあり、リザルト画面表示、Google Spreadsheetへのスコア・ランキング登録。

- [FR-007] 仮設足場資材アセット
  - フォークリフトの爪に載せる資材として、最低7種類（支柱、手摺、建枠、布板、筋交、ジャッキベース、小物資材パレット）のオリジナルPixel Art / SVGアセットを用意し、問題ごとにランダム出現させる。

- [FR-008] 背景建設・発展進行システム (Background Progression)
  - 正解数に応じて背景の街並みが段階的に発展する（1: 更地 → 2: コンテナ → 3: 家 → 4: ビル → 5: 高層ビル → 6: 東京タワー → 7: スカイツリー）。
  - 各構造物は基礎から完成へ徐々に組み上がる感覚を表現する。

- [FR-009] 通常最終ステージ & EXTRAステージ
  - 通常ステージの最終到達ランドマークを「スカイツリー（抽象化Pixel Art）」とし、完成後もゲームプレイを継続可能とする。
  - スカイツリー完成後は「EXTRAステージ」へ移行し、完成都市の背景に動的演出（旅客機通過、ヘリ旋回、風船浮上、パラシュート降下、虹フェードイン）を同時2〜4個の範囲でランダム重畳表示する。

- [FR-010] COMBO & TIME BONUS システム
  - ミスなく連続して入力成功することでCOMBOが加算され、規定COMBO到達時にスコア倍率アップおよびTIME BONUS（Global Game Timer への時間加算）を付与する。
  - 1ゲーム内での再取得制御およびボーナス上限値を設定可能とする。

- [FR-011] リザルト画面 & スコア算出
  - 本番プレイ終了時に、Score、正解問題数、入力文字数、ミスタイプ数、Accuracy（正確率）、Maximum Combo、Play Duration（プレイ時間）、難易度、プレイ日時（PlayedAt）、WPM/KPMをリザルト画面に集計表示する。

- [FR-012] 期間別・難易度別ランキング機能
  - ランキング期間は「今月」および「歴代」の2種類のみとし、難易度（初級・中級・上級）ごとに分離集計する。
  - 同一プレイヤーによる上位独占を防ぐため、期間×難易度ごとに各プレイヤーの自己最高スコアのみをランキング表示する。

- [FR-013] 自由入力プレイヤー名 & ブラウザ記憶・クロスブラウザ解決方式
  - Google Workspace組織認証を使用せず、本番モード開始時にプレイヤー名を自由入力（Text Input）する方式を採用する。
  - 同一ブラウザでは前回入力した名前を `localStorage`（キー: `ttg.lastPlayerName.v1`）に記憶し、次回セットアップ時に自動プレフィル（共有PC利用を考慮し、自動開始は行わず常時編集可能）。
  - 旧キー（`baseTypingGame.lastPlayerName.v1`）が存在する場合は自動で新キーへ移行し、旧キーを安全に削除する例外安全マイグレーションを実装。
  - 別ブラウザや別PCからでも同じ名前（サーバー側正規化 `PlayerNameKey` による判定）を入力した場合は同一PlayerIDへ紐付け、初回入力時はバックエンドでPlayerレコードを自動生成する。
  - プレイヤー名は本人認証ではなく（`PLAYER_NAME_IS_NOT_AUTHENTICATION`）、同姓同名の別人は意図的仕様として同一Playerとして扱う（`SAME_NORMALIZED_NAME_MEANS_SAME_PLAYER`）。練習モードでは名前入力を行わない。

- [FR-014] 単語・問題データ駆動管理 & Question Master v3 SSOT
  - 正式な問題データとして `data/questions/takamiya-typing-game-master-v3.csv`（全180問：初級60/中級60/上級60）を取り込み、Content SSOT として管理する。
  - ソースコードへの180問ベタ書き（ハードコード）を排除し、データ駆動でロード・出題可能な設計とする。

- [FR-015] GAS バックエンド連携 API & HtmlService ルーティング
  - Google Apps Script Web App の単一エンドポイントにて、クエリパラメータなし（Bare `/exec`）の場合はフロントエンドHTMLを返し、パラメータ `op` が存在する場合は既存のJSON API（`health`, `getPlayers`, `getRankings`）およびPOST（`submitScore`）を維持する。

- [FR-016] 動的走行時間モデル & ゲームコンフィグ一元管理
  - フォークリフト走行時間を「難易度 + 実効入力文字数」から動的に算出する Timing Model（`allowedTime = clamp(minTime, maxTime, reactionAllowance + (effectiveKeystrokes / targetKps))`）を導入する。
  - 同一文字数であれば 初級 > 中級 > 上級 の順で入力可能時間が長く、難易度階層が維持される。

- [FR-017] 自作ピクセルインラインSVGアイコン体系 (FR-018)
  - OS絵文字およびUnicode絵文字を完全禁止し、5色パレット（`#FFFFFF`, `#F5FBDA`, `#D9EFBD`, `#B9D175`, `#450C3F`）に厳密に準拠した自作ピクセルインラインSVGアイコンを配置。
  - モード選択カード（本番トラック / 練習キーボード）、ランキング（表彰台）、ステージバッジ（現場記号）、SUCCESS（輝き）、MISS（衝突・落下資材）、リザルト指標（スコア、正確率、コンボ）を視覚表現し、文字代替（`[本]`、`[練]`等）を完全撤廃。

- [FR-018] 難易度別MISSジオメトリ & 上級トラック視覚補正 (FR-019)
  - 15tユニック車の表示位置を自然に見えるよう上方に補正（`visualYOffset: -6`）。初級・中級のトラック位置は変更しない。
  - MISS時の資材落下座標を難易度ごとの車両形状・荷台位置に応じて定義（Beginner: `dx: 48, dy: 14`, Intermediate: `dx: 40, dy: 10`, Advanced: `dx: 30, dy: 6`）。フォークリフトがトラック直前で衝突し、資材がトラック手前に自然に着地するアニメーションを実現。

---

## 3. 非機能要件 (Non-Functional Requirements)

- [NFR-001] フロントエンド描画パフォーマンス
  - GAS Web Appホスティング環境（iframe sandbox内）においてもPCブラウザ上で60fpsのアニメーション描画を維持し、キー入力遅延や画面のカクつきを排除する。

- [NFR-002] GAS入力検証 & Spreadsheet Formula Injection対策
  - クライアントから送信されたスコアパラメータの型・範囲をGAS側でバリデーションし、プレイヤー名等の文字列先頭にある特殊文字（`=`, `+`, `-`, `@`）をエスケープしてスプレッドシートへの数式注入を防止する。

- [NFR-003] 同時書き込み排他制御 (LockService)
  - スコア登録時のSpreadsheet書き込み競合を防止するため、GASの `LockService.getScriptLock()` を利用して安全なトランザクションを担保する。

- [NFR-004] デスクトップPCブラウザ適合性 & 崩壊防止
  - 主用途である一般的なデスクトップブラウザ解像度（1920x1080, 1366x768等）において視認性と操作性を担保し、ウィンドウリサイズ時にも画面崩壊しないレスポンシブコンテナを維持する。

- [NFR-005] 決定論的GASフロントエンドビルド
  - ESモジュールで構成された `src/` 配下のソースコードを `esbuild` により決定論的単一バンドル（`backend/gas/ClientBundle.html`）へ変換し、CSSをインライン化した `Stylesheet.html` および `Index.html` を一括生成可能とする。手作業でのコピー・編集を排除。

---

## 4. スコープ外事項 (Explicit Out of Scope) & 制約

### 4.1 明示的スコープ外 (Out of Scope)
* Vercel, Firebase, Supabase などの外部クラウドDB/認証基盤の利用。
* 社内共有ファイル/共有フォルダを介したファイルベースランキングDB。
* Google Workspace組織アカウント（OAuth/SSO/Directory）前提の社員特定基盤。
* 1キー入力ごとの常時サーバー通信やリアルタイムマルチプレイ対戦。
* 3Dグラフィックスや重負荷物理演算エンジンの導入。
* 外部アイコンフォント（Font Awesome）やCDN画像アセットのロード。
* 過去コミット履歴や `v1.0.0` タグの改変（Git history rewrite禁止）。

### 4.2 制約事項 (Constraints)
* ゲーム中のタイピング判定、タイマー、COMBO、アニメーションはすべてブラウザ側JavaScriptで完結すること。
* 5色パレット（`#FFFFFF`, `#F5FBDA`, `#D9EFBD`, `#B9D175`, `#450C3F`）のみを使用すること。
* 90秒グローバルタイマー、スコア計算式、問題CSVマスター（180問）のゲームロジックを変更しないこと。
