# 運用・デプロイマニュアル (14_operation_manual.md)

本ドキュメントは、**Base Typing Game v1.0.0** の本番環境（GitHub Pages + Google Apps Script Web App + Google スプレッドシート）に関する運用・保守・データ管理・インシデント対応および今後のバージョンアップ手順を規定する Authoritative SSOT です。

---

## 1. Production Components Inventory（本番構成一覧）

| コンポーネント | 採用技術・プラットフォーム | 本番識別情報 / URL |
| :--- | :--- | :--- |
| **Frontend Runtime** | GitHub Pages (HTTPS) | `https://mikisaa.github.io/base-typing-game/` |
| **Source Code** | GitHub Repository | `https://github.com/mikisaa/base-typing-game` |
| **Production Branch**| Git Branch | `main` |
| **Release Identity** | Git Tag / GitHub Release | `v1.0.0` (Commit SHA: `41030dc...`) |
| **Backend Runtime**  | Google Apps Script (GAS) Web App | `https://script.google.com/macros/s/AKfycbzdPNsWV5kNdtpsF91jkca3lkJSLdVxG_2Ux8V5a5f1kMWLJmogiUG8mzbSiRk3S3xeeQ/exec` |
| **Database**         | Google Spreadsheet | `Base Typing Game DB` (ID: `1-HUuzXK27t2eRJEwgSMVO1bNVkVRwVTyzb4LftW5TX8`) |
| **Question Master**  | CSV (Shift-JIS/UTF-8) | `data/questions/takamiya-typing-game-master-v3.csv` (180問) |

---

## 2. Source of Truth（SSOT）マトリクス

二重管理を防止するため、各領域の正本（SSOT）を以下のように厳格に定めます。

| 領域 (Domain) | Authoritative SSOT | 補足・同期ルール |
| :--- | :--- | :--- |
| **Application Source** | Git Repository (`src/`) | すべての機能・UI・ロジックの正本 |
| **Production Frontend** | GitHub Pages (`main` ブランチより自動デプロイ) | `src/` 配下のアセットのみが公開対象 |
| **Question Master** | `data/questions/takamiya-typing-game-master-v3.csv` | 180問の出題語句・読み・キーストロークの唯一の正本 |
| **Runtime Question Bundle** | `src/data/defaultQuestions.js` | CSV より `npm run build:bundle` で生成 |
| **Players Master** | Google Spreadsheet `Players` シート | プレイヤーIDおよび正規化名の永続化台帳 |
| **Scores Master** | Google Spreadsheet `Scores` シート | 本番プレイ実績およびランキング算出の元データ |
| **Backend Source** | Git Repository `backend/gas/` | GAS ソースコードの正本（clasp 管理） |
| **Backend Runtime** | Google Apps Script Web App デプロイ | バージョン管理された実稼働エンドポイント |
| **Release Identity** | Git Tag (`v1.0.0` 等) | コミットとリリースバージョンの対応付け |
| **Documentation** | Repository `docs/` | 仕様・アーキテクチャ・運用手引の正本 |

---

## 3. セキュリティ & 公開性境界（維持必須原則）

1. `PLAYER_NAME_IS_NOT_AUTHENTICATION`:
   - プレイヤー名は自由入力の表示名であり、パスワードや機密認証トークンではありません。
2. `ANONYMOUS_WEB_APP_ENDPOINT`:
   - GAS Web App は「全員（匿名を含む）」にアクセス許可されており、クライアントから認証不要でスコア送信・ランキング取得が可能です。
3. `WEB_APP_URL_IS_NOT_A_SECRET`:
   - GAS Web App URL はフロントエンドコード（`src/api/backendClient.js`）に含まれており、秘匿情報ではありません。
4. `RANKING_PLAYER_NAMES_ARE_VISIBLE_TO_ENDPOINT_CALLERS`:
   - ランキング API の返却データは最小化されており、内部の PlayerID、タイムスタンプ、セッションID 等は除外され、公開用データ（順位、プレイヤー名、スコア、正答率、コンボ）のみ返却されます。
5. `PUBLIC_REPOSITORY_BOUNDARY`:
   - GitHub リポジトリ（`mikisaa/base-typing-game`）および GitHub Pages はパブリック公開環境です。社内機密情報、API キー、個人を特定する社内情報（社員番号・パスワード等）をコードやコミット、GitHub Issues へ書き込まないでください。
