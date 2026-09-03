# 02_spec.md — 詳細仕様書

## 1. 画面構成 & UI仕様 (UI & Screen Specifications)

### 1.1 画面遷移モデル (Screen State Model)
アプリケーションは以下の5つの画面状態で構成され、状態遷移は決定論的に実行される。

```text
[タイトル画面 (Title)]
       │
       ▼
[プレイヤー & 設定選択 (Setup / Mode Select)]
       │
       ├─────────────────────────┐
       ▼                         ▼
[ゲームプレイ画面 (Practice)]    [ゲームプレイ画面 (Production)]
       │                         │
       ▼                         ▼
[練習終了画面 (Practice Result)] [本番リザルト画面 (Production Result)]
       │                         │
       │                         ▼
       │                  [ランキング画面 (Ranking)]
       │                         │
       └───────────┬─────────────┘
                   ▼
        [タイトル画面へ戻る]
```

### 1.2 画面一覧 & UIコントロール分類 (UI Surface Reconciliation)

| 画面名 | コントロール / 要素 | 種別 | 対象要件 (Parent FR) | 説明 |
| :--- | :--- | :--- | :--- | :--- |
| **タイトル画面** | `btnStartGame` | DIRECT | [FR-006] | ゲーム設定・プレイヤー選択画面へ進むボタン |
| | `btnViewRanking` | DIRECT | [FR-012] | ランキング画面へ直接遷移するボタン |
| **設定・選択画面** | `inputPlayerName` | DIRECT | [FR-013] | プレイヤー名自由入力欄（本番モードのみ表示、localStorageから前回入力名を自動補完、常時編集可能） |
| | `btnSelectDifficulty` (初級/中級/上級) | DIRECT | [FR-005] | 3段階の難易度を選択するタブボタングループ |
| | `btnSelectMode` (練習/本番) | DIRECT | [FR-006] | 練習モードまたは本番モードを選択するトグルボタン |
| | `btnLaunchGame` | DIRECT | [FR-001] | 選択した条件でゲームプレイを開始するボタン |
| | `btnBackToTitle` | DERIVED_AFFORDANCE | [FR-006] | タイトル画面へ戻るナビゲーションボタン |
| **ゲームプレイ画面** | `displayScore` | DIRECT | [FR-011] | 現在スコア表示（本番モードのみ表示） |
| | `displayGlobalTimer` | DIRECT | [FR-001], [FR-006] | 全体残り時間（Global Game Timer: 初期90秒）表示 |
| | `displayForkliftTimer` | DIRECT | [FR-001], [FR-016] | 現在問題の走行時間（Per-Question Forklift Timer）プログレスバー |
| | `displayCombo` | DIRECT | [FR-010] | 現在の連続正解コンボ数表示 |
| | `displayJapanesePrompt` | DIRECT | [FR-002] | 出題中の日本語文章・単語表示 |
| | `displayRomanizedTarget` | DIRECT | [FR-002] | ローマ字表示（入力済=ハイライト、未入力=グレー） |
| | `canvasGameScene` | DIRECT | [FR-001] | フォークリフト、トラック、資材、背景を描画する2D領域 |
| | `overlayMistype` | DIRECT | [FR-002] | タイピングミス時の赤色フラッシュエフェクト |
| | `btnPauseQuit` | DERIVED_AFFORDANCE | [FR-001] | ゲーム中断してタイトルへ戻るエスケープボタン |
| **リザルト画面** | `displaySummaryMetrics` | DIRECT | [FR-011] | スコア、正解数、文字数、ミス数、正確率、最大コンボ、WPM表示 |
| | `btnSubmitScore` | DIRECT | [FR-015] | 本番スコアをスプレッドシートへ送信（自動送信後の再試行兼用） |
| | `btnRetryGame` | DERIVED_AFFORDANCE | [FR-006] | 同一条件で再プレイを開始するボタン |
| | `btnGoRanking` | DIRECT | [FR-012] | 送信完了後にランキング画面を表示するボタン |
| | `btnReturnTitle` | DERIVED_AFFORDANCE | [FR-006] | タイトル画面へ復帰するボタン |
| **ランキング画面** | `tabPeriod` (今月 / 歴代) | DIRECT | [FR-012] | 「今月」「歴代」を切り替えるタブ |
| | `tabDifficulty` (初級 / 中級 / 上級) | DIRECT | [FR-012] | 難易度を切り替えるタブ |
| | `tableRankingList` | DIRECT | [FR-012] | 順位、プレイヤー名、最高スコア、正確率、達成日時のテーブル |
| | `btnCloseRanking` | DERIVED_AFFORDANCE | [FR-012] | 直前の画面（タイトルまたはリザルト）へ戻るボタン |

