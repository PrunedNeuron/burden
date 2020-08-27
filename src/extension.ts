import * as vscode from "vscode";
import prettyBytes from "pretty-bytes";
import { getDependenciesWithoutSize, getPackageSize } from "./helper";

let statusBar: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "size" is now active!');

	let activeEditor: vscode.TextEditor | undefined =
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

export async function update(context: vscode.ExtensionContext) {
	const cachedDependencies: PackageData[] = context.workspaceState.get(
		"dependencies"
	) || [{ name: "", version: "", size: 0 }];
	const freshDependencies = await getDependenciesWithoutSize();

	let updatedDependencies: PackageData[] = [];

	// add dependencies that were already cached
	for (let dependency of cachedDependencies) {
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
	for (let dependency of freshDependencies) {
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

export function calculateTotalSize(packageData: PackageData[] | undefined) {
	if (packageData !== undefined) {
		let sum = 0;
		packageData.forEach((data) => {
			if (data.size) {
				sum += data.size;
			} else {
				return 0;
			}
		});

		return sum;
	}
}

export function updateStatusBar(context: vscode.ExtensionContext) {
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

export function deactivate() {
	// context.workspaceState.update("dependencies", undefined);
	// context.workspaceState.update("dependenciesSize", undefined);
}