6. `SIMPLE_REQUEST_POST_CONTRACT`:
   - スコア送信は `Content-Type: text/plain;charset=utf-8` の Simple Request 方式を厳格に維持し、CORS preflight を発生させません。

---

## 4. 本番通常アップデートワークフロー（Normal Update Workflow）

今後の障害修正・機能改善・データ更新は、以下の統制フローに従って実施します。GitHub Pages 上のファイルを直接操作したり、未テストのコードを `main` へ反映することは禁止します。

```text
Issue / User Feedback（要望・不具合の受付）
       ↓
Requirement & Scope 確認（バグか機能追加かの判定）
       ↓
Planning Delta（必要に応じて設計ドキュメント更新）
       ↓
Implementation（ローカル作業ブランチでの実装）
       ↓
Automated Tests（npm test: 840/840 PASS 確認）
       ↓
Git Commit（明確な Conventional Commits メッセージ）
       ↓
Push to main（origin/main への反映）
       ↓
GitHub Actions Execution（CI テスト ➔ アーティファクト抽出 ➔ デプロイ）
       ↓
Production Smoke Verification（本番 URL 疎通・動作確認）
       ↓
Release / Closure
```

---

## 5. 本番デプロイ手順（Controlled Deployment Procedure）

### 5.1 前提条件チェック
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

### 5.2 デプロイ実行
1. コミットを作成し、リモート `origin/main` へ Push：
   ```powershell
   git push origin main
   ```
2. GitHub Actions ワークフロー（`.github/workflows/deploy-pages.yml`）が自動起動：
   - `build-and-test`: Node 20 セットアップ ➔ `npm ci` ➔ `npm test` ➔ バンドル整合性検証 ➔ アセット構造検証 ➔ `src/` 配下のみを Pages アーティファクトとしてアップロード。
   - `deploy`: GitHub Pages 環境へデプロイ。
3. デプロイ完了後、GitHub Pages URL（`https://mikisaa.github.io/base-typing-game/`）へアクセスし、本番疎通・動作を確認。

---

## 6. 障害対応 & ロールバック手順

### 6.1 フロントエンド障害時のロールバック（Emergency Frontend Rollback）
GitHub Pages デプロイは `main` ブランチのコミット履歴と完全連動しています。
不具合が発生した場合は **Force Push を行わず**、決定論的 `git revert` を用いてロールバックします。

```powershell
# 1. 直前の正常動作コミットを確認
git log -n 5 --oneline

# 2. 問題のコミットを取り消す revert コミットを作成
git revert <faulty-commit-sha>

# 3. テストを実行して全件 PASS を確認
npm test

# 4. main ブランチへ Push
git push origin main
```
Push 後、GitHub Actions の `Deploy GitHub Pages` ワークフローが自動実行され、数分以内に正常バージョンへと安全に復旧します。

### 6.2 バックエンド障害時のロールバック（Backend Rollback）
1. **Git ソースの確認**:
   - `backend/` 配下の変更履歴を確認し、直前の正常バージョンを特定。
2. **GAS デプロイの切戻し**:
   - Google Apps Script 管理画面（または clasp）で「デプロイの管理」を開く。
   - 直前の安定バージョン（Known-good version）を選択してデプロイを切り戻す。
3. **疎通確認**:
   - `health` エンドポイントでバージョンおよび稼働状態を確認：
     ```powershell
     Invoke-RestMethod -Uri "https://script.google.com/macros/s/AKfycbzdPNsWV5kNdtpsF91jkca3lkJSLdVxG_2Ux8V5a5f1kMWLJmogiUG8mzbSiRk3S3xeeQ/exec?op=health"
     ```
   - ランキング取得およびスコア送信の動作確認を実施。
4. **注意事項**:
   - ロールバックを目的として Google スプレッドシートそのものを削除・再作成してはなりません。

---

## 7. データベースバックアップ & 本番データ運用ルール