---

## 2. ゲームプレイ & アニメーション詳細仕様

### 2.1 2つの独立タイマー概念 (FR-001, FR-016)
ゲーム内には以下の独立した2つのタイマーが存在する。

1. **Global Game Timer（全体ゲームタイマー）**:
   - 本番1ゲーム全体の残り制限時間（初期値: **90秒**）。
   - 画面上部ヘッダーにデジタル秒数として表示。
   - 1問単位のタイムオーバー（MISS）時にペナルティ減算（初級: -3秒, 中級: -4秒, 上級: -5秒）を受ける。
   - 15 COMBO達成時に TIME BONUS（+5秒）が加算される。
   - 0秒到達でゲームオーバー（リザルト画面へ遷移）。
2. **Per-Question Forklift Timer（問題別フォークリフトタイマー）**:
   - 出題された現在の1問について、フォークリフトが左端（X = 5%）からトラック前（X = 75%）へ到達するまでの時間（`allowedTime`）。
   - 問題ごとの実効入力文字数と難易度から動的に算出される。
   - フォークリフトの走行速度は `speed = (70%) / allowedTime` として等速制御される。

### 2.2 動的走行時間モデル (Dynamic Timing Model: FR-016)

#### A. 算出式 (Deterministic Formula)
$$\text{rawAllowedTime} = \text{reactionAllowance} + \left( \frac{\text{effectiveKeystrokes}}{\text{targetKps}} \right)$$

$$\text{allowedTime} = \min\left(\max(\text{rawAllowedTime}, \text{minAllowedTime}), \text{maxAllowedTime}\right)$$

* **練習モードの補正**:
  - `practiceAllowedTime = allowedTime * practiceMultiplier` （`practiceMultiplier = 1.5`）

#### B. Question Master v3 の文字数分布に基づく難易度別パラメータ

Question Master v3（全180問）のキーストローク数分布：
* **BEGINNER (初級, 60問)**: Min 2, Median 6, Avg 6.17, Max 11
* **INTERMEDIATE (中級, 60問)**: Min 3, Median 14, Avg 14.18, Max 32
* **ADVANCED (上級, 60問)**: Min 31, Median 52, Avg 51.60, Max 76

上記分布に基づく初期 Default 設定パラメータ案（実装時に `src/config/gameConfig.js` として作成予定）：

| 難易度 | 積込対象車両 | ターゲットKPS (`targetKps`) | 反応余裕秒 (`reactionAllowance`) | 最小時間 (`minAllowedTime`) | 最大時間 (`maxAllowedTime`) | 中央値文字数での走行時間 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **初級 (Beginner)** | 軽トラック | **2.0** keys/s (120 KPM) | **3.0** 秒 | **4.0** 秒 | **12.0** 秒 | 6.0 秒 (6文字) |
| **中級 (Intermediate)** | 4tユニック | **3.2** keys/s (192 KPM) | **2.0** 秒 | **3.5** 秒 | **14.0** 秒 | 6.38 秒 (14文字) |
| **上級 (Advanced)** | 15tユニック | **4.5** keys/s (270 KPM) | **1.5** 秒 | **5.0** 秒 | **20.0** 秒 | 13.06 秒 (52文字) |

