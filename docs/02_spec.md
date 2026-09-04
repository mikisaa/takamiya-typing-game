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

| 画面名 | コントロール / 要素 | 種別 | 対象要件 | 説明 |
| :--- | :--- | :--- | :--- | :--- |
| **タイトル画面** | `btnStartGame` | DIRECT | [FR-006] | ゲーム設定・プレイヤー選択画面へ進むボタン |
| | `btnViewRanking` | DIRECT | [FR-012], [FR-017] | 自作ピクセル表彰台インラインSVG付きランキング直接遷移ボタン |
| **設定・選択画面** | `inputPlayerName` | DIRECT | [FR-013] | プレイヤー名自由入力欄（本番モードのみ表示、`ttg.lastPlayerName.v1` から前回入力名を自動補完、常時編集可能） |
| | `btnSelectDifficulty` (初級/中級/上級) | DIRECT | [FR-005] | 3段階の難易度を選択するタブボタングループ |
| | `btnSelectMode` (練習/本番) | DIRECT | [FR-006], [FR-017] | 自作ピクセルインラインSVG（本番=物流トラック、練習=キーボード）を配したモード選択カード |
| | `btnLaunchGame` | DIRECT | [FR-001] | 選択した条件でゲームプレイを開始するボタン |
| | `btnBackToTitle` | DERIVED_AFFORDANCE | [FR-006] | タイトル画面へ戻るナビゲーションボタン |
| **ゲームプレイ画面** | `displayScore` | DIRECT | [FR-011] | 現在スコア表示（本番モードのみ表示） |
| | `displayGlobalTimer` | DIRECT | [FR-001], [FR-006] | 全体残り時間（Global Game Timer: 初期90秒）表示 |
| | `displayForkliftTimer` | DIRECT | [FR-001], [FR-016] | 現在問題の走行時間（Per-Question Forklift Timer）プログレスバー |
| | `displayCombo` | DIRECT | [FR-010] | 現在の連続正解コンボ数表示 |
| | `badgeStage` | DIRECT | [FR-008], [FR-017] | 現在のステージ種別を表す自作ピクセルインラインSVG付きステージバッジ |
| | `displayJapanesePrompt` | DIRECT | [FR-002] | 出題中の日本語文章・単語表示 |
| | `displayRomanizedTarget` | DIRECT | [FR-002] | ローマ字表示（入力済=ハイライト、未入力=グレー） |
| | `canvasGameScene` | DIRECT | [FR-001], [FR-018] | フォークリフト、難易度別トラック（15t車体高オフセット適用）、資材、背景を描画する2D領域 |
| | `overlayMistype` | DIRECT | [FR-002] | タイピングミス時の赤色フラッシュエフェクト |
| | `feedbackOverlay` | DIRECT | [FR-003], [FR-004], [FR-017] | 自作ピクセルインラインSVG（SUCCESS=キラキラ輝き、MISS=衝突・落下資材）によるフィードバック表示 |
| | `btnPauseQuit` | DERIVED_AFFORDANCE | [FR-001] | ゲーム中断してタイトルへ戻るエスケープボタン |
| **リザルト画面** | `displaySummaryMetrics` | DIRECT | [FR-011], [FR-017] | 自作ピクセルインラインSVG付き指標（SCORE、Accuracy、Combo、Stage等）および詳細集計表示 |
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
   - 出題された現在の1問について、フォークリフトが左端からトラック前へ到達するまでの時間（`allowedTime`）。
   - 問題ごとの実効入力文字数と難易度から動的に算出される。
   - フォークリフトの走行速度は等速制御される。

### 2.2 動的走行時間モデル (Dynamic Timing Model: FR-016)

#### A. 算出式 (Deterministic Formula)
$$\text{rawAllowedTime} = \text{reactionAllowance} + \left( \frac{\text{effectiveKeystrokes}}{\text{targetKps}} \right)$$

$$\text{allowedTime} = \min\left(\max(\text{rawAllowedTime}, \text{minAllowedTime}), \text{maxAllowedTime}\right)$$

* **練習モードの補正**:
  - `practiceAllowedTime = allowedTime * practiceMultiplier` （`practiceMultiplier = 1.5`）

#### B. Question Master v3 の文字数分布に基づく難易度別パラメータ

| 難易度 | 積込対象車両 | ターゲットKPS (`targetKps`) | 反応余裕秒 (`reactionAllowance`) | 最小時間 (`minAllowedTime`) | 最大時間 (`maxAllowedTime`) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **初級 (Beginner)** | 軽トラック | **2.0** keys/s (120 KPM) | **3.0** 秒 | **4.0** 秒 | **12.0** 秒 |
| **中級 (Intermediate)** | 4tユニック | **3.2** keys/s (192 KPM) | **2.0** 秒 | **3.5** 秒 | **14.0** 秒 |
| **上級 (Advanced)** | 15tユニック | **4.5** keys/s (270 KPM) | **1.5** 秒 | **5.0** 秒 | **20.0** 秒 |

---

## 3. 車両ジオメトリ & 視覚補正仕様 (FR-018)

### 3.1 15t大型ユニック車の上方オフセット補正
15tユニック車（`CRANE_15T`）は大型のため、画面下部地面とのバランスを改善するために上方に補正する。
* **初級（軽トラック）**: `visualYOffset = 0`（変更なし）
* **中級（4tユニック）**: `visualYOffset = 0`（変更なし）
* **上級（15tユニック）**: `visualYOffset = -6`（車体を6px上方に配置し、フォークリフトとの高さ関係および荷台・クレーンの収まりを視覚最適化）

