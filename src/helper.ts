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
	} catch (error) {
		console.error("Error reading file.");
	}

	return contents;
}

export async function getPackageJson(): Promise<any> {
	if (packageJsonExists()) {
		const contents = await readFile(`${workspace.rootPath}/package.json`);

		if (!contents) {
			console.error("package.json does not exist.");
			return;
		}
		if (contents.length <= 0) {
			console.error("Empty package.json!");
			return;
		}

		return JSON.parse(contents.toString());
	}
}

export async function getObjectAsArray(name: string): Promise<any[][]> {
	const packageJson = await getPackageJson();
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

	return parseInt(JSON.stringify(response.dist.unpackedSize));
}

export async function getDependencies(): Promise<PackageData[]> {
	const packages = await getObjectAsArray("dependencies");

	const packageObjects: PackageData[] = [];
	for (let i = 0; i < packages.length; i++) {
		packageObjects.push({
			name: packages[i][0],
			version: packages[i][1].replace("^", ""),
			size: await getPackageSize(packages[i][0], packages[i][1])
		});
	}

	if (packageObjects === undefined) {
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
	for (let i = 0; i < packages.length; i++) {
		packageObjects.push({
			name: packages[i][0],
			version: packages[i][1].replace("^", "")
		});
	}

	if (packageObjects === undefined) {
		return [
			{
				name: "",
				version: ""
			}
		];
	}

	return packageObjects;
}
