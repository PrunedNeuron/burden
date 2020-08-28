import prettyBytes from "pretty-bytes";
import vscode from "vscode";

export default class StatusItem {
	private statusBarItem: vscode.StatusBarItem;

	constructor() {
		this.statusBarItem = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Left
		);
		this.statusBarItem.show();
	}

	get(): vscode.StatusBarItem {
		return this.statusBarItem;
	}

	update(context: vscode.ExtensionContext): void {
		this.statusBarItem.show();
		const bytes = prettyBytes(
			context.workspaceState.get("dependenciesSize") || 0
		);
		this.statusBarItem.text = `$(package) ${bytes}`;
		this.statusBarItem.tooltip = `Unpacked size: ${bytes}`;
	}
}
