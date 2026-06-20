# OpenCrater — Earn AI Compute (and USDC)

**Get paid for the AI coding you already do — without leaving your editor.**

OpenCrater turns the terminal into an income stream that flows back to *you*. There are **two ways
to earn**, and you can do either or both:

### 1. Earn AI compute — for any developer
Code in the AI CLIs you already use — **Claude Code, Codex, Gemini/Antigravity, Copilot CLI, Grok
CLI**. When your session shows an occasional, tasteful, opt-in **Blip**, you bank **AI compute** —
tokens you spend on Claude or Codex when you hit your plan's limit. Zero workflow change, opt-in, and
you hold the off switch.

### 2. Earn real USDC — if you maintain something
Maintain a **package, MCP server, CLI tool, or anything that works with AI agents**? Wire OpenCrater
into it and earn **real income in USDC** from Blips shown to *your tool's* users — **per click, paid
out on a 48-hour cycle.** Open source finally pays.

> **What this extension is:** a friendly front-end for the `opencrater` CLI — it installs the CLI,
> signs you in, wires your AI CLIs, and shows your **compute wallet** right in the editor. It contains
> no SDK code. Earning happens through the CLI/SDK; the USDC/maintainer side is managed on your
> **dashboard** (the extension links you there).

---

## Quick start (earn compute)

1. Run **OpenCrater: Sign In / Sign Up** from the Command Palette (or click the OpenCrater ⚡ icon →
   **Sign in**). It installs the CLI if needed and signs you in.
2. Your installed AI CLIs get **wired** automatically.
3. Code as usual — your compute balance grows in the status bar.
4. Hit your limit? Run **OpenCrater: Run Claude Code on Compute** (or `opencrater claude`).

Prefer the terminal?

```bash
npm i -g opencrater
opencrater login        # link this machine + wire your AI CLIs (earn compute)
opencrater balance      # check your compute wallet
opencrater claude       # run Claude Code on your earned compute
```

## Earn USDC as a maintainer

1. Open **OpenCrater: Earn USDC With Your Package (Publisher)** (or visit your dashboard) and
   register your package / MCP server / tool to get a **publisher key** (`ock_…`).
2. Wire it so Blips shown to your tool's users attribute to you:

```bash
opencrater on --key ock_xxx --package your-package-name
```

Earnings (per-click, USDC, settled every 48h) show on your dashboard.

---

## What you can do from the editor

- **Sign in / sign up** — browser (one click, deep-links back), CLI, or paste-token.
- **Install the CLI** — one command.
- **Wire AI CLIs (earn compute)** — connect your installed AI coding CLIs.
- **Compute Wallet** — balance + pending in a sidebar view and the status bar.
- **Run Claude Code / Codex on compute** — launch them on your earned compute.
- **Earn USDC with your package** — jump to the publisher dashboard.

## Command reference (the `opencrater` CLI)

| Command | What it does |
|---|---|
| `opencrater login` | Link this machine to your account and wire your AI CLIs (earn **compute**). |
| `opencrater on` | Opt in / re-wire compute hooks. With `--key <ock_…> --package <name>` → **publisher mode** (earn **USDC** on your package's Blips). |
| `opencrater off` | Opt out of Blips on this machine. |
| `opencrater balance` | Show your compute wallet balance. |
| `opencrater claude [..args]` | Run Claude Code on earned compute. Args pass through; `opencrater claude -c` resumes the session your limit cut off. |
| `opencrater codex [..args]` | Run Codex on earned compute (`-c` resumes your last session). |
| `opencrater grok [..args]` | Run xAI's Grok CLI on earned compute (`-c` continues). |
| `opencrater status` | Show install id, opt-out state, and detected hosts. |
| `opencrater logout` | Unlink the compute wallet on this machine. |
| `opencrater hooks install --key <ock_…> --package <name> [--host <host>]` | (Re)install publisher hooks — all detected hosts, or one `--host`. |
| `opencrater hooks uninstall` | Remove all OpenCrater hooks. |
| `opencrater hooks list` | List installed OpenCrater hooks. |

Supported hosts: **Claude Code, Codex, Gemini/Antigravity, Copilot CLI, Grok CLI.**
Env: `OPENCRATER_DISABLE=1` disables everything; `NO_COLOR` is respected.

## Privacy — what we collect & what we don't

OpenCrater never reads your code, prompts, or files. We log the Blips you see and click — that's how
you earn — plus basic context (which CLI, package type, language, location) to match Blips and
attribute earnings. Nothing about your actual work. It's opt-in, and you can turn it off any time.
See exactly what we do and don't collect: **https://opencrater.to/data**

## Settings

- `opencrater.apiOrigin` — API origin (default `https://api.opencrater.to`).
- `opencrater.webOrigin` — website origin (default `https://opencrater.to`).
- `opencrater.pollSeconds` — wallet refresh interval (default 90s, min 30s).

## Get early access

OpenCrater is invite-only before our public launch this fall.
**Join the waitlist → https://opencrater.to/waitlist?utm_source=vscode&utm_medium=extension&utm_campaign=phase1-dev**

Follow along: X **@opencratr** · Instagram **@opencrater** · [opencrater.to](https://opencrater.to)