### 7.1 Database Backup Boundary
`Players` シートおよび `Scores` シートは実稼働データです。コード修正やロールバックの都合でデータを削除してはなりません。
* **手動バックアップの推奨手順**:
  - 定期メンテナンス前や月次締めの際、Google スプレッドシートメニューより「ファイル」➔「コピーを作成」を実行してスナップショットを保管。
  - 必要に応じて「ファイル」➔「ダウンロード」➔「カンマ区切り形式 (.csv)」にてローカルまたは社内共有ストレージへエクスポート。
  - スプレッドシート標準の「変更履歴を表示」機能により、過去の特定時点への復元が可能。
* ※ v1.0.0 では自動バックアップ機能は含みません。

### 7.2 Production Data Rules（本番データ保護ルール）
本番運用中において、以下の行為は固く禁止されます：
* ❌ テスト用スコアを本番 `Scores` シートに残存させること
* ❌ `TEST PLAYER` 等のダミーアカウントを通常運用データへ混在させること
* ❌ デバッグや調査目的で社員の正規スコア行を直接書き換えること
* ❌ ランキング順位調整目的で手作業によるスコア改ざんを行うこと

データメンテナンスが必要な場合（明らかな誤入力の無効化等）は、理由・対象行・作業者を明確に記録した「Controlled Maintenance」として実施してください。

---

## 8. プレイヤー名 & ランキング運用規約

### 8.1 プレイヤー名規約（Player Identity Contract）
* **自由入力**: ログイン認証や事前登録は不要。英数字・ひらがな・カタカナ・漢字を自由に設定可能（最大30文字）。
* **同一人物判定**: 大文字小文字・全角半角スペースを正規化したキー（`playerNameKey`）が一致する場合、別ブラウザや別 PC からのアクセスであっても同一プレイヤーとして自動集約されます。
  * `PLAYER_NAME_IS_NOT_AUTHENTICATION`
  * `SAME_NORMALIZED_NAME_MEANS_SAME_PLAYER`
* **同姓同名の扱い**: 社内に同姓同名の社員が存在し、実運用上スコアの混同が問題となった場合は、将来のマイナー/メジャーアップデートにて部署名付与等の仕様変更を検討します（v1.0.0 時点では変更しない）。

### 8.2 ランキング規約（Ranking Contract）
* **対象モード**: 本番モード（90秒）のみ。練習モードはランキング対象外。
* **集計期間**:
  * `今月` (MONTHLY): 日本時間（Asia/Tokyo）の当月 1日 00:00:00 〜 末日 23:59:59 にプレイされたスコア。
  * `歴代` (ALL_TIME): サービス開始以降の全期間スコア。
* **難易度**: `初級`, `中級`, `上級` の各難易度ごとに独立して集計。
* **Best Score Anti-Spam Rule**:
  * 1人のプレイヤーが同一期間・同一難易度で複数回プレイした場合、**最高スコアの 1件のみ**がランキングに採用されます（同一プレイヤーによる順位独占を防止）。
* ※ 年間ランキング・週間ランキング・拠点別ランキングは v1.0.0 スコープ外です。

---

## 9. インシデント重大度分類（Incident Classification）

本番運用中に発生した障害・不具合は、以下の基準に基づいて優先度を分類し対応します。

| レベル | 定義 | 具体例 | 目標対応方針 |
| :--- | :--- | :--- | :--- |
| **P0** (Critical) | ゲーム全体が利用不能 | ・GitHub Pages が 404 / 500 でダウン<br>・JS エラーでタイトル画面が表示されない<br>・GAS バックエンドが完全停止 | 即時一次調査開始。直前のコミットへの `git revert` または GAS バージョン切戻しを実施。 |
| **P1** (High) | 主要機能が利用不能 | ・本番モードでスコアが保存できない<br>・ランキング画面が開けない / CORS エラー<br>・問題データがロードできない | 当日中に原因調査・特定。hotfix コミット作成およびテスト実行後にデプロイ。 |
| **P2** (Medium) | 一部機能の不具合 | ・特定難易度でのみ演出が乱れる<br>・背景アニメーションの描画不整合<br>・`localStorage` による名前記憶が効かない | 次回パッチリリース（`1.0.x`）での修正計画を立案。 |
| **P3** (Low) | 軽微な表示・UX 課題 | ・特殊な画面解像度での微小なレイアウトずれ<br>・文言の誤字・脱字 | バックログとして記録し、定期メンテナンス時に修正。 |

---

## 10. ユーザーフィードバック分類カテゴリ

