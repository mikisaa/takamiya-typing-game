# 運用・デプロイマニュアル (14_operation_manual.md)

本ドキュメントは、**Base Typing Game v1.0.0** の本番環境（GitHub Pages + Google Apps Script Web App + Google スプレッドシート）に関する運用・デプロイ・監視および障害復旧（ロールバック）手順を規定する SSOT です。

---

## 1. システム構成・本番識別情報

* **Application Name**: Base Typing Game
* **Frontend Release Version**: `1.0.0`
* **Backend SchemaVersion**: `1.1.0`
* **Authoritative Production URL**: `https://mikisaa.github.io/base-typing-game/`
* **Hosting Platform**: GitHub Pages (Custom GitHub Actions Workflow)
* **GitHub Repository**: `https://github.com/mikisaa/base-typing-game`
* **Production Branch**: `main`
* **Backend Runtime**: Google Apps Script (GAS) Web App
* **Authoritative Web App URL**:
  `https://script.google.com/macros/s/AKfycbzdPNsWV5kNdtpsF91jkca3lkJSLdVxG_2Ux8V5a5f1kMWLJmogiUG8mzbSiRk3S3xeeQ/exec`
* **Database**: Google Spreadsheet (`Base Typing Game DB`)
  * Spreadsheet ID: `1-HUuzXK27t2eRJEwgSMVO1bNVkVRwVTyzb4LftW5TX8`
  * Active Sheets: `Scores`（スコア台帳）, `Players`（プレイヤー台帳）, `Metadata`（スキーマ定義）

---

## 2. セキュリティ & 通信境界（維持必須原則）

1. `PLAYER_NAME_IS_NOT_AUTHENTICATION`:
   - プレイヤー名は自由入力の表示名であり、認証・パスワード・セキュリティトークンではありません。
2. `ANONYMOUS_WEB_APP_ENDPOINT`:
   - GAS Web App は `全員（匿名を含む）` へ公開されており、クライアントから認証なしでスコア送信・ランキング取得が可能です。
3. `WEB_APP_URL_IS_NOT_A_SECRET`:
   - GAS Web App URL はフロントエンドコード（`src/api/backendClient.js`）に含まれており、秘匿情報ではありません。
4. `RANKING_PLAYER_NAMES_ARE_VISIBLE_TO_ENDPOINT_CALLERS`:
   - ランキング API の返却データは最小化されており、内部の PlayerID やタイムスタンプは除外され、公開用データのみ返却されます。
5. `SIMPLE_REQUEST_POST_CONTRACT`:
   - スコア送信は `Content-Type: text/plain;charset=utf-8` の Simple Request 方式を厳格に維持し、CORS preflight を発生させません。

---

## 3. 本番デプロイ手順（Controlled Deployment Procedure）

### 3.1 前提条件チェック
1. 作業ブランチが `main` であり、Working Tree が Clean であること。
2. ローカル自動テスト全件 PASS（840 / 840 PASS）：
   ```powershell
   npm test
   ```
3. Question Master CSV とバンドルの整合性チェック：
   ```powershell
   npm run build:bundle
   git diff src/data/defaultQuestions.js
   ```
4. 静的アセット監査：
   `src/` 配下に `localhost`, `127.0.0.1`, `file://`, テスト用固定値（`TEST001` 等）が存在しないこと。

### 3.2 デプロイ実行
1. コミットを作成し、リモート `origin/main` へ Push：
   ```powershell
   git push origin main
   ```
2. GitHub Actions ワークフロー（`.github/workflows/deploy-pages.yml`）が自動起動：
   - `build-and-test`: Node 20 セットアップ ➔ `npm ci` ➔ `npm test` ➔ バンドル整合性検証 ➔ アセット構造検証 ➔ `src/` 配下のみを Pages アーティファクトとしてアップロード。
   - `deploy`: GitHub Pages 環境へデプロイ。
3. デプロイ成功後、GitHub Pages URL（`https://mikisaa.github.io/base-typing-game/`）へアクセスし、本番疎通・動作を確認。

---

## 4. 障害時の一次対応 & ロールバック手順

### 4.1 フロントエンド障害発生時のロールバック
GitHub Pages デプロイは `main` ブランチのコミット履歴と完全連動しています。
不具合が発生した場合は **Force Push を行わず**、決定論的 `git revert` を用いてロールバックします。

```powershell
# 1. 直前の正常動作コミットを確認
git log -n 5 --oneline

# 2. 問題のコミットを取り消す revert コミットを作成
git revert <faulty-commit-sha>

# 3. テストを実行して PASS を確認
npm test

# 4. main ブランチへ Push
git push origin main
```
Push 後、GitHub Actions の `Deploy GitHub Pages` ワークフローが自動実行され、数分以内に正常バージョンへと切り替わります。

### 4.2 バックエンド・スプレッドシート障害時の対応
1. **通信エラー（NETWORK_ERROR / HTTP_ERROR）**:
   - GAS Web App URL の稼働状態を確認：
     ブラウザで `https://script.google.com/macros/s/AKfycbzdPNsWV5kNdtpsF91jkca3lkJSLdVxG_2Ux8V5a5f1kMWLJmogiUG8mzbSiRk3S3xeeQ/exec?op=health` を直接開き、`{"ok":true,"data":{"service":"Base Typing Game Backend","schemaVersion":"1.1.0"}}` が返ることを確認。
2. **スプレッドシートの行肥大化・メンテナンス**:
   - `Scores` シートは各プレイのスコア履歴を保持します。
   - テストデータや不正な入力が存在する場合は、対象行をスプレッドシート上で直接削除可能です。
   - ランキングは `Scores` シートから集計されるため、行削除直後のリクエストより自動的にランキングへ即時反映されます。
3. **ブラウザキャッシュのクリア**:
   - 利用者環境で旧バージョンの JS / CSS が残存している疑いがある場合、ブラウザの Hard Reload（`Ctrl + F5` または `Shift + F5`）を実施するよう案内します。
   - プレイヤー名記憶の不整合が生じた場合は、ブラウザの開発者ツールで `localStorage.removeItem('baseTypingGame.lastPlayerName.v1')` を実行するか閲覧履歴のCookie/サイトデータを消去します。
