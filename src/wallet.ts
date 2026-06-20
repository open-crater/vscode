import * as vscode from "vscode";
import { DevMe } from "./api";
import { formatTokens, formatTokensFine } from "./format";

interface Row {
  label: string;
  description?: string;
  tooltip?: string;
  icon?: string;
  command?: string;
}

type State =
  | { kind: "loading" }
  | { kind: "signedOut" }
  | { kind: "error" }
  | { kind: "ok"; me: DevMe };

/** The "Compute Wallet" sidebar view. */
export class WalletProvider implements vscode.TreeDataProvider<Row> {
  private readonly _onDidChange = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChange.event;
  private state: State = { kind: "loading" };

  setMe(me: DevMe): void {
    this.state = { kind: "ok", me };
    this._onDidChange.fire();
  }
  setSignedOut(): void {
    this.state = { kind: "signedOut" };
    this._onDidChange.fire();
  }
  setError(): void {
    this.state = { kind: "error" };
    this._onDidChange.fire();
  }

  getTreeItem(r: Row): vscode.TreeItem {
    const item = new vscode.TreeItem(r.label, vscode.TreeItemCollapsibleState.None);
    item.description = r.description;
    item.tooltip = r.tooltip ?? r.description;
    if (r.icon) item.iconPath = new vscode.ThemeIcon(r.icon);
    if (r.command) item.command = { command: r.command, title: r.label };
    return item;
  }

  getChildren(): Row[] {
    switch (this.state.kind) {
      case "loading":
        return [{ label: "Loading…", icon: "loading~spin" }];
      case "signedOut":
        return [
          { label: "Sign in / sign up", icon: "sign-in", command: "opencrater.signIn" },
          { label: "Install the CLI", icon: "cloud-download", command: "opencrater.installCli" },
          { label: "Maintain a package? Earn USDC", icon: "package", command: "opencrater.openPublisher", tooltip: "Package, MCP server, or AI-agent tool → earn real USDC, paid every 48h" },
          { label: "What we collect / don't", icon: "shield", command: "opencrater.openData" },
        ];
      case "error":
        return [{ label: "Couldn't reach OpenCrater — reconnect", icon: "warning", command: "opencrater.signIn" }];
      case "ok": {
        const me = this.state.me;
        return [
          { label: "Available", description: formatTokens(me.balanceMicroUsd), icon: "zap", tooltip: "Spendable compute now" },
          { label: "Pending", description: `+${formatTokensFine(me.pendingMicroUsd)}`, icon: "history", tooltip: "Lands at the next weekly payout" },
          { label: "Account", description: `${me.displayName} · ${me.trustTier}`, icon: "account" },
          { label: "Run Claude Code on compute", icon: "play", command: "opencrater.runClaude" },
          { label: "Run Codex on compute", icon: "play", command: "opencrater.runCodex" },
          { label: "Wire AI CLIs (earn compute)", icon: "plug", command: "opencrater.wireHosts" },
          { label: "Maintain a package? Earn USDC", icon: "package", command: "opencrater.openPublisher", tooltip: "Package, MCP server, or AI-agent tool → earn real USDC, paid every 48h" },
          { label: "Open dashboard", icon: "dashboard", command: "opencrater.openDashboard" },
          { label: "What we collect / don't", icon: "shield", command: "opencrater.openData" },
        ];
      }
    }
  }
}