社員利用開始後に寄せられる問い合わせ・意見・要望は、以下のカテゴリへ分類して記録・分析します。

1. **Bug**: 画面のフリーズ、スコアが保存されない等の不具合
2. **Typing difficulty**: 難易度や制限時間の厳しさ・緩さに関するフィードバック
3. **Question content**: 出題される足場用語・専門用語・誤植に関する意見
4. **Visual**: ドット絵、アニメーション、配色、文字の見やすさに関する要望
5. **Performance**: 特定の低スペック PC やブラウザでの動作の重さに関する指摘
6. **Ranking**: ランキングの表示件数や期間に関する改善提案
7. **Player Name**: 同姓同名の混同や名前変更に関する相談
8. **Feature request**: BGM、効果音、新モード等の追加機能要望

---

## 11. v1.0.0 確定仕様（Frozen Contracts）

Base Typing Game v1.0.0 では、以下の仕様が確定・凍結されています。これらを変更する場合は、明示的なバージョンアップ（Minor または Major）の判断が必要です。

* 本番モード: 90秒グローバルタイマー
* 練習モード: 時間無制限・スコア非送信
* 難易度体系: 初級（軽トラ）、中級（4tユニック）、上級（15tユニック）
* プレイヤー名: 自由入力（最大30文字）+ `localStorage` によるローカル記憶
* 永続化: Google Apps Script Web App ➔ Google スプレッドシート
* ランキング: 今月 / 歴代 × 初級 / 中級 / 上級（最高記録 1人1枠）
* カラーパレット: Unified Botanical 5色パレット（白背景基調）
* ビジュアル演出: フォークリフト運搬、積込アニメーション、建設進行（更地〜スカイツリー）、EXTRA 演出（飛行機、ヘリ、風船、スカイダイバー、虹）

---

## 12. セマンティックバージョン管理方針（Version Policy）

本プロジェクトは Semantic Versioning (SemVer) に準拠します。

* **Patch Release (`1.0.x`)**:
  * バグ修正、セキュリティパッチ、ドキュメントの軽微な修正。
  * ゲームルール、スコア計算式、難易度仕様、バックエンドスキーマの変更は含まない。
* **Minor Release (`1.x.0`)**:
  * 後方互換性のある機能追加や UX の改善（例: 新規問題セットの追加、練習モードへの新機能追加等）。
  * 既存のスコアデータやランキング集計に破壊的変更を与えないもの。
* **Major Release (`2.0.0`)**:
  * ゲームルールの抜本的改定、認証システムの導入、バックエンドアーキテクチャの全面刷新など、後方互換性を損なう大きな変更。

---

## 13. 将来開発エントリーゲート（Future Development Entry Gate）

今後、社内や関係者から追加開発の要望が提示された場合であっても、即座に実装に着手してはなりません。以下の 5 つのゲート判断を完了してから、次期フェーズを計画します。

1. **Bug か Feature かの判定**:
   - 既存仕様の不具合であれば Patch（`1.0.x`）として迅速に対処。
   - 新規要件であればバックログへ整理。
2. **v1.0.0 Frozen Contracts への影響確認**:
   - 確定仕様に抵触する場合、変更の妥当性を関係者間でレビュー。
3. **Planning Delta の要否判定**:
   - アーキテクチャや画面フローに影響を与える場合、設計ドキュメントの更新計画を策定。
4. **Backend Schema への影響確認**:
   - スプレッドシートの列追加やデータ型変更が必要か、既存データと互換性が保てるかを精査。
5. **Production Data Migration の要否判定**:
   - 既存の `Scores` や `Players` データの移行・変換が必要かを事前評価。

---

## 14. パブリックリポジトリ & GitHub Issues 運用ガイドライン

* **パブリックリポジトリの認識**:
  - 本リポジトリ（`https://github.com/mikisaa/base-typing-game`）は全世界へ公開されています。
* **GitHub Issues 利用時の厳守事項**:
  - 社員個人名、社員番号、社内機密情報、取引先情報、システム内部のパスワード・キー情報を Issue の本文やタイトル、画像へ含めてはなりません。
  - 不具合報告や要望を Issue に起票する際は、必ず一般的な技術用語（例: 「特定環境におけるタイピング入力遅延」「問題文タイポの修正」）を用いて記述してください。