#### C. 難易度階層の維持検証 (同一文字数比較例: 20文字)
* 初級: $3.0 + (20 / 2.0) = 13.0 \rightarrow \mathbf{12.0}$ 秒 (上限クランプ, 最も余裕あり)
* 中級: $2.0 + (20 / 3.2) = \mathbf{8.25}$ 秒 (標準)
* 上級: $1.5 + (20 / 4.5) = \mathbf{5.94}$ 秒 (最も厳しい)
* ➔ 同一文字数において「初級 > 中級 > 上級」の入力可能時間関係が完全に維持される。

### 2.3 基本ゲームループ (FR-001)
1. **問題生成**: Question Master v3 の該当難易度プール（各60問）からランダム抽出。
2. **走行時間算出**: 問題の `effectiveKeystrokes` から `allowedTime` を動的計算。
3. **資材選定**: 7種類の仮設足場資材からランダムに1種類を選択し、爪の上に描画。
4. **走行 & 入力受付**: フォークリフトが `allowedTime` かけて等速走行。プレイヤーのキー入力を直接捕捉。
5. **判定**:
   - `allowedTime` 以内に入力完了 ➔ **SUCCESS Flow (2.4項)**
   - 入力完了前に `allowedTime` 満了（トラック到達） ➔ **MISS Flow (2.5項)**

### 2.4 成功アニメーションフロー (SUCCESS Flow: FR-003)
1. **停止**: フォークリフトがトラック前（X = 75%）で直ちに停止。
2. **荷台上昇 & 移動**: 爪が15px上昇し、足場資材が放物線状に荷台へ移動（所要時間: 250ms）。
3. **SUCCESS表示**: 「SUCCESS!」ポップアップエフェクト、COMBO加算、SCORE加算（所要時間: 200ms）。
4. **背景成長**: 背景建設オブジェクトが1段階成長。
5. **次問題セット**: フォークリフトが初期位置（X = 5%）へリセットされ、新問題・新資材をセットして即座に走行開始（合計遷移時間: 450ms）。

### 2.5 失敗アニメーションフロー (MISS Flow: FR-004)
1. **接触**: フォークリフトがトラックに到達（X = 78%）。
2. **振動 & 落下**: 車体と画面全体が左右に5px振動（200ms）し、爪上の資材が地面へ回転落下（所要時間: 300ms）。
3. **MISS表示**: コミカルな「MISS!」表示、COMBOリセット（0へ）。
4. **ペナルティ減算**: 本番モードの場合、Global Game Timer から難易度別ペナルティ（初級: -3秒, 中級: -4秒, 上級: -5秒）を減算。
5. **次問題セット**: フォークリフトが初期位置へ戻り、新しい問題と資材をセットして走行再開（合計遷移時間: 500ms）。

### 2.6 仮設足場資材アセット (FR-007)
SVG / 2D Canvas によるオリジナルPixel Artアセット（全7種）:
1. `scaffold_shichu` (支柱: ピン穴付き縦パイプ)
2. `scaffold_tesuri` (手摺: 横バー・ロック機構)
3. `scaffold_tatewaku` (建枠: 鳥居型フレーム)
4. `scaffold_nunoita` (布板: アンチ・エキスパンドメタル床板)
5. `scaffold_sujikai` (筋交: クロスブレース)
6. `scaffold_jackbase` (ジャッキベース: ハンドル・ベースプレート)
7. `scaffold_palette` (小物資材パレット: ボルト・クランプ等の小型クレート)

---

## 3. 背景発展 & EXTRAステージ仕様

### 3.1 通常背景進化ステップ (FR-008)
正解数（累積正解数）に応じて背景の建築物が段階的に成長する（設定値としてConfig化）。

