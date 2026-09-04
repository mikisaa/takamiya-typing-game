# TakamiyaTypingGame (v1.2.0) — TTG

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
* **高宮物流リアル＆ドット絵ビジュアル演出 (v1.2.0)**:
  * フォークリフトによる資材ピッキング＆積込アニメーション（軽トラ・4tユニック・15t大型ユニック）。
  * 15t大型ユニック車の車体高さ最適化 (`visualYOffset: -6`) および難易度別の自然な MISS 資材落下位置 (`missDropTarget`) を維持。
  * **ゲームシーンの現実色・自然色化 (Realistic Scene Colors)**: インダストリアルイエローのフォークリフト、亜鉛メッキ鋼管スチールグレーの足場資材、白キャブ実車トラック、安全赤色ユニッククレーン、青空グラデーション、アスファルトヤード、赤白東京タワー、銀色スカイツリー、リアル7色虹。
  * **UI ボタニカル 5色パレット維持**: メニュー、HUDコンテナ、ボタン、カード、ランキング、リザルト画面は従来の TTG 5色パレット（`#FFFFFF`, `#F5FBDA`, `#D9EFBD`, `#B9D175`, `#450C3F`）を厳格に遵守。
* **一目で分かる UI ベクターアイコンシステム (v1.2.0)**:
  * モード選択（本番トラック / 練習キーボード）、ランキング表彰台、ステージ街並み、SUCCESS (check-circle)、MISS (x-circle)、リザルト指標（スピードメーター、ブルズアイ、炎、ビル）を誰もが一目で判読できる明瞭なインラインベクターSVGへ刷新（OS絵文字ゼロ、React依存ゼロ）。
* **リザルト画面「入力文字数」指標修正 (v1.2.0)**:
  * 本番・練習リザルトにおいて入力文字数が常に正確な有限非負整数（`〇 文字`、0入力時も `0 文字`）として表示されるよう計算経路を根本修正。
* **タイトル画面文言整理 (v1.2.0)**:
  * 旧サブタイトルを削除しレイアウトを最適化。ランキング説明文を完全一致で `今月・歴代` に更新。
* **プレイヤー名記憶 & クロスブラウザ同一人物集約**:
  * ブラウザの `localStorage`（キー: `ttg.lastPlayerName.v1`）によるプレイヤー名の自動入力補完。
  * 同名入力時は別ブラウザ・別PCからでも同一プレイヤーとしてスコアを統合。
* **ランキングシステム**:
  * 「今月」および「歴代」×「初級・中級・上級」の最高記録ランキング。
  * 同一プレイヤーによる順位独占を防止する「Best Score Anti-Spam」ルールを適用。

---

## 🏛 システムアーキテクチャ (Architecture)

| ドメイン | 本番 SSOT | 役割 |
|---|---|---|
| **App Source** | Git Repository | 開発・コードの真実の源泉 (`https://github.com/mikisaa/takamiya-typing-game`) |
| **Production Frontend Runtime** | Google Apps Script Web App | `/exec` で HTML Service フロントエンドを直接配信 |
| **Frontend Build Source** | `src/` (Native ES Modules, CSS) | 開発用の分割モジュール |
| **GAS Deployment Artifact** | `backend/gas/` (generated HTML bundle) | `build:gas` で自動生成される自己完結成果物 |
| **Backend Runtime** | Same GAS Web App | 同一エンドポイントで REST API (`health`, `getPlayers`, `getRankings`, `submitScore`) を提供 |
| **Database** | Google スプレッドシート (`TakamiyaTypingGame DB`) | スコアおよびプレイヤー管理データストア |
| **問題マスタ SSOT** | `data/questions/takamiya-typing-game-master-v3.csv` | 180問の唯一の真実の源泉 |
| **Release Tag** | Git tag `v1.2.0` | 正式リリースバージョン |

---

## 🛠 開発・ローカル実行 (Development & Testing)

### テストの実行
```powershell
npm test
```
全 19 テストスイート（982 テスト）が実行され、タイピング判定、タイマー計算、スコア計算式、問題マスタ整合性、リブランド整合性、インラインSVG準拠、車両ジオメトリ、リザルトNaN回帰防止、現実色シーンパレット準拠、GASビルド整合性が検証されます。

### 実 GAS バックエンド統合テスト
```powershell
node scripts/testRealGasBackend.js
```
実 GAS Web App エンドポイントに対して 70 件の結合テスト（ヘルスチェック、プレイヤー作成・名寄せ、スコア登録・排他ロック、ランキング集約・データ最小化）を検証します。

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
