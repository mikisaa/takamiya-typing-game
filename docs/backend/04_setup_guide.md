# TakamiyaTypingGame — Backend Setup & Deployment Guide

Google Apps Script (GAS) および Google Spreadsheet のセットアップ手順、環境プロパティ設定、セキュリティ監査事項です。

---

## 1. Google Spreadsheet の作成と初期化

1. [Google ドライブ](https://drive.google.com/) または [Google スプレッドシート](https://sheets.new) を開きます。
2. スプレッドシートを新規作成し、ファイル名を **`TakamiyaTypingGame DB`** に設定します。
3. URLから **Spreadsheet ID** を控えます。
   * 例: `https://docs.google.com/spreadsheets/d/`**`<SPREADSHEET_ID>`**`/edit`
4. 以下の3シートを作成し、1行目にヘッダーを記入して「1行目を固定（表示 > 固定 > 1行）」します：
   * **`Players`**: `PlayerID`, `PlayerName`, `PlayerNameKey`, `Enabled`, `SortOrder`, `CreatedAt`, `UpdatedAt`
   * **`Scores`**: `ScoreID`, `SubmissionID`, `PlayerID`, `PlayerNameSnapshot`, `Difficulty`, `Score`, `CorrectCount`, `TypedCharacters`, `TypingMistakes`, `MissCount`, `Accuracy`, `MaxCombo`, `WPM`, `KPM`, `ReachedStage`, `StartedAtClient`, `FinishedAtClient`, `PlayedAtServer`, `AppVersion`
   * **`Meta`**: `Key`, `Value`, `UpdatedAt`

---

## 2. Google Apps Script プロジェクトの作成とコード配置

1. [Google Apps Script Home](https://script.google.com/) を開き、「新しいプロジェクト」を作成します。
2. プロジェクト名を **`TakamiyaTypingGame`** に設定します。
3. プロジェクト設定（歯車アイコン）から「`appsscript.json` を表示」にチェックを入れ、`backend/gas/appsscript.json` の内容を反映します。
   * タイムゾーンが `"timeZone": "Asia/Tokyo"` になっていることを確認。
4. ビルドスクリプトを実行してGAS用フロントエンドアセットを生成します：
   ```powershell
   npm run build:gas
   ```
5. `npx clasp push` を実行するか、以下のファイルをGASエディタに配置します：
   * スクリプト (`.gs`): `Config.gs`, `Response.gs`, `Spreadsheet.gs`, `Players.gs`, `Scores.gs`, `Rankings.gs`, `Validation.gs`, `Code.gs`
   * HTMLテンプレート (`.html`): `Index.html`, `Stylesheet.html`, `ClientBundle.html`

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

1. 画面右上の「デプロイ」>「デプロイを管理」（または「新しいデプロイ」）をクリックします。
2. 種類の選択で「ウェブアプリ」を選択します。
3. 設定項目を入力・確認します：
   * **説明**: `TakamiyaTypingGame Production v1.1.0`
   * **次のユーザーとして実行 (Execute as)**: `自分 (Me)`
   * **アクセスできるユーザー (Who has access)**: `全員 (Anyone)`
4. 「デプロイ」をクリックし、初回のみ「アクセスを承認」を実行します。
5. 発行された **ウェブアプリ URL** を控えます。このURLがフロントエンドおよびAPIの共通配信URLとなります。

---

## 5. セキュリティとアクセス権限の監査事項

### Google Workspace 非存在に伴う権限設計
* 社内・部署に Google Workspace 組織ドメインが存在しないため、「組織内のユーザーのみ」というアクセス制限オプションは利用できません。
* そのため、Webアプリのアクセス権限は「**全員 (Anyone / Anonymous)**」となります。
* **リスクと対策**:
  * URLを知っていれば誰でもアクセス可能となるため、サーバー側で厳格な型・値・範囲バリデーション、異常値・負値拒否、二重送信防止（`SubmissionID`）、および `LockService` 排他制御を実装しています。
  * `PLAYER_NAME_IS_NOT_AUTHENTICATION`: プレイヤー名は自由入力表示名であり本人確認ではないことを運用規則として合意します。

---

## 6. ロールバックと復旧手順

1. **データ不整合発生時**:
   * `Scores` シートはイミュータブル（追記のみ）の設計です。誤送信されたレコードが発生した場合は、該当行の削除またはフラグ付けにより即座に復旧可能です。
2. **スクリプト・フロントエンド障害時**:
   * GASの「デプロイの管理」から過去のバージョンを選択し、1クリックで直前の安定稼働バージョンへロールバック可能です。