| Stage | 発展段階 | 到達基準 (累積正解数) | 視覚表現 |
| :---: | :--- | :---: | :--- |
| **1** | 更地 (Flat Land) | 初期状態 (0問) | 盛土、パイロン、建設看板 |
| **2** | コンテナ (Container Office) | 3問正解 | 現場仮設事務所コンテナの設置 |
| **3** | 家 (Residential House) | 7問正解 | 基礎打ち ➔ 柱立て ➔ 住宅完成 |
| **4** | ビル (Mid-rise Building) | 12問正解 | 鉄骨組立て ➔ 外壁施工 ➔ 中層ビル完成 |
| **5** | 高層ビル (High-rise Tower) | 18問正解 | タワークレーン設置 ➔ ガラスカーテンウォール ➔ 高層ビル完成 |
| **6** | 東京タワー (Tokyo Tower Style) | 25問正解 | 赤白トラス鉄塔の段階的組上がり |
| **7** | スカイツリー (Skytree Style) | 33問正解 | 巨大タワーの完成（通常ステージ到達完了） |

### 3.2 EXTRAステージ演出 (FR-009)
33問正解（スカイツリー完成）以降はEXTRAステージに移行し、ゲーム終了まで完成都市の上空に以下の動的演出がランダム発生する。

* **同時表示制限**: 画面過密防止のため、動的オブジェクトは同時に最大3個までに制限。
* **演出オブジェクト一覧**:
  1. `Airplane`: Pixel Art旅客機が上空を左から右へ水平横断（出現率: 30%）。
  2. `Helicopter`: 小型ヘリがスカイツリー周辺でホバリング＆上下浮遊（出現率: 25%）。
  3. `Balloons`: カラフルな3連風船が下から上へ浮上（出現率: 25%）。
  4. `Skydiving`: 小さなパラシュート降下部隊がゆっくり降下（出現率: 10%）。
  5. `Rainbow`: EXTRA到達時に最背面レイヤーに七色の虹がフェードイン表示。

---

## 4. タイピングUX & ローマ字入力エンジン仕様 (FR-002)

### 4.1 キー入力受付仕様
* **グローバル入力捕捉**: `window.addEventListener('keydown')` でアルファベット（A-Z）、数字（0-9）、記号（ハイフン `-` 等）を直接捕捉。入力フォームへのフォーカス合わせ操作は一切不要。
* **英数字・ASCII混在語の扱い**:
  - `AI`, `TQM`, `2S`, `4M3H`, `OPE-MANE`, `OPERA`, `TLEVER`, `T-Earth`, `Base` 等の英数字部分は、大文字小文字不問（case-insensitive）でそのまま入力可能。
  - 日本語部分はローマ字変換して入力。

### 4.2 ローマ字表記ゆれ受理テーブル (Multi-pattern Matching Engine)
`RecommendedRomaji` は代表例であり、実際の判定は `Reading`（ひらがな）を基準として以下の複数入力を完全受理する。

* `し`: `shi` / `si` / `ci`
* `ち`: `chi` / `ti`
* `つ`: `tsu` / `tu`
* `ふ`: `fu` / `hu`
* `じ`: `ji` / `zi`
* `しゃ/しゅ/しょ`: `sha/shu/sho` / `sya/syu/syo`
* `ちゃ/ちゅ/ちょ`: `cha/chu/cho` / `tya/tyu/tyo` / `cya/cyu/cyo`
* `じゃ/じゅ/じょ`: `ja/ju/jo` / `zya/zyu/zyo` / `jya/jyu/jyo`
* `促音(っ)`: 次の子音重ね（例: `tte`）または `xtsu` / `ltu`
* `撥音(ん)`: 次が母音・ヤ行以外または末尾の場合は `n` 1回でも受理可能、かつ `nn` / `xn` も完全受理。