### 3.2 難易度別MISS時資材落下ジオメトリ (Difficulty-Specific MISS Geometry)
タイムオーバー時、フォークリフト上の資材がトラック直前の自然な手前空間に着地するよう、難易度別のオフセット座標を `TRUCK_METADATA` で定義・適用する。

| 難易度 | 対象車両 | 水平移動量 (`deltaX`) | 垂直落下量 (`deltaY`) | 傾き回転角 (`targetRotation`) | 視覚効果 |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **初級** | 軽トラック | `+48px` | `+14px` | `18deg` | 小型車体の手前空間へ自然に着地し、車体被りを防止 |
| **中級** | 4tユニック | `+40px` | `+10px` | `16deg` | 中型荷台長に合わせ、キャブ手前の空間へ着地 |
| **上級** | 15tユニック | `+30px` | `+6px` | `14deg` | 上方オフセット車体と接触位置から、大型フロント手前へ着地 |

---

## 4. UI インラインSVGアイコン仕様 (FR-017)

### 4.1 カラーパレット規約
すべてのSVGアセットは以下の5色のみで描画する（必要に応じて `opacity` 適用可）。
* `#FFFFFF` (白)
* `#F5FBDA` (淡黄緑)
* `#D9EFBD` (明緑)
* `#B9D175` (アクセント緑)
* `#450C3F` (濃紫)

### 4.2 アイコン一覧
1. **Mode Card (本番モード)**: `truck` — Takamiya物流を象徴する積込トラックのピクセルアート。
2. **Mode Card (練習モード)**: `keyboard` — タイピング練習を象徴するメカニカルキーボードのピクセルアート。
3. **Ranking**: `podium` — 表彰台とスコアボードのピクセルアート。
4. **Stage Badge**: `stage` — 各発展段階を象徴する現場・建築シンボル。
5. **SUCCESS Feedback**: `sparkle` — 積込完了を祝うピクセル星・輝きエフェクト。
6. **MISS Feedback**: `collision` — 衝撃波と資材落下を表すピクセルエフェクト。
7. **Result Metrics**: スコア、正確率、コンボ、ステージの各数値横に配置する小型ピクセルアイコン。

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

## 6. データモデル & スプレッドシート仕様 (FR-013, FR-014)

### 6.1 Question Master v3 仕様 (`data/questions/takamiya-typing-game-master-v3.csv`)
* **総問題数**: 180問（初級: 60問 / 中級: 60問 / 上級: 60問）
* **カラム定義**: `ID`, `Difficulty`, `Category`, `DisplayText`, `Reading`, `RecommendedRomaji`, `SourceBasis`, `Note`

### 6.2 Players シート (プレイヤーマスター)
| カラム名 | 型 | 必須 | 説明 |
| :--- | :--- | :---: | :--- |
| `PlayerID` | String | ○ | 一意のプレイヤー識別子 (`PL-1788470000000-1234`) |
| `PlayerName` | String | ○ | 画面表示されるプレイヤー正式名称 (`山田 太郎`) |
| `PlayerNameKey` | String | ○ | 同一人物判定用の正規化キー (NFKC, 小文字化, 空白正規化) |
| `Enabled` | Boolean | ○ | 有効フラグ (`TRUE` / `FALSE`) |
| `SortOrder` | Number | ○ | ソート順 (`9999`) |
| `CreatedAt` | String | ○ | 初回作成日時 (JST) |
| `UpdatedAt` | String | ○ | 最終更新日時 (JST) |

### 6.3 Scores シート (プレイ履歴 & 本番スコア)
| カラム名 | 型 | 必須 | 説明 |
| :--- | :--- | :---: | :--- |
| `ScoreID` | String | ○ | スコア一意ID (`SC-20260904-110001`) |
| `SubmissionID` | String | ○ | クライアント生成の一意ID（二重送信防止） |
| `PlayerID` | String | ○ | プレイヤーID (`PL-001`) |
| `PlayerNameSnapshot` | String | ○ | 登録時点のプレイヤー名 (`山田 太郎`) |
| `Difficulty` | String | ○ | 難易度 (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`) |
| `Score` | Number | ○ | 最終スコア (`18450`) |
| `CorrectCount` | Number | ○ | 正解問題数 (`22`) |
| `TypedCharacters` | Number | ○ | 総入力文字数 (`185`) |
| `TypingMistakes` | Number | ○ | タイピングミス数 (`3`) |
| `MissCount` | Number | ○ | 時間切れ接触ミス数 (`1`) |
| `Accuracy` | Number | ○ | 正確率 (`98.38`) |
| `MaxCombo` | Number | ○ | 最大コンボ数 (`16`) |
| `WPM` | Number | ○ | WPM (`38.5`) |
| `KPM` | Number | ○ | KPM (`192.5`) |
| `ReachedStage` | String | ○ | 到達ステージ (`HIGHRISE`) |
| `StartedAtClient` | String | - | クライアント開始日時 |
| `FinishedAtClient` | String | - | クライアント終了日時 |
| `PlayedAtServer` | String | ○ | サーバー日時 (JST) |
| `AppVersion` | String | ○ | アプリバージョン (`1.1.0`) |

---

## 7. ランキング集計ロジック仕様 (FR-012)
1. **集計キー**: `(期間フィルター: monthly / allTime) × (Difficulty: BEGINNER / INTERMEDIATE / ADVANCED)`
2. **自己ベスト集約 (Anti-Domination Aggregation)**:
   - 同一 `PlayerID` のレコードが複数存在する場合、`Score` が最大の1レコードのみを採用。
   - スコア同点の場合は `Accuracy` が高い方を優先し、それも同じ場合は `PlayedAtServer` が新しい方を優先。
3. **表示件数**: 各カテゴリ上位20件を表示。
