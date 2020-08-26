import { workspace, Uri } from "vscode";
import axios from "axios";

export async function packageJsonExists(): Promise<boolean> {
	if (workspace.rootPath) {
		const files = await workspace.findFiles("package.json");
		if (files && files.length > 0) {
			return true;
		}
	}

	return false;
}

export async function readFile(path: string) {
	let contents;
	try {
		contents = await workspace.fs.readFile(Uri.file(path));
	} catch (error) {
		console.error("Error reading file.");
	}

	return contents;
}

export async function getPackageJson() {
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

export async function getObjectAsArray(name: string) {
	const packageJson = await getPackageJson();
	if (packageJson) {
		if (Object.keys(packageJson).includes(name)) {
			const object = packageJson[name];
			return Object.keys(object).map((key) => [key, object[key]]);
		}
	}
	return [];
}

export async function getDependencies() {
	const packages = await getObjectAsArray("dependencies");

	let packageObjects: PackageData[] = [];
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
				size: undefined
			}
		];
	}

	return packageObjects;
}

export async function getDependenciesWithoutSize() {
	const packages = await getObjectAsArray("dependencies");

	let packageObjects: Dependency[] = [];
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
