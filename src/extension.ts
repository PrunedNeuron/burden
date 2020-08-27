import prettyBytes from "pretty-bytes";
import vscode from "vscode";

import { getDependenciesWithoutSize, getPackageSize } from "./helper";

let statusBar: vscode.StatusBarItem;

export function calculateTotalSize(
	packageData: PackageData[] | undefined
): number {
	if (packageData !== undefined) {
		return packageData.reduce((a, b) => a + b.size, 0);
	}
	return 0;
}

export async function update(context: vscode.ExtensionContext): Promise<void> {
	const cachedDependencies: PackageData[] = context.workspaceState.get(
		"dependencies"
	) || [{ name: "", version: "", size: 0 }];
	const freshDependencies = await getDependenciesWithoutSize();

	const updatedDependencies: PackageData[] = [];

	// add dependencies that were already cached
	for (const dependency of cachedDependencies) {
		const foundDependency = freshDependencies.find(
			(pkg) =>
				pkg.name === dependency.name &&
				pkg.version === dependency.version
		);
		if (foundDependency !== undefined) {
			updatedDependencies.push({
				...foundDependency,
				size: dependency.size
			});
		}
	}

	// Add new dependencies, if any
	for (const dependency of freshDependencies) {
		if (
			!updatedDependencies.some(
				(pkg) =>
					pkg.name === dependency.name &&
					pkg.version === dependency.version
			)
		) {
			updatedDependencies.push({
				...dependency,
				size: await getPackageSize(dependency.name, dependency.version)
			});
		}
	}

	// update workspaceState
	context.workspaceState.update("dependencies", updatedDependencies);
	context.workspaceState.update(
		"dependenciesSize",
		calculateTotalSize(updatedDependencies)
	);
}

export function updateStatusBar(context: vscode.ExtensionContext): void {
	if (!statusBar) {
		statusBar = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Left
		);
		statusBar.show();
	}
	statusBar.show();
	const bytes = prettyBytes(
		context.workspaceState.get("dependenciesSize") || 0
	);
	statusBar.text = `$(package) ${bytes}`;
	statusBar.tooltip = `Unpacked size: ${bytes}`;
}

export async function activate(
	context: vscode.ExtensionContext
): Promise<void> {
	console.log('Congratulations, your extension "size" is now active!');

	const activeEditor: vscode.TextEditor | undefined =
		vscode.window.activeTextEditor;

	await update(context);
	updateStatusBar(context);

	context.subscriptions.push(statusBar);

	vscode.workspace.onDidSaveTextDocument(
		async (document) => {
			if (
				activeEditor &&
				document === activeEditor.document &&
				document.fileName.includes("package.json")
			) {
				await update(context);
				updateStatusBar(context);
				console.log(
					prettyBytes(
						context.workspaceState.get("dependenciesSize") || 0
					)
				);
			}
		},
		null,
		context.subscriptions
	);

	updateStatusBar(context);
}

export function deactivate(): void {
	// context.workspaceState.update("dependencies", undefined);
	// context.workspaceState.update("dependenciesSize", undefined);
}
