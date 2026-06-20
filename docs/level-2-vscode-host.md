# Level 2 — In-editor earning: the `vscode` host + painter (design)

> **Status:** design / not started. **Gated on a Marketplace + legal policy review (see §7).**
> Level 1 (the companion extension in this repo) ships first and carries zero ad-policy risk.

## 1. Why

Level 1 reuses the terminal earning model — great for devs who run Claude Code / Codex in the
integrated terminal. But the largest population of AI-coding developers never touch a terminal CLI:
they use **in-editor** assistants — GitHub Copilot Chat, Cursor, Cline, Continue, Windsurf/Codeium.
To let *them* earn compute, OpenCrater needs a native **editor** rendering surface for Blips — a new
host alongside the existing `claude_code | codex | copilot_cli | grok_cli | antigravity | openclaw |
generic`. This is the bigger build and the bigger prize.

## 2. The surface (what an in-editor Blip looks like)

Options, least → most intrusive (and least → most policy risk):

| Surface | UX | Pros | Cons |
|---|---|---|---|
| **Status-bar Blip** | A compact, rotating sponsored item in the status bar | Unobtrusive, native, dismissible | Low surface area / low value to advertisers |
| **Sidebar panel** (webview) | A "Compute" panel that periodically shows a Blip card | Rich, tasteful, fully controlled | Only visible when the panel is open |
| **Post-action toast** | A subtle notification after a meaningful action (chat turn, build) | High intent, contextual | Notification fatigue; policy-sensitive |
| **Editor decoration / CodeLens** | Inline near generated code | Very high attention | Most intrusive; highest policy + UX risk — avoid early |

**Recommendation:** start with the **sidebar webview Blip card** + an optional **status-bar Blip**.
Both are clearly contained, opt-in, and dismissible — consistent with the "tasteful, you keep the
off switch" ethos. Defer toasts/decorations until the model is proven and policy-cleared.

## 3. Backend changes

1. **`Host` enum:** add `vscode`. Touch points (mirror an existing host like `copilot_cli`):
   - DB `CHECK` constraints / migrations on placement + impression tables.
   - `frontend/src/lib/types.ts` `Host` union, host labels, placement UI.
   - Targeting: advertisers can target/`target_hosts` include `vscode` (competitor/host targeting).
   - Placement gating + content policy rules keyed by host.
2. **Render/impression pipeline:** the editor reports a *rendered* impression and clicks exactly like
   the SDK does today — `POST /v1/dev/impression` (render receipt) and the click-token redemption
   flow. No new billing primitive: an editor render is just an impression with `host = vscode`.
3. **Serve endpoint:** the extension fetches servable Blips for `host = vscode` via the existing
   dev-serve path (device-token authed), with frequency-cap + min-interval config honored server-side.
4. **Compute crediting:** unchanged — weekly grant as a share of engagement; the `vscode` host
   feeds the same `dev_engagement` accounting.

## 4. Extension changes (the painter)

- A **`vscode` painter** analogous to the terminal `render.ts`/`paint.ts`, but rendering to a webview
  card / status-bar item instead of ANSI. Render → report impression (`/v1/dev/impression`) only when
  actually shown (render receipt), so unrendered serves never bill.
- **Click** → open the target via a click token (attribution), redeem server-side.
- **Frequency caps / min interval** pulled from remote config (reuse `RemoteConfig`:
  `minIntervalSeconds`, `displayDurationSeconds`, `killSwitch`, `minSdkVersion`).
- **Dismiss / report** affordances (✕ + ⚑) → feed the same dismissal/report signals the terminal
  cards do (recsys negative feedback).
- **Hard opt-in:** a first-run consent step; a global off switch; respect `killSwitch`.

## 5. Placement semantics (when does a Blip show?)

- Cadence-based (every N minutes of active editing) with a min-interval — **not** per-keystroke.
- Optionally post-meaningful-action (after a chat completion) if/when toasts are cleared.
- Never during typing, debugging breakpoints, or modal flows. Tasteful > frequent (our inventory
  dies if devs uninstall).

## 6. Privacy / data

- Same stance as the SDK: never read code/prompts/files; an editor render is an event, attribution
  is a token. Update **opencrater.to/data** to enumerate the `vscode` surface explicitly.
- Editor context used for matching stays coarse (language, project type) — no file contents.

## 7. ⚠️ Policy gate (do this BEFORE building §3–§5)

This is the make-or-break step.

- **VS Code Marketplace (Microsoft)** restricts advertising / sponsored content in extensions. An
  in-editor Blip surface may violate it. **Read the current Marketplace publisher agreement +
  content guidelines and get a written legal read** before shipping the painter. Assume the answer
  may be "not on the MS Marketplace."
- **Open VSX** (eclipse) is the registry **Cursor, Windsurf, VSCodium, and Gitpod** use, with
  different governance. If MS says no, Open VSX may still allow distribution to a huge slice of the
  exact audience (Cursor/Windsurf users). Plan to publish there regardless.
- **Mitigations that improve approval odds:** strictly opt-in, user-initiated, dismissible,
  clearly labeled "Sponsored Blip," no tracking of code, the off switch, and the "developer earns"
  framing. None of these guarantee approval.
- **Fallback distribution:** direct `.vsix` / self-host, and lean on the Level 1 companion (which is
  policy-safe) on the MS Marketplace while the earning surface lives on Open VSX / direct.

## 8. Rollout

1. Legal/policy read (§7) — **blocking.**
2. Backend `vscode` host + serve/impression wired (§3).
3. Extension painter behind a feature flag + consent (§4–§5), internal dogfood.
4. Open VSX release (Cursor/Windsurf), then MS Marketplace **only if** policy-cleared.
5. Update `/data`; add a `marketing/channels/vscode-marketplace/` listing.

## 9. Open questions

- Which in-editor assistants can we actually detect/attribute around (Copilot vs Cursor vs Cline)?
- Webview-only (panel open) vs status-bar (always visible) for the first earning surface?
- Do we need a separate trust tier / fraud model for editor renders vs terminal renders?
