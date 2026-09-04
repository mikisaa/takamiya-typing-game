# TakamiyaTypingGame (v1.1.0) — TTG

仮設足場資材の積込・運搬作業をテーマにした、爽快2D横スクロール風タイピングゲームです。  
HTML5, Vanilla CSS, Native ES Modules を開発の Authoritative Source とし、Google Apps Script (GAS) Web App を通じて配布・実行されます。

---

## 🎮 正式本番配布 URL (Authoritative Production URL)

**[https://script.google.com/macros/s/AKfycbzdPNsWV5kNdtpsF91jkca3lkJSLdVxG_2Ux8V5a5f1kMWLJmogiUG8mzbSiRk3S3xeeQ/exec](https://script.google.com/macros/s/AKfycbzdPNsWV5kNdtpsF91jkca3lkJSLdVxG_2Ux8V5a5f1kMWLJmogiUG8mzbSiRk3S3xeeQ/exec)**

※ 利用者へ配布する URL は上記 1 本のみです。Google アカウントへのログインは不要です（Anyone アクセス）。

---

## ✨ 主な特徴 (Features)

* **2つのゲームモード**:
  * **本番モード**: 制限時間90秒。難易度別（初級・中級・上級）の車両積込タイピング。スコアはバックエンドへ送信され、月間・歴代ランキングに反映されます。
  * **練習モード**: 時間無制限。スコア送信なしで自由にタイピング練習が可能。
* **高宮物流ドット絵ビジュアル演出**:
  * フォークリフトによる資材ピッキング＆積込アニメーション（軽トラ・4tユニック・15t大型ユニック）。
  * 15t大型ユニック車の車体高さ最適化 (`visualYOffset: -6`) および難易度別の自然な MISS 資材落下位置 (`missDropTarget`)。
  * OS 依存絵文字を全廃し、ボタニカル 5色パレット（`#FFFFFF`, `#F5FBDA`, `#D9EFBD`, `#B9D175`, `#450C3F`）に準拠した専用ピクセルインライン SVG アイコン。
  * 正解数に応じて更地からコンテナ・家・ビル・東京タワー・スカイツリーへと建設が進むプログレッシブ背景と、EXTRA ステージ特別演出。
* **プレイヤー名記憶 & クロスブラウザ同一人物集約**:
  * ブラウザの `localStorage`（新キー: `ttg.lastPlayerName.v1`）によるプレイヤー名の自動入力補完（旧キーからの自動例外安全マイグレーション対応）。
  * 同名入力時は別ブラウザ・別PCからでも同一プレイヤーとしてスコアを統合。
* **ランキングシステム**:
  * 「今月」および「歴代」×「初級・中級・上級」の最高記録ランキング。
  * 同一プレイヤーによる順位独占を防止する「Best Score Anti-Spam」ルールを適用。

---

## 🏛 システムアーキテクチャ (Architecture)

| ドメイン | 本番 SSOT | 役割 |
|---|---|---|
| **App Source** | Git Repository | 開発・コードの真実の源泉 |
| **Production Frontend Runtime** | Google Apps Script Web App | `/exec` で HTML Service フロントエンドを直接配信 |
| **Frontend Build Source** | `src/` (Native ES Modules, CSS) | 開発用の分割モジュール |
| **GAS Deployment Artifact** | `backend/gas/` (generated HTML bundle) | `build:gas` で自動生成される自己完結成果物 |
| **Backend Runtime** | Same GAS Web App | 同一エンドポイントで REST API (`health`, `getPlayers`, `getRankings`, `submitScore`) を提供 |
| **Database** | Google スプレッドシート (`TakamiyaTypingGame DB`) | スコアおよびプレイヤー管理データストア |
| **問題マスタ SSOT** | `data/questions/takamiya-typing-game-master-v3.csv` | 180問の唯一の真実の源泉 |
| **Release Tag** | Git tag `v1.1.0` | 正式リリースバージョン |

---

## 🛠 開発・ローカル実行 (Development & Testing)

### テストの実行
```powershell
npm test
```
全 19 テストスイート（907 テスト）が実行され、タイピング判定、タイマー計算、スコア計算式、問題マスタ整合性、リブランド整合性、インラインSVG準拠、車両ジオメトリ、GASビルド整合性が検証されます。

### GAS フロントエンドバンドルの生成
```powershell
npm run build:gas
```
`src/` 配下のソースコードから、GAS HtmlService 用の `ClientBundle.html`, `Stylesheet.html`, `Index.html` を再生成します。

### 問題マスタバンドルの生成
```powershell
npm run build:bundle
```
`data/questions/takamiya-typing-game-master-v3.csv` からフロントエンド用の `src/data/defaultQuestions.js` を生成します。

---

## 🔒 セキュリティおよび運用境界

* **プレイヤー名は認証ではない** (`PLAYER_NAME_IS_NOT_AUTHENTICATION`):
  * パスワードやトークンは存在せず、同名正規化文字列は同一人物として扱われます。
* **エンドポイントは匿名アクセス可能** (`ANONYMOUS_WEB_APP_ENDPOINT`):
  * Web App URL 自体は秘匿情報ではありません。
* 詳細な運用手順およびバックアップ方針については [`docs/14_operation_manual.md`](docs/14_operation_manual.md) を参照してください。

---

## 📄 ライセンス

Unlicensed (Personal / Internal Project)
