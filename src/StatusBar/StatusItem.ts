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

	update(text: number | string): void {
		this.statusBarItem.show();
		if (typeof text === "number") {
			this.statusBarItem.text = `$(package) ${prettyBytes(text)}`;
			this.statusBarItem.tooltip = `Unpacked size: ${prettyBytes(text)}`;
		} else {
			this.statusBarItem.text = `${text}`;
			this.statusBarItem.tooltip = `Loading...`;
		}
	}
}
