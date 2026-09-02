# Base Typing Game — Google Spreadsheet Schema Specification

Google Spreadsheet（DB名推奨: `Base Typing Game DB`）内に保持する3つのシートの正式スキーマ定義です。

---

## 1. Sheet: `Players` (プレイヤーマスター)

社員・プレイヤーの表示名および有効状態を管理します。

| # | 列名 (Column) | 型 (Type) | 必須 | 制約・説明 | 例 |
| :- | :--- | :--- | :--: | :--- | :--- |
| 1 | **PlayerID** | String | ◯ | 主キー (PK)。表示名と分離した識別子。 | `P001` |
| 2 | **PlayerName** | String | ◯ | ゲーム画面やランキングで表示される社員名。 | `佐藤 健一` |
| 3 | **Enabled** | Boolean | ◯ | `TRUE` / `FALSE`。無効化されたプレイヤーはAPIから返却されずスコア保存も拒絶。 | `TRUE` |
| 4 | **SortOrder** | Integer | ◯ | 選択リストでの並び順。昇順。 | `1` |
| 5 | **CreatedAt** | ISO String | ◯ | マスター作成日時 (JST)。 | `2026-09-03T09:00:00+09:00` |
| 6 | **UpdatedAt** | ISO String | ◯ | マスター最終更新日時 (JST)。 | `2026-09-03T09:00:00+09:00` |

* ※ `PlayerName` を主キーとしないことで、同姓同名や改姓・表示名変更に柔軟に対応可能。

---

## 2. Sheet: `Scores` (本番スコア永続ログ)

本番モード（`PRODUCTION`）で完了したゲームセッションのスコア記録です。（※練習モードは保存対象外）

| # | 列名 (Column) | 型 (Type) | 必須 | 制約・説明 | 例 |
| :- | :--- | :--- | :--: | :--- | :--- |
| 1 | **ScoreID** | String | ◯ | サーバー生成の一意スコア識別子。`SC-<timestamp>-<rand>` | `SC-1788392000000-4821` |
| 2 | **SubmissionID** | String | ◯ | クライアント生成の一意ID。二重INSERT防止用。 | `SUB-1788392000000-8472` |
| 3 | **PlayerID** | String | ◯ | `Players` シートに存在する有効なPlayerID。 | `P001` |
| 4 | **PlayerNameSnapshot** | String | ◯ | 送信時点でサーバーが解決した社員名スナップショット。 | `佐藤 健一` |
| 5 | **Difficulty** | String | ◯ | `BEGINNER` / `INTERMEDIATE` / `ADVANCED` | `INTERMEDIATE` |
| 6 | **Score** | Integer | ◯ | 最終獲得スコア (0〜500,000)。 | `18450` |
| 7 | **CorrectCount** | Integer | ◯ | 正解問題数 (0〜1,000)。 | `22` |
| 8 | **TypedCharacters** | Integer | ◯ | 入力総文字数 (0〜20,000)。 | `185` |
| 9 | **TypingMistakes** | Integer | ◯ | タイピングミス回数 (0〜2,000)。 | `3` |
| 10 | **MissCount** | Integer | ◯ | 時間切れ接触ミス回数 (0〜1,000)。 | `1` |
| 11 | **Accuracy** | Float | ◯ | 正答率 % (0.00〜100.00)。 | `98.38` |
| 12 | **MaxCombo** | Integer | ◯ | 最大コンボ数 (0〜1,000)。 | `16` |
| 13 | **WPM** | Float | ◯ | 単語/分速度 (0.0〜500.0)。 | `38.5` |
| 14 | **KPM** | Float | ◯ | 打鍵/分速度 (0.0〜3,000.0)。 | `192.5` |
| 15 | **ReachedStage** | String | ◯ | 到達した背景ステージ名 (`GROUND`〜`EXTRA`)。 | `HIGHRISE` |
| 16 | **StartedAtClient** | ISO String | - | クライアント側ゲーム開始日時。 | `2026-09-03T09:00:00.000Z` |
| 17 | **FinishedAtClient** | ISO String | - | クライアント側ゲーム終了日時。 | `2026-09-03T09:01:30.000Z` |
| 18 | **PlayedAtServer** | ISO String | ◯ | サーバー生成Authoritative日時 (Asia/Tokyo)。月判定用。 | `2026-09-03T18:01:30+09:00` |
| 19 | **AppVersion** | String | ◯ | フロントエンドバージョン。 | `1.0.0` |

---

## 3. Sheet: `Meta` (システム設定・メタ情報)

スキーマバージョンやバックエンド構成のメタデータを保持します。

| # | 列名 (Column) | 型 (Type) | 必須 | 制約・説明 | 初期値 |
| :- | :--- | :--- | :--: | :--- | :--- |
| 1 | **Key** | String | ◯ | 設定項目キー | `SchemaVersion` |
| 2 | **Value** | String | ◯ | 設定値 | `1.0.0` |
| 3 | **UpdatedAt** | ISO String | ◯ | 最終更新日時 (JST) | 構築時日時 |

### 初期投入レコード例:
1. `SchemaVersion` = `1.0.0`
2. `AppVersion` = `1.0.0`
3. `CreatedAt` = `<構築日時>`
