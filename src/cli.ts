import * as vscode from "vscode";
import * as cp from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

/**
 * Thin wrapper around the real `opencrater` CLI. We deliberately drive the CLI
 * for sign-in + host wiring (rather than reimplementing it) so earning works
 * exactly as it does in the terminal — the extension is a friendly front-end.
 */
export class Cli {
  private terminal(name = "OpenCrater"): vscode.Terminal {
    return vscode.window.terminals.find((t) => t.name === name) ?? vscode.window.createTerminal(name);
  }

  /** Is `opencrater` on PATH? */
  isInstalled(): Promise<boolean> {
    return new Promise((resolve) => {
      cp.exec("opencrater --version", { timeout: 8000 }, (err) => resolve(!err));
    });
  }

  install(): void {
    const t = this.terminal();
    t.show();
    t.sendText("npm i -g opencrater");
  }

  /** Official login: opens the browser to /dev/link, wires detected AI CLIs. */
  login(): void {
    const t = this.terminal();
    t.show();
    t.sendText("opencrater login");
  }

  /** Re-wire hooks into installed AI CLIs (e.g. after installing a new one). */
  wire(): void {
    const t = this.terminal();
    t.show();
    t.sendText("opencrater on");
  }

  /** Launch a coding agent on earned compute. */
  run(agent: "claude" | "codex" | "grok"): void {
    const t = this.terminal(`OpenCrater ${agent}`);
    t.show();
    t.sendText(`opencrater ${agent}`);
  }

  /** Where the CLI persists its state (shared with the hooks). */
  statePath(): string {
    const override = process.env.OPENCRATER_STATE;
    if (override) return override;
    // CLI + hooks share ~/.config/opencrater/state.json (XDG); env override wins.
    return path.join(os.homedir(), ".config", "opencrater", "state.json");
  }

  /** Best-effort read of the device token the CLI stored at login. */
  readDevToken(): string | undefined {
    try {
      const j = JSON.parse(fs.readFileSync(this.statePath(), "utf8")) as { devToken?: unknown };
      return typeof j.devToken === "string" && j.devToken.startsWith("ocd_") ? j.devToken : undefined;
    } catch {
      return undefined;
    }
  }
}
