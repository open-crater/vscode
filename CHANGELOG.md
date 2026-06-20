# Changelog

## 0.1.0 — unreleased (Level 1 MVP)

First scaffold. The extension is a friendly front-end over the real `opencrater`
CLI — it does not contain or expose the SDK.

- **Sign in / sign up** from inside VS Code (drives `opencrater login`, which also
  wires your AI CLIs so you earn; or paste-token to connect just the wallet view).
- **Install the CLI** with one command (`npm i -g opencrater`).
- **Compute Wallet** sidebar view + **status-bar HUD** showing your balance
  (`GET /v1/dev/me`), refreshed on an interval.
- **Run Claude Code / Codex on compute** in the integrated terminal.
- **Wire AI CLIs** (`opencrater on`) to (re)connect earning.
- Privacy: every surface links **opencrater.to/data** (what we collect / don't).

### Before publishing
- [ ] Add `media/icon.png` (128×128+; required by `vsce package`).
- [ ] Register the **`open-crater`** publisher on the VS Code Marketplace (and Open VSX).
- [ ] Optional: replace paste-token with a `vscode://` deep-link callback from `/dev/link`.
- [ ] Legal/policy review (see `docs/level-2-vscode-host.md`) before any in-editor Blip surface.
