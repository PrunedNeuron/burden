import * as vscode from "vscode";
import prettyBytes from "pretty-bytes";
import {
	getDependencies,
	getDependenciesWithoutSize,
	getPackageSize
} from "./helper";

let statusBar: vscode.StatusBarItem;

const emptyPackage = { name: "", version: "", size: 0 };
const emptyPackageWithoutSize = { name: "", version: "" };

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
	/* const dependencies = await getDependencies(true);
	context.workspaceState.update("dependencies", dependencies);

	const totalSize = calculateTotalSize(dependencies);
	context.workspaceState.update("dependenciesSize", totalSize); */

	const cachedDependencies: PackageData[] = context.workspaceState.get(
		"dependencies"
	) || [emptyPackage];
	const freshDependencies = await getDependenciesWithoutSize();
	console.log("Cached dependencies: ");
	console.log(cachedDependencies);
	console.log("Fresh dependencies: ");
	console.log(freshDependencies);

	let finalDependencies: PackageData[] = [];

	for (let dependency of cachedDependencies) {
		const foundDependency = freshDependencies.find(
			(pkg) =>
				pkg.name === dependency.name &&
				pkg.version === dependency.version
		);
		if (foundDependency !== undefined) {
			finalDependencies.push({
				...foundDependency,
				size: dependency.size
			});
		}
	}

	for (let dependency of freshDependencies) {
		if (
			!finalDependencies.some(
				(pkg) =>
					pkg.name === dependency.name &&
					pkg.version === dependency.version
			)
		) {
			finalDependencies.push({
				...dependency,
				size: await getPackageSize(dependency.name, dependency.version)
			});
		}
	}

	// find new dependencies

	const getNewDependencies = (
		then: PackageData[],
		now: Dependency[]
	): Dependency[] => {
		const newPkg: Dependency[] = [];
		now.forEach((nowPkg) => {
			if (
				!then.some(
					(thenPkg) =>
						nowPkg.name === thenPkg.name &&
						nowPkg.version === thenPkg.version
				)
			) {
				newPkg.push(nowPkg);
			}
		});
		return newPkg;
	};

	const newDependencies: Dependency[] = getNewDependencies(
		cachedDependencies,
		freshDependencies
	);

	console.log("New dependencies = ");
	console.log(newDependencies);

	const newDependenciesAsPackages: PackageData[] = [];

	for (let dependency of newDependencies) {
		newDependenciesAsPackages.push({
			...dependency,
			size: await getPackageSize(dependency.name, dependency.version)
		});
	}

	// append to workspaceState
	context.workspaceState.update("dependencies", finalDependencies);
	context.workspaceState.update(
		"dependenciesSize",
		calculateTotalSize(finalDependencies)
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
	statusBar.text = `${prettyBytes(
		context.workspaceState.get("dependenciesSize") || 0
	)}`;
}

export function deactivate(context: vscode.ExtensionContext) {
	// context.workspaceState.update("dependencies", undefined);
	// context.workspaceState.update("dependenciesSize", undefined);
}
