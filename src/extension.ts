import * as vscode from "vscode";
import { OpenCraterApi, DevMe } from "./api";
import { Cli } from "./cli";
import { WalletProvider } from "./wallet";
import { webOrigin, pollSeconds } from "./config";
import { formatTokens, formatTokensFine } from "./format";

const TOKEN_KEY = "opencrater.token";

let statusBar: vscode.StatusBarItem;
let timer: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext): void {
  const cli = new Cli();
  const api = new OpenCraterApi();
  const wallet = new WalletProvider();

  context.subscriptions.push(vscode.window.registerTreeDataProvider("opencraterWallet", wallet));

  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.command = "opencrater.focusWallet";
  context.subscriptions.push(statusBar);

  /** Token source: extension SecretStorage first, then the CLI's state file. */
  async function getToken(): Promise<string | undefined> {
    return (await context.secrets.get(TOKEN_KEY)) ?? cli.readDevToken();
  }

  async function refresh(): Promise<void> {
    const token = await getToken();
    if (!token) {
      wallet.setSignedOut();
      statusBar.text = "$(zap) OpenCrater: sign in";
      statusBar.tooltip = "Sign in to earn AI compute as you code";
      statusBar.show();
      return;
    }
    const me = await api.devMe(token);
    if (!me) {
      wallet.setError();
      statusBar.text = "$(warning) OpenCrater";
      statusBar.tooltip = "Couldn't reach OpenCrater — click to reconnect";
      statusBar.show();
      return;
    }
    wallet.setMe(me);
    statusBar.text = `$(zap) ${formatTokens(me.balanceMicroUsd)}`;
    statusBar.tooltip =
      `OpenCrater compute · ${me.displayName} (${me.trustTier})` +
      (me.pendingMicroUsd > 0 ? ` · +${formatTokensFine(me.pendingMicroUsd)} pending` : "");
    statusBar.show();
  }

  /** Persist a verified token, refresh, and offer to wire hosts so earning starts. */
  async function onConnected(token: string, me: DevMe): Promise<void> {
    await context.secrets.store(TOKEN_KEY, token);
    await refresh();
    const pick = await vscode.window.showInformationMessage(
      `Signed in to OpenCrater as ${me.displayName}. Wire your AI CLIs so you earn compute as you code.`,
      "Wire AI CLIs",
      "Later",
    );
    if (pick === "Wire AI CLIs") cli.wire();
  }

  // Deep-link sign-in: the browser returns the token to
  // vscode://open-crater.opencrater/auth?token=ocd_… (see the /dev/link page).
  context.subscriptions.push(
    vscode.window.registerUriHandler({
      handleUri: async (uri: vscode.Uri) => {
        if (uri.path !== "/auth") return;
        const token = new URLSearchParams(uri.query).get("token")?.trim();
        if (!token || !token.startsWith("ocd_")) {
          vscode.window.showErrorMessage("OpenCrater: that sign-in link was invalid.");
          return;
        }
        const me = await api.devMe(token);
        if (!me) {
          vscode.window.showErrorMessage("OpenCrater: couldn't verify that sign-in. Try again.");
          return;
        }
        await onConnected(token, me);
      },
    }),
  );

  async function signIn(): Promise<void> {
    if (!(await cli.isInstalled())) {
      const pick = await vscode.window.showInformationMessage(
        "The OpenCrater CLI isn't installed. Install it to start earning compute?",
        "Install",
        "Cancel",
      );
      if (pick === "Install") {
        cli.install();
        vscode.window.showInformationMessage("Once the CLI finishes installing, run “OpenCrater: Sign In” again.");
      }
      return;
    }

    const choice = await vscode.window.showQuickPick(
      [
        { label: "$(globe) Sign in in your browser", description: "Opens opencrater.to and returns to VS Code automatically", id: "browser" },
        { label: "$(terminal) Sign in with the CLI", description: "Also wires your AI CLIs so you earn (recommended)", id: "cli" },
        { label: "$(key) Paste a token", description: "Manual fallback", id: "token" },
      ],
      { placeHolder: "Connect your OpenCrater account" },
    );
    if (!choice) return;

    if (choice.id === "cli") {
      cli.login();
      vscode.window.showInformationMessage("Finish signing in in the terminal, then run “OpenCrater: Refresh Wallet”.");
      return;
    }

    if (choice.id === "browser") {
      // The page deep-links the token back via the UriHandler above.
      await vscode.env.openExternal(vscode.Uri.parse(`${webOrigin()}/dev/link?client=vscode`));
      vscode.window.showInformationMessage("Complete sign-in in your browser — VS Code will connect automatically.");
      return;
    }

    // Manual paste fallback.
    await vscode.env.openExternal(vscode.Uri.parse(`${webOrigin()}/dev/link`));
    const token = await vscode.window.showInputBox({
      prompt: "Paste your OpenCrater token (ocd_…) from the page that just opened",
      password: true,
      ignoreFocusOut: true,
      validateInput: (v) => (v.trim().startsWith("ocd_") ? undefined : "Tokens start with ocd_"),
    });
    if (!token) return;
    const me = await api.devMe(token.trim());
    if (!me) {
      vscode.window.showErrorMessage("Couldn't verify that token. Check it and try again.");
      return;
    }
    await onConnected(token.trim(), me);
  }

  async function signOut(): Promise<void> {
    await context.secrets.delete(TOKEN_KEY);
    vscode.window.showInformationMessage(
      "Signed out of the wallet view. Your CLI session is unchanged — run `opencrater logout` to sign the CLI out too.",
    );
    await refresh();
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("opencrater.signIn", signIn),
    vscode.commands.registerCommand("opencrater.signOut", signOut),
    vscode.commands.registerCommand("opencrater.installCli", () => cli.install()),
    vscode.commands.registerCommand("opencrater.wireHosts", () => cli.wire()),
    vscode.commands.registerCommand("opencrater.runClaude", () => cli.run("claude")),
    vscode.commands.registerCommand("opencrater.runCodex", () => cli.run("codex")),
    vscode.commands.registerCommand("opencrater.refresh", refresh),
    vscode.commands.registerCommand("opencrater.focusWallet", () =>
      vscode.commands.executeCommand("opencraterWallet.focus"),
    ),
    vscode.commands.registerCommand("opencrater.openDashboard", () =>
      vscode.env.openExternal(vscode.Uri.parse(`${webOrigin()}/dashboard`)),
    ),
    vscode.commands.registerCommand("opencrater.openData", () =>
      vscode.env.openExternal(vscode.Uri.parse(`${webOrigin()}/data`)),
    ),
  );

  void refresh();
  timer = setInterval(() => void refresh(), pollSeconds() * 1000);
  context.subscriptions.push({ dispose: () => timer && clearInterval(timer) });
}

export function deactivate(): void {
  if (timer) clearInterval(timer);
}
