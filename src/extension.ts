import vscode from "vscode";

import {
	calculateTotalSize,
	getDependenciesWithoutSize,
	getPackageSize
} from "./helper";
import StatusItem from "./StatusBar/StatusItem";

const statusBarItem = new StatusItem();

export function isPackageJson(
	document: vscode.TextDocument,
	editor: vscode.TextEditor | undefined
): boolean | undefined {
	return (
		editor &&
		document === editor.document &&
		document.fileName.includes("package.json")
	);
}

export async function getCurrentDependencies(
	cache: PackageData[],
	fresh: Dependency[]
): Promise<PackageData[]> {
	const updatedDependencies: PackageData[] = [];

	// add dependencies that were already cached
	for (const dependency of cache) {
		const foundDependency = fresh.find(
			(package_) =>
				package_.name === dependency.name &&
				package_.version === dependency.version
		);
		if (foundDependency !== undefined) {
			updatedDependencies.push({
				...foundDependency,
				size: dependency.size
			});
		}
	}

	// Add new dependencies, if any
	for (const dependency of fresh) {
		if (
			!updatedDependencies.some(
				(package_) =>
					package_.name === dependency.name &&
					package_.version === dependency.version
			)
		) {
			updatedDependencies.push({
				...dependency,
				size: await getPackageSize(dependency.name, dependency.version)
			});
		}
	}

	return updatedDependencies;
}

export async function update(context: vscode.ExtensionContext): Promise<void> {
	const cachedDependencies: PackageData[] = context.workspaceState.get(
		"dependencies"
	) || [{ name: "", version: "", size: 0 }];

	statusBarItem.update(`$(sync~spin)`);
	const freshDependencies = await getDependenciesWithoutSize();

	const updatedDependencies: PackageData[] = await getCurrentDependencies(
		cachedDependencies,
		freshDependencies
	);

	// update workspaceState
	context.workspaceState.update("dependencies", updatedDependencies);
	context.workspaceState.update(
		"dependenciesSize",
		calculateTotalSize(updatedDependencies)
	);

	statusBarItem.update(context.workspaceState.get("dependenciesSize") || 0);
	context.workspaceState.update("isLoading", false);
}

export async function activate(
	context: vscode.ExtensionContext
): Promise<void> {
	const activeEditor: vscode.TextEditor | undefined =
		vscode.window.activeTextEditor;

	await update(context);
	statusBarItem.update(context.workspaceState.get("dependenciesSize") || 0);

	context.subscriptions.push(statusBarItem.get());

	vscode.workspace.onDidSaveTextDocument(
		async (document) => {
			if (isPackageJson(document, activeEditor)) {
				await update(context);
				statusBarItem.update(
					context.workspaceState.get("dependenciesSize") || 0
				);
			}
		},
		undefined,
		context.subscriptions
	);

	statusBarItem.update(context.workspaceState.get("dependenciesSize") || 0);
}

export function deactivate(): void {
	// context.workspaceState.update("dependencies", undefined);
	// context.workspaceState.update("dependenciesSize", undefined);
}
