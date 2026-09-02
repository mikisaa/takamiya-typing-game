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
| **設定・選択画面** | `selectPlayer` | DIRECT | [FR-013] | スプレッドシートから取得したプレイヤー名ドロップダウン |
| | `btnSelectDifficulty` (初級/中級/上級) | DIRECT | [FR-005] | 3段階の難易度を選択するタブボタングループ |
| | `btnSelectMode` (練習/本番) | DIRECT | [FR-006] | 練習モードまたは本番モードを選択するトグルボタン |
| | `btnLaunchGame` | DIRECT | [FR-001] | 選択した条件でゲームプレイを開始するボタン |
| | `btnBackToTitle` | DERIVED_AFFORDANCE | [FR-006] | タイトル画面へ戻るナビゲーションボタン |
| **ゲームプレイ画面** | `displayScore` | DIRECT | [FR-011] | 現在スコア表示（本番モードのみ表示） |
| | `displayTimer` | DIRECT | [FR-006] | 残り制限時間プログレスバー & 秒数表示 |
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

### 2.1 基本ゲームループ (FR-001)
1. **問題生成**: 選択された難易度に対応する問題プールからランダムに1問抽出。
2. **資材選定**: 7種類の仮設足場資材からランダムに1種類を選択し、フォークリフトの爪の上に描画。
3. **フォークリフト走行**: 画面左端（X = 5%）から右端のトラック前（X = 75%）に向かって等速走行を開始。
   - 移動時間（タイムリミット）: 初級=8.0秒, 中級=6.0秒, 上級=4.5秒（Config設定値）。
4. **入力受付**: 走行中にプレイヤーのキーボード入力を捕捉し、文字照合を実施。
5. **到達判定**:
   - トラック到達前に入力完了 ➔ **SUCCESS Flow (2.2項)**
   - 入力完了前にトラック到達 ➔ **MISS Flow (2.3項)**

### 2.2 成功アニメーションフロー (SUCCESS Flow: FR-003)
1. **停止**: フォークリフトがトラック前（X = 75%）で直ちに停止（所要時間: 即時）。
2. **荷台上上昇 & 移動**: 爪が上部へ15px上昇し、足場資材が放物線状にトラック荷台へスライド移動（所要時間: 250ms）。
3. **SUCCESS表示**: 車両上部に「SUCCESS!」のポップアップエフェクト表示、COMBOカウント加算、SCORE加算（所要時間: 200ms）。
4. **背景成長**: 背景建設オブジェクトが1段階成長（所要時間: 同期）。
5. **次問題セット**: フォークリフトが初期位置（X = 5%）へリセットされ、次の問題と新資材をセットして即座に走行開始（合計遷移時間: 450ms）。

### 2.3 失敗アニメーションフロー (MISS Flow: FR-004)
1. **接触**: フォークリフトがトラックに到達（X = 78%）。
2. **振動 & 落下**: 車体と画面全体が左右に5px振動（200ms）し、爪上の足場資材が地面へ回転落下（所要時間: 300ms）。
3. **MISS表示**: 車両上部にコミカルな「MISS!」表示、COMBOリセット（0へ）。
4. **ペナルティ適用**: 本番モードの場合、残り制限時間から難易度別ペナルティ（初級: -3秒, 中級: -4秒, 上級: -5秒）を減算。
5. **次問題セット**: フォークリフトが初期位置へ戻り、新しい問題と資材をセットして走行再開（合計遷移時間: 500ms）。

### 2.4 難易度別テーマ & 車両仕様 (FR-005)
* **初級**:
  - 積込対象車両: **軽トラック**（白ボディ、小型荷台、親しみやすい2D Pixel Art）
  - フォークリフト移動時間: 1問あたり 8.0秒
  - 問題長目安: 2〜6文字（基礎単語・短縮語）
* **中級**:
  - 積込対象車両: **4tユニック車**（青/緑系平ボディ、キャブバッククレーン付きPixel Art）
  - フォークリフト移動時間: 1問あたり 6.0秒
  - 問題長目安: 5〜12文字（標準用語・複合語）
