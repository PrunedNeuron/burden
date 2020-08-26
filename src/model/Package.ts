class Package {
	private name: string;
	private version: string;
	private size?: number; // in bytes

	constructor(name?: string, version?: string, size?: number) {
		this.name = name || "";
		this.version = version || "";
		this.size = size; // nullable
	}

	equals(pkg: Package) {
		if (this.name === pkg.name && this.version === pkg.version) {
			return true;
		} else {
			return false;
		}
	}
}
