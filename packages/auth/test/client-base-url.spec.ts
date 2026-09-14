import { describe, expect, it } from "bun:test";
import { resolveAuthClientBaseURL } from "../src/client-base-url";

describe("resolveAuthClientBaseURL", () => {
	it("uses the API origin when NEXT_PUBLIC_API_URL is set", () => {
		expect(
			resolveAuthClientBaseURL(
				"https://qualvera-crm-api.vercel.app",
				"https://qualvera-crm-app.vercel.app",
			),
		).toBe("https://qualvera-crm-api.vercel.app");
	});

	it("falls back to the page origin when the API origin is unset", () => {
		expect(resolveAuthClientBaseURL(undefined, "http://localhost:3000")).toBe(
			"http://localhost:3000",
		);
	});

	it("treats an empty API origin as unset", () => {
		expect(resolveAuthClientBaseURL("", "http://localhost:3000")).toBe(
			"http://localhost:3000",
		);
	});
});
