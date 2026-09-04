# 運用・デプロイマニュアル (14_operation_manual.md)

本ドキュメントは、**TakamiyaTypingGame (TTG) v1.2.0** の本番環境（Google Apps Script Web App + Google スプレッドシート）に関する運用・保守・デプロイ・データ管理・インシデント対応およびロールバック手順を規定する Authoritative SSOT です。

---

## 1. Production Components Inventory（本番構成一覧）

| コンポーネント | 採用技術・プラットフォーム | 本番識別情報 / URL |
| :--- | :--- | :--- |
| **Frontend Runtime** | Google Apps Script (GAS) Web App (HtmlService) | `https://script.google.com/macros/s/AKfycbzdPNsWV5kNdtpsF91jkca3lkJSLdVxG_2Ux8V5a5f1kMWLJmogiUG8mzbSiRk3S3xeeQ/exec` |
| **Source Code (SSOT)**| GitHub Repository | `https://github.com/mikisaa/takamiya-typing-game` |
| **Production Branch**| Git Branch | `main` |
| **Release Identity** | Git Tag / GitHub Release | `v1.2.0` |
| **Backend Runtime**  | Google Apps Script (GAS) Web App | 同上（Frontend と単一エンドポイントで共存） |
| **Database**         | Google Spreadsheet | `TakamiyaTypingGame DB` (ID: `1-HUuzXK27t2eRJEwgSMVO1bNVkVRwVTyzb4LftW5TX8`) |
| **Question Master**  | CSV (Shift-JIS/UTF-8) | `data/questions/takamiya-typing-game-master-v3.csv` (180問) |
| **Legacy Host**      | GitHub Pages | **停止済み（Production Host として使用停止）** |

---

## 2. Source of Truth（SSOT）マトリクス

二重管理を防止するため、各領域の正本（SSOT）を以下のように厳格に定めます。

| 領域 (Domain) | Authoritative SSOT | 補足・同期ルール |
| :--- | :--- | :--- |
| **Application Source** | Git Repository (`src/`) | すべての機能・UI・ロジックの正本 |
| **Production Frontend Runtime** | GAS Web App (`/exec` HtmlService) | 単一URLより社内利用者へ配信 |
| **Frontend Build Source** | `src/` | 開発環境の第一級ソースコード |
| **GAS Deployment Artifact** | `backend/gas/` generated bundles | `npm run build:gas` で決定論的に生成 |
| **Backend Source** | Git Repository (`backend/gas/`) | GAS サーバーサイドコードの正本 |
| **Backend Runtime** | same GAS Web App | Frontend と同一の Web App デプロイ |
| **Database** | Google Spreadsheet (`TakamiyaTypingGame DB`) | ID: `1-HUuzXK27t2eRJEwgSMVO1bNVkVRwVTyzb4LftW5TX8` |
| **Question Master** | CSV v3 (`data/questions/takamiya-typing-game-master-v3.csv`) | 180問の出題語句・読み・ストロークの正本 |
| **Release Identity** | Git Tag (`v1.2.0`) | コミットとリリースバージョンの対応付け |
| **Documentation** | Repository `docs/` | 仕様・アーキテクチャ・運用手引の正本 |

---

## 3. セキュリティ & 公開性境界（維持必須原則）

1. `PLAYER_NAME_IS_NOT_AUTHENTICATION`:
   - プレイヤー名は自由入力の表示名であり、パスワードや機密認証トークンではありません。
2. `SAME_NORMALIZED_NAME_MEANS_SAME_PLAYER`:
   - 大文字小文字・空白を正規化したキー（`PlayerNameKey`）が一致する場合、別ブラウザや別PCからでも同一プレイヤーとして集約されます。
3. `ANONYMOUS_WEB_APP_ENDPOINT`:
   - GAS Web App は「全員（匿名を含む）」にアクセス許可されており、Google Workspace アカウントのない一般社内PCからログイン不要で利用可能です。
4. `WEB_APP_URL_IS_NOT_A_SECRET`:
   - GAS Web App URL はフロントエンド配信URLそのものであり、秘匿情報ではありません。
5. `RANKING_PLAYER_NAMES_ARE_VISIBLE_TO_ENDPOINT_CALLERS`:
   - ランキング API の返却データは最小化されており、公開用データ（順位、プレイヤー名、スコア、正答率、コンボ）のみ返却されます。
6. `SIMPLE_REQUEST_POST_CONTRACT`:
   - スコア送信は `Content-Type: text/plain;charset=utf-8` の Simple Request 方式を厳格に維持し、CORS preflight を発生させません。

---

## 4. 本番デプロイ手順（Controlled Deployment Procedure）

### 4.1 前提条件チェック
1. 作業ブランチが `main` であり、Working Tree が Clean であること。
2. ローカル自動テスト全件 PASS（907 / 907 PASS）：
   ```powershell
   npm test
   ```
3. 実エンドポイント回帰テスト全件 PASS（70 / 70 PASS）：
   ```powershell
   node scripts/testRealGasBackend.js
   ```