### 4.3 視覚フィードバック仕様
* **ターゲット表示領域**:
  - 上段: 日本語問題（例: `単管パイプ`）
  - 下段: ローマ字表示（例: `TANKANPAIPU`）
  - 入力済み部分: シアン色（`#00e5ff`）ハイライト
  - 現在入力対象文字: 下線アンダーライン点滅
  - 未入力部分: グレー（`#64748b`）
* **ミスタイプ時**:
  - 入力枠が200ms間赤色（`#ef4444`）にフラッシュ。
  - COMBOを即時0にリセット。入力文字は進まない。

---

## 5. スコア計算 & コンボ・ボーナス仕様 (FR-010, FR-011)

### 5.1 スコア計算式 (Deterministic Formula)
本番モード終了時の総合スコアは以下の確定式により算出する。

$$\text{Score} = \left( \sum (\text{CorrectChars} \times 100 \times \text{ComboMultiplier}) \right) + (\text{RemainingSeconds} \times 50) - (\text{MissCount} \times 20)$$

* **コンボ倍率 (ComboMultiplier)**:
  - 0〜9 COMBO: $1.0\times$
  - 10〜19 COMBO: $1.2\times$
  - 20〜29 COMBO: $1.5\times$
  - 30〜49 COMBO: $1.8\times$
  - 50 COMBO以上: $2.0\times$

### 5.2 TIME BONUS 仕様 (FR-010)
* 連続15 COMBO達成ごとに、Global Game Timer に **+5秒** の TIME BONUS を付与。
* 1ゲーム中でのTIME BONUS累積上限: 最大 **+30秒** まで（無限プレイ化の防止）。

---

## 6. データモデル & Question Master v3 仕様 (FR-013, FR-014)

### 6.1 Question Master v3 仕様 (`data/questions/takamiya-typing-game-master-v3.csv`)
* **総問題数**: 180問（初級: 60問 / 中級: 60問 / 上級: 60問）
* **カラム定義**:
  1. `ID`: 一意の問題ID (`B001`〜`B060`, `I001`〜`I060`, `A001`〜`A060`)
  2. `Difficulty`: `BEGINNER` / `INTERMEDIATE` / `ADVANCED`
  3. `Category`: 用語カテゴリ（`足場材`, `業務・作業`, `社内用語`, `安全・スローガン` 等）
  4. `DisplayText`: 画面表示用の日本語・ASCII混在問題文
  5. `Reading`: 入力判定の基準となるひらがな・ASCII文字列
  6. `RecommendedRomaji`: 代表的なローマ字入力例
  7. `SourceBasis`: 出典・業務根拠
  8. `Note`: 備考

### 6.2 Players シート (プレイヤーマスター)
| カラム名 | 型 | 必須 | 説明 |
| :--- | :--- | :---: | :--- |
| `PlayerID` | String | ○ | 一意のプレイヤー識別子 (`PL-1788470000000-1234` / `P001`) |
| `PlayerName` | String | ○ | 画面表示されるプレイヤー正式名称 (`山田 太郎`) |
| `PlayerNameKey` | String | ○ | 同一人物判定用の正規化キー (NFKC, 小文字化, 空白正規化: `山田 太郎`) |
| `Enabled` | Boolean | ○ | 有効フラグ (`TRUE` / `FALSE`) |
| `SortOrder` | Number | ○ | ソート順 (`9999`) |
| `CreatedAt` | String | ○ | 初回作成日時 (JST) |
| `UpdatedAt` | String | ○ | 最終更新日時 (JST) |

