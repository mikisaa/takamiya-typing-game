# Base Typing Game (v1.0.0)

仮設足場資材の積込・運搬作業をテーマにした、爽快2D横スクロール風タイピングゲームです。  
HTML5, Vanilla CSS, Native ES Modules を採用した Zero-Build アーキテクチャで構築されており、モダンブラウザ環境で快適に動作します。

---

## 🎮 本番公開 URL (Production URL)

**[https://mikisaa.github.io/base-typing-game/](https://mikisaa.github.io/base-typing-game/)**

---

## ✨ 主な特徴 (Features)

* **2つのゲームモード**:
  * **本番モード**: 制限時間90秒。難易度別（初級・中級・上級）の車両積込タイピング。スコアはバックエンドへ送信され、月間・歴代ランキングに反映されます。
  * **練習モード**: 時間無制限。スコア送信なしで自由にタイピング練習が可能。
* **爽快なドット絵ビジュアル演出**:
  * フォークリフトによる資材ピッキング＆積込アニメーション（軽トラ・4tユニック・15tユニック）。
  * 正解数に応じて更地からコンテナ・家・ビル・東京タワー・スカイツリーへと建設が進むプログレッシブ背景。
  * スカイツリー完成後の EXTRA ステージ特別演出（飛行機、ヘリ、風船、スカイダイバー、虹）。
  * 白背景＋目に優しいボタニカル 5色パレット（ハイコントラスト・視認性重視）。
* **プレイヤー名記憶 & クロスブラウザ同一人物集約**:
  * ブラウザの `localStorage` によるプレイヤー名の自動入力補完（常時編集可能）。
  * 同名入力時は別ブラウザ・別PCからでも同一プレイヤーとしてスコアを統合。
* **ランキングシステム**:
  * 「今月」および「歴代」の最高記録ランキング。
  * 同一プレイヤーによる順位独占を防止する「Best Score Anti-Spam」ルールを適用。

---

## 🏛 システムアーキテクチャ (Architecture)

* **フロントエンド**: HTML5, Vanilla CSS, Native ES Modules (Zero-Build 配信)
* **ホスティング**: GitHub Pages (GitHub Actions による自動テスト＆デプロイ)
* **バックエンド**: Google Apps Script (GAS) Web App (Simple Request POST / GET)
* **データベース**: Google スプレッドシート (`Base Typing Game DB`)
* **問題マスタ SSOT**: `data/questions/takamiya-typing-game-master-v3.csv` (180問)

---

## 🛠 開発・ローカル実行 (Development & Testing)

本プロジェクトは外部 npm 依存関係のない純粋な Node.js / Web 標準で構成されています。

### テストの実行
```powershell
npm test
```
全 17 テストスイート（840 テスト）が実行され、タイピング判定、タイマー計算、スコア計算式、問題マスタ整合性、ランキング集計コアが検証されます。

### 問題マスタバンドルの生成
```powershell
npm run build:bundle
```
`data/questions/takamiya-typing-game-master-v3.csv` からフロントエンド用の `src/data/defaultQuestions.js` を生成します。

---

## 🔒 セキュリティおよび公開性について

* 本リポジトリおよび GitHub Pages は**パブリック公開**されています。
* 社内固有情報、個人情報、機密認証情報をリポジトリや GitHub Issues へ投稿しないでください。
* 詳細な運用手順およびロールバック方針については [`docs/14_operation_manual.md`](docs/14_operation_manual.md) を参照してください。

---

## 📄 ライセンス

Unlicensed (Personal / Internal Project)
