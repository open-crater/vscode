import * as vscode from "vscode";

function cfg() {
  return vscode.workspace.getConfiguration("opencrater");
}

/** API origin (no trailing slash). Default: https://api.opencrater.to */
export function apiOrigin(): string {
  return (cfg().get<string>("apiOrigin") || "https://api.opencrater.to").replace(/\/$/, "");
}

/** Website origin (no trailing slash). Default: https://opencrater.to */
export function webOrigin(): string {
  return (cfg().get<string>("webOrigin") || "https://opencrater.to").replace(/\/$/, "");
}

/** Wallet refresh interval in seconds (min 30). */
export function pollSeconds(): number {
  return Math.max(30, cfg().get<number>("pollSeconds") ?? 90);
}