### 6.3 Scores シート (プレイ履歴 & 本番スコア)
| カラム名 | 型 | 必須 | 説明 |
| :--- | :--- | :---: | :--- |
| `ScoreID` | String | ○ | スコア一意ID (`SC-20260902-110001`) |
| `PlayerID` | String | ○ | プレイヤーID (`PL-001`) |
| `PlayerNameSnapshot` | String | ○ | 登録時点のプレイヤー名 (`足場 太郎`) |
| `Difficulty` | String | ○ | 難易度 (`beginner`, `intermediate`, `advanced`) |
| `Score` | Number | ○ | 最終スコア (`12500`) |
| `CorrectCount` | Number | ○ | 正解問題数 (`15`) |
| `TypedCharacters` | Number | ○ | 総入力文字数 (`120`) |
| `MissCount` | Number | ○ | ミスタイプ数 (`3`) |
| `Accuracy` | Number | ○ | 正確率 (`97.56`) |
| `MaxCombo` | Number | ○ | 最大コンボ数 (`18`) |
| `PlayDuration` | Number | ○ | プレイ実時間 (`90`) |
| `PlayedAt` | String | ○ | 登録日時 (`2026-09-02T11:00:00Z`) |
| `AppVersion` | String | ○ | アプリバージョン (`1.0.0`) |

---

## 7. ランキング集計ロジック仕様 (FR-012)

1. **集計キー**: `(期間フィルター: monthly / allTime) × (Difficulty: beginner / intermediate / advanced)`
2. **自己ベスト集約 (Anti-Domination Aggregation)**:
   - 同一 `PlayerID` のレコードが複数存在する場合、`Score` が最大の1レコードのみを採用。
   - スコア同点の場合は `Accuracy` が高い方を優先し、それも同じ場合は `PlayedAt` が新しい方を優先。
3. **表示件数**: 各カテゴリ上位20件（Top 20）を表示。

---

## 8. ゲーム設定モデル (GAME_CONFIG)
設定値は実装フェーズにおいて `src/config/gameConfig.js` として作成予定であり、以下の定数構造を持つ。

```javascript
export const GAME_CONFIG = {
  globalGameTimeSeconds: 90,
  maxTimeBonusTotal: 30,
  timeBonusPerCombo: 5,
  comboThresholdForBonus: 15,
  practiceMultiplier: 1.5,
  topRankingLimit: 20,
  difficulties: {
    beginner: {
      id: "beginner",
      displayName: "初級",
      vehicleName: "軽トラック",
      targetKps: 2.0,
      reactionAllowance: 3.0,
      minAllowedTime: 4.0,
      maxAllowedTime: 12.0,
      missPenaltySeconds: 3,
      materialTypes: ["scaffold_shichu", "scaffold_tesuri", "scaffold_jackbase"]
    },
    intermediate: {
      id: "intermediate",
      displayName: "中級",
      vehicleName: "4tユニック",
      targetKps: 3.2,
      reactionAllowance: 2.0,
      minAllowedTime: 3.5,
      maxAllowedTime: 14.0,
      missPenaltySeconds: 4,
      materialTypes: ["scaffold_shichu", "scaffold_tesuri", "scaffold_tatewaku", "scaffold_nunoita", "scaffold_sujikai"]
    },
    advanced: {
      id: "advanced",
      displayName: "上級",
      vehicleName: "15tユニック",
      targetKps: 4.5,
      reactionAllowance: 1.5,
      minAllowedTime: 5.0,
      maxAllowedTime: 20.0,
      missPenaltySeconds: 5,
      materialTypes: ["scaffold_shichu", "scaffold_tesuri", "scaffold_tatewaku", "scaffold_nunoita", "scaffold_sujikai", "scaffold_jackbase", "scaffold_palette"]
    }
  },
  backgroundProgression: [
    { step: 1, name: "更地", requiredCount: 0 },
    { step: 2, name: "コンテナ", requiredCount: 3 },
    { step: 3, name: "家", requiredCount: 7 },
    { step: 4, name: "ビル", requiredCount: 12 },
    { step: 5, name: "高層ビル", requiredCount: 18 },
    { step: 6, name: "東京タワー", requiredCount: 25 },
    { step: 7, name: "スカイツリー", requiredCount: 33 }
  ],
  extraEvents: {
    maxConcurrentObjects: 3,
    spawnIntervalMs: 4000
  }
};
```
