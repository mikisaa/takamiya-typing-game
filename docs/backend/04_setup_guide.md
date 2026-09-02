# Base Typing Game — Backend Setup & Deployment Guide

Google Apps Script (GAS) および Google Spreadsheet のセットアップ手順、環境プロパティ設定、セキュリティ監査事項です。

---

## 1. Google Spreadsheet の作成と初期化

1. [Google ドライブ](https://drive.google.com/) または [Google スプレッドシート](https://sheets.new) を開きます。
2. スプレッドシートを新規作成し、ファイル名を **`Base Typing Game DB`** に設定します。
3. URLから **Spreadsheet ID** を控えます。
   * 例: `https://docs.google.com/spreadsheets/d/`**`<SPREADSHEET_ID>`**`/edit`
4. 以下の3シートを作成し、1行目にヘッダーを記入して「1行目を固定（表示 > 固定 > 1行）」します：
   * **`Players`**: `PlayerID`, `PlayerName`, `Enabled`, `SortOrder`, `CreatedAt`, `UpdatedAt`
   * **`Scores`**: `ScoreID`, `SubmissionID`, `PlayerID`, `PlayerNameSnapshot`, `Difficulty`, `Score`, `CorrectCount`, `TypedCharacters`, `TypingMistakes`, `MissCount`, `Accuracy`, `MaxCombo`, `WPM`, `KPM`, `ReachedStage`, `StartedAtClient`, `FinishedAtClient`, `PlayedAtServer`, `AppVersion`
   * **`Meta`**: `Key`, `Value`, `UpdatedAt`

---

## 2. Google Apps Script プロジェクトの作成とコード配置

1. [Google Apps Script Home](https://script.google.com/) を開き、「新しいプロジェクト」を作成します。
2. プロジェクト名を **`Base Typing Game Backend`** に設定します。
3. プロジェクト設定（歯車アイコン）から「`appsscript.json` を表示」にチェックを入れ、`backend/gas/appsscript.json` の内容を反映します。
   * タイムゾーンが `"timeZone": "Asia/Tokyo"` になっていることを確認。
4. 以下のファイルを新規スクリプト（`.gs`）として作成し、リポジトリ内のコードをコピー＆ペーストします：
   * `Config.gs`
   * `Response.gs`
   * `Spreadsheet.gs`
   * `Players.gs`
   * `Scores.gs`
   * `Validation.gs`
   * `Code.gs`

---

## 3. スクリプトプロパティの設定 (Secret-Free Configuration)

**コード内への Spreadsheet ID の直接ハードコードは禁止されています。**

1. GASエディタの左メニュー「プロジェクトの設定（歯車アイコン）」を開きます。
2. 下部の「スクリプト プロパティ」にて「スクリプト プロパティを追加」をクリックします。
3. 以下のプロパティを設定します：
   * **プロパティ名**: `SPREADSHEET_ID`
   * **値**: 手順1で控えた実スプレッドシートID
4. 「スクリプト プロパティを保存」をクリックします。

---

## 4. Web アプリとしてのデプロイ手順

1. 画面右上の「デプロイ」>「新しいデプロイ」をクリックします。
2. 種類の選択で「ウェブアプリ」を選択します。
3. 設定項目を入力します：
   * **説明**: `Base Typing Game Backend v1.0`
   * **次のユーザーとして実行 (Execute as)**: `自分 (Me)`
   * **アクセスできるユーザー (Who has access)**: `全員 (Anyone)`
4. 「デプロイ」をクリックし、初回のみ「アクセスを承認」を実行します。
5. 発行された **ウェブアプリ URL** を控えます。

---

## 5. セキュリティとアクセス権限の監査事項

### Google Workspace 非存在に伴う権限設計
* 社内・部署に Google Workspace 組織ドメインが存在しないため、「組織内のユーザーのみ」というアクセス制限オプションは利用できません。
* そのため、Webアプリのアクセス権限は「**全員 (Anyone / Anonymous)**」となります。
* **リスクと対策**:
  * URLを知っていれば誰でもアクセス可能となるため、サーバー側で厳格な型・値・範囲バリデーション、異常値・負値拒否、二重送信防止（`SubmissionID`）、および `LockService` 排他制御を実装しています。
  * `PLAYER_SELECTION_IS_NOT_AUTHENTICATION`: プレイヤー選択はマスター指定であり本人確認ではないことを運用規則として合意します。

---

## 6. ロールバックと復旧手順

1. **データ不整合発生時**:
   * `Scores` シートはイミュータブル（追記のみ）の設計です。誤送信されたレコードが発生した場合は、該当行の削除またはフラグ付けにより即座に復旧可能です。
2. **スクリプト障害時**:
   * GASの「デプロイの管理」から過去のバージョンを選択し、1クリックで直前の安定稼働バージョンへロールバック可能です。
3. **フロントエンドへの影響**:
   * 現在フロントエンドはバックエンドへ未接続（Phase 8以降で接続）であるため、バックエンドの作業・障害によって完成済みゲームのローカルプレイに影響を与えることは一切ありません。