* **上級**:
  - 積込対象車両: **15tユニック車**（大型3軸/4軸車、大型ロング荷台、大型クレーン付きPixel Art）
  - フォークリフト移動時間: 1問あたり 4.5秒
  - 問題長目安: 10〜20文字（専門用語・業務文章）

### 2.5 仮設足場資材アセット (FR-007)
SVG / 2D Canvas によるオリジナルPixel Artアセット（全7種）:
1. `scaffold_shichu` (支柱: ピン穴付き縦パイプ)
2. `scaffold_tesuri` (手摺: 横バー・ロック機構)
3. `scaffold_tatewaku` (建枠: 鳥居型フレーム)
4. `scaffold_nunoita` (布板: アンチ・エキスパンドメタル床板)
5. `scaffold_sujikai` (筋交: クロスブレース)
6. `scaffold_jackbase` (ジャッキベース: ハンドル・ベースプレート)
7. `scaffold_palette` (小物資材パレット: ボルト・クランプ等が入った小型クレート)

---

## 3. 背景発展 & EXTRAステージ仕様

### 3.1 通常背景進化ステップ (FR-008, FR-011)
正解数（累積正解数）に応じて背景の建築物が段階的に組み上がる。

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
  1. `Airplane`: Pixel Art旅客機が上空を左から右へ水平横断（速度: 中速、出現率: 30%）。
  2. `Helicopter`: 小型ヘリがスカイツリー周辺でホバリング＆上下浮遊（ローター回転アニメーション、出現率: 25%）。
  3. `Balloons`: カラフルな3連風船が下から上へ左右に揺れながら浮上（出現率: 25%）。
  4. `Skydiving`: 小さなパラシュート降下部隊が上空からゆっくり降下（出現率: 10%のレア演出）。
  5. `Rainbow`: EXTRA到達時に都市背景の最背面レイヤーに七色の虹がフェードイン表示（常時背景）。

---

## 4. タイピングUX & ローマ字入力エンジン仕様 (FR-002)

### 4.1 キー入力受付仕様
* **グローバル入力捕捉**: `window.addEventListener('keydown')` でアルファベット（A-Z）、ハイフン（-）、数字等を捕捉。入力フォームへのフォーカス合わせ操作は一切不要。
* **IME制御**: 原則として直接半角英数入力を捕捉。全角入力時も `e.key` または `keydown` コードから自動正規化。

### 4.2 ローマ字表記ゆれ受理テーブル (Multi-pattern Matching Engine)
日本語の読みに対して、以下の複数ローマ字入力を完全受理する。

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
  - タイプ音が鳴る（または視覚的振動）とともに、入力枠が200ms間赤色（`#ef4444`）にフラッシュ。
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
* 連続15 COMBO達成ごとに、残り制限時間に **+5秒** の TIME BONUS を付与。
* 1ゲーム中でのTIME BONUS累積上限: 最大 **+30秒** まで（無限プレイ化の防止）。

### 5.3 制限時間 & ペナルティ設定
* 初期制限時間: **90秒**（全難易度共通）
* タイムオーバー・落下ペナルティ:
  - 初級: **-3秒**
  - 中級: **-4秒**
  - 上級: **-5秒**

---

## 6. スプレッドシート & データモデル仕様 (FR-012, FR-013, FR-014)

### 6.1 Players シート (プレイヤーマスター)
| カラム名 | 型 | 必須 | 説明 | 例 |
| :--- | :--- | :---: | :--- | :--- |
| `PlayerID` | String | ○ | 一意のプレイヤー識別子 | `PL-001` |
| `PlayerName` | String | ○ | 画面表示されるプレイヤー氏名 | `足場 太郎` |
| `Department` | String | - | 所属部署 | `機材管理部` |
| `Enabled` | Boolean | ○ | 有効フラグ | `TRUE` |