### 4.2 フロントエンドバンドル生成
```powershell
npm run build:gas
```
`scripts/buildGasFrontend.js` が実行され、`src/` 配下のESモジュールおよびCSSから以下のファイルが生成されます：
* `backend/gas/Index.html` (コンテナテンプレート)
* `backend/gas/Stylesheet.html` (インラインCSS)
* `backend/gas/ClientBundle.html` (esbuild単一バンドルJS)

### 4.3 Google Apps Script への反映
```powershell
npx clasp push
```
全12ファイル（`.gs` 9ファイル、`.html` 3ファイル、`appsscript.json`）がアップロードされます。

### 4.4 Web App デプロイ更新
1. [Google Apps Script エディタ](https://script.google.com/home/projects/1ZY8U1mwn-7kTaiwVfaf68rBVSztLufZo6OgNSJB0Oz57QL_5Qjid9nck/edit) を開きます。
2. 右上の「デプロイ」➔「デプロイを管理」をクリックします。
3. 左側の「ウェブアプリ」デプロイを選択し、右上の「編集（鉛筆アイコン）」をクリックします。
4. 「バージョン」で **「新バージョン」** を選択します。
5. 設定を確認：
   * **次のユーザーとして実行**: 自分 (Me)
   * **アクセスできるユーザー**: 全員 (Anyone)
6. 「デプロイ」をクリックします。
7. デプロイ完了後、Web App URL（`https://script.google.com/macros/s/.../exec`）へアクセスし、動作確認を実施します。

---

## 5. 障害対応 & ロールバック手順

### 5.1 フロントエンド障害時のロールバック
Google Apps Script Web App はバージョン管理されています。
不具合が発生した場合は以下の手順で即時切り戻しが可能です：
1. GASエディタで「デプロイ」➔「デプロイを管理」を開く。
2. 対象デプロイの「編集」をクリックし、「バージョン」を直前の安定稼働バージョン（Known-good version）へ切り替えて「デプロイ」をクリック。
3. 数秒以内に正常バージョンへと安全に復旧します。
4. ※ 万が一GAS環境自体に重大障害が発生した場合の緊急避難措置として、GitHub Pages への一時的切り戻し（`git checkout v1.0.0`）も可能です。

### 5.2 バックエンド障害時のロールバック
1. GAS管理画面の「デプロイを管理」にて直前の安定バージョンを選択して切り戻す。
2. 疎通確認：
   ```powershell
   Invoke-RestMethod -Uri "https://script.google.com/macros/s/AKfycbzdPNsWV5kNdtpsF91jkca3lkJSLdVxG_2Ux8V5a5f1kMWLJmogiUG8mzbSiRk3S3xeeQ/exec?op=health"
   ```
3. 注意：ロールバックを目的として Google スプレッドシートそのものを削除・再作成してはなりません。

---

## 6. データベースバックアップ & 本番データ運用ルール

### 6.1 Database Backup Boundary
`Players` シートおよび `Scores` シートは実稼働データです。
* **手動バックアップ**:
  - 定期メンテナンス前や月次締めの際、Google スプレッドシートメニューより「ファイル」➔「コピーを作成」を実行してスナップショットを保管。
  - スプレッドシート標準の「変更履歴を表示」機能により、過去の特定時点への復元が可能。

### 6.2 Production Data Rules（本番データ保護ルール）
本番運用中において、以下の行為は固く禁止されます：
* ❌ テスト用スコアを本番 `Scores` シートに残存させること
* ❌ `TEST PLAYER` 等のダミーアカウントを通常運用データへ混在させること
* ❌ デバッグや調査目的で社員の正規スコア行を直接書き換えること
* ❌ ランキング順位調整目的で手作業によるスコア改ざんを行うこと

---

## 7. プレイヤー名 & ランキング運用規約

### 7.1 プレイヤー名規約
* **自由入力**: ログイン認証や事前登録は不要。最大30文字。
* **同一人物判定**: 大文字小文字・全角半角スペースを正規化したキー（`playerNameKey`）が一致する場合、別ブラウザや別PCからのアクセスであっても同一プレイヤーとして自動集約されます。
* **ローカル記憶移行**: `ttg.lastPlayerName.v1` を正式キーとし、旧 `baseTypingGame.lastPlayerName.v1` からの自動移行をサポート。

### 7.2 ランキング規約
* **対象モード**: 本番モード（90秒）のみ。練習モードはランキング対象外。
* **集計期間**:
  * `今月` (MONTHLY): 日本時間（Asia/Tokyo）の当月 1日 00:00:00 〜 末日 23:59:59 にプレイされたスコア。
  * `歴代` (ALL_TIME): サービス開始以降の全期間スコア。
* **難易度**: `初級`, `中級`, `上級` の各難易度ごとに独立して集計。
* **Best Score Anti-Spam Rule**: 各プレイヤーの最高スコア1件のみをランキングに採用。
