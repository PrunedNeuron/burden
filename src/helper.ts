import axios from "axios";
import { Uri, workspace } from "vscode";

export async function packageJsonExists(): Promise<boolean> {
	if (workspace.rootPath) {
		const files = await workspace.findFiles("package.json");
		if (files && files.length > 0) {
			return true;
		}
	}

	return false;
}

export async function readFile(path: string): Promise<Uint8Array | undefined> {
	let contents;
	try {
		contents = await workspace.fs.readFile(Uri.file(path));
	} catch {
		console.error("Error reading file.");
	}

	return contents;
}

export async function getPackageJson(): Promise<Uint8Array> {
	if (await packageJsonExists()) {
		const contents: Uint8Array =
			(await readFile(`${workspace.rootPath}/package.json`)) ||
			new Uint8Array();

		if (!contents.length) {
			console.error("package.json is empty.");
		}

		return contents;
	}

	return new Uint8Array();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getObjectAsArray(name: string): Promise<any[][]> {
	let fileContents = (await getPackageJson()).toString();
	// "/^s*$(?:\r\n?|\n)/gm"
	fileContents = fileContents.replace(/,\s*$/, "");
	const packageJson = JSON.parse(fileContents);
	if (packageJson) {
		if (Object.keys(packageJson).includes(name)) {
			const object = packageJson[name];
			return Object.keys(object).map((key) => [key, object[key]]);
		}
	}
	return [];
}

export async function getPackageSize(
	packageName: string,
	packageVersion: string
): Promise<number> {
	const response = (
		await axios({
			method: "GET",
			url: `https://registry.npmjs.org/${packageName}/${packageVersion.replace(
				"^",
				""
			)}`
		})
	).data;

	return Number.parseInt(JSON.stringify(response.dist.unpackedSize));
}

export async function getDependencies(): Promise<PackageData[]> {
	const packages = await getObjectAsArray("dependencies");

	const packageObjects: PackageData[] = [];
	for (const package_ of packages) {
		packageObjects.push({
			name: package_[0],
			version: package_[1].replace("^", ""),
			size: await getPackageSize(package_[0], package_[1])
		});
	}

	if (packageObjects.length <= 0) {
		return [
			{
				name: "",
				version: "",
				size: 0
			}
		];
	}

	return packageObjects;
}

export async function getDependenciesWithoutSize(): Promise<Dependency[]> {
	const packages = await getObjectAsArray("dependencies");

	const packageObjects: Dependency[] = [];
	for (const package_ of packages) {
		packageObjects.push({
			name: package_[0],
			version: package_[1].replace("^", "")
		});
	}

	if (packageObjects.length <= 0) {
		return [
			{
				name: "",
				version: ""
			}
		];
	}

	return packageObjects;
}

export function calculateTotalSize(
	packageData: PackageData[] | undefined
): number {
	if (packageData !== undefined) {
		return packageData.reduce((a, b) => a + b.size, 0);
	}
	return 0;
}
