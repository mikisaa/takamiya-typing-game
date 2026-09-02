# AI Agent Bootstrap (AGENTS.md)

本プロジェクト「base-typing-game」は AI Development Core 方式で管理されています。

通常は、担当する役割（Role / Mode）に応じた Agent Context をエントリポイントとして参照してください。

- **Antigravity (メイン実装担当)**: `.ai/antigravity-context.md`
- **Codex Desktop (実装担当)**: `.ai/codex-app-context.md`
- **Codex CLI (レビュー担当)**: `.ai/codex-context.md` (レビュー結果は `docs/12_review_log.md` へ記録、コード変更不可)

※ `.ai/` Context ファイルが存在しない場合（新規PCでのクローン直後など）は、AI Development Core の Context Builder (`scripts/prompt/build-agent-context.ps1`) を実行して Context を再生成してください。Context ファイルの手動作成・手動修正は行わないでください。
