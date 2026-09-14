import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "bun:test";

describe("Vercel serverless entry", () => {
	it("does not live under api/ where Vercel auto-detects filesystem functions", () => {
		expect(existsSync(join(import.meta.dir, "../api/index.ts"))).toBe(false);
		expect(existsSync(join(import.meta.dir, "../serverless.ts"))).toBe(true);
	});
});