### 6.2 Scores シート (プレイ履歴 & 本番スコア)
| カラム名 | 型 | 必須 | 説明 | 例 |
| :--- | :--- | :---: | :--- | :--- |
| `ScoreID` | String | ○ | スコア一意ID (UUID/Timestamp) | `SC-20260902-110001` |
| `PlayerID` | String | ○ | プレイヤーID | `PL-001` |
| `PlayerNameSnapshot` | String | ○ | 登録時点のプレイヤー名 | `足場 太郎` |
| `Difficulty` | String | ○ | 難易度 (`beginner`, `intermediate`, `advanced`) | `intermediate` |
| `Score` | Number | ○ | 最終スコア | `12500` |
| `CorrectCount` | Number | ○ | 正解問題数 | `15` |
| `TypedCharacters` | Number | ○ | 総入力文字数 | `120` |
| `MissCount` | Number | ○ | ミスタイプ数 | `3` |
| `Accuracy` | Number | ○ | 正確率 (0.00%〜100.00%) | `97.56` |
| `MaxCombo` | Number | ○ | 最大コンボ数 | `18` |
| `PlayDuration` | Number | ○ | プレイ実時間 (秒) | `90` |
| `PlayedAt` | String | ○ | 登録日時 (ISO 8601) | `2026-09-02T11:00:00Z` |
| `AppVersion` | String | ○ | アプリケーションバージョン | `1.0.0` |

### 6.3 Questions データ構造 (フロント組み込み & GAS取得可能構造)
```json
[
  {
    "id": "Q-001",
    "difficulty": "beginner",
    "category": "material",
    "displayText": "支柱",
    "reading": "しちゅう",
    "defaultRoman": "SHICHUU",
    "enabled": true
  },
  {
    "id": "Q-002",
    "difficulty": "intermediate",
    "category": "safety",
    "displayText": "安全帯よし",
    "reading": "あんぜんたいよし",
    "defaultRoman": "ANZENTAIYOSHI",
    "enabled": true
  },
  {
    "id": "Q-003",
    "difficulty": "advanced",
    "category": "work",
    "displayText": "次世代足場積込作業完了",
    "reading": "じせだいあしばつみこみさぎょうかんりょう",
    "defaultRoman": "JISEDAIASHIBATSUMIKOMISAGYOUKANRYOU",
    "enabled": true
  }
]
```

---

## 7. ランキング集計ロジック仕様 (FR-012)

1. **集計キー**: `(期間フィルター) × (Difficulty)`
2. **期間フィルター**:
   - `今月 (Monthly)`: `PlayedAt` が現在の月（例: 2026年9月）のデータのみを抽出。
   - `歴代 (All-Time)`: 全期間のデータを対象とする。
3. **自己ベスト集約 (Anti-Domination Aggregation)**:
   - 同一 `PlayerID` のレコードが複数存在する場合、`Score` が最大の1レコードのみを採用。
   - スコア同点の場合は `Accuracy` が高い方を優先し、それも同じ場合は `PlayedAt` が新しい方を優先。
4. **表示件数**: 各カテゴリ上位20件（Top 20）を表示。

---

## 8. ゲーム設定マスター (GAME_CONFIG)
全設定値は `src/config/gameConfig.js`（または定数モジュール）として一元管理され、コード変更なしに調整可能とする。

```javascript
export const GAME_CONFIG = {
  initialTimeSeconds: 90,
  maxTimeBonusTotal: 30,
  timeBonusPerCombo: 5,
  comboThresholdForBonus: 15,
  topRankingLimit: 20,
  difficulties: {
    beginner: {
      id: "beginner",
      displayName: "初級",
      vehicleName: "軽トラック",
      forkliftTravelSeconds: 8.0,
      missPenaltySeconds: 3,
      materialTypes: ["scaffold_shichu", "scaffold_tesuri", "scaffold_jackbase"]
    },
    intermediate: {
      id: "intermediate",
      displayName: "中級",
      vehicleName: "4tユニック",
      forkliftTravelSeconds: 6.0,
      missPenaltySeconds: 4,
      materialTypes: ["scaffold_shichu", "scaffold_tesuri", "scaffold_tatewaku", "scaffold_nunoita", "scaffold_sujikai"]
    },
    advanced: {
      id: "advanced",
      displayName: "上級",
      vehicleName: "15tユニック",
      forkliftTravelSeconds: 4.5,
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
