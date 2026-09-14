import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function findWorkspaceRoot(start) {
	let dir = start;
	while (true) {
		const pkgPath = join(dir, "package.json");
		if (existsSync(pkgPath)) {
			const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
			if (pkg.workspaces) return dir;
		}
		const parent = dirname(dir);
		if (parent === dir) {
			throw new Error("workspace root not found");
		}
		dir = parent;
	}
}

const start = dirname(dirname(fileURLToPath(import.meta.url)));
const root = findWorkspaceRoot(start);
const bun = process.env.BUN_BIN || "bun";
execSync(`${bun} install`, { cwd: root, stdio: "inherit" });
