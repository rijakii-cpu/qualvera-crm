import { describe, expect, it } from "bun:test";
import { OAUTH_START } from "../src/oauth-start-config";
import { socialOAuthStartQuery } from "../src/oauth-start-query";
import { socialOAuthStartURL, ssoOAuthStartURL } from "../src/oauth-start-url";

const API_ORIGIN = "https://qualvera-crm-api.vercel.app";
const APP_ORIGIN = "https://qualvera-crm-app.vercel.app";

describe("socialOAuthStartURL", () => {
	it("starts Google on the API origin, not the app origin", () => {
		const url = new URL(
			socialOAuthStartURL(API_ORIGIN, {
				provider: "google",
				callbackURL: `${APP_ORIGIN}/`,
				errorCallbackURL: `${APP_ORIGIN}/sign-in`,
			}),
		);

		expect(url.origin).toBe(API_ORIGIN);
		expect(url.pathname).toBe(OAUTH_START.socialPath);
		expect(url.searchParams.get("provider")).toBe("google");
		expect(url.searchParams.get("callbackURL")).toBe(`${APP_ORIGIN}/`);
		expect(url.searchParams.get("errorCallbackURL")).toBe(
			`${APP_ORIGIN}/sign-in`,
		);
	});

	it("does not point at Better Auth's XHR social endpoint", () => {
		const url = socialOAuthStartURL(API_ORIGIN, {
			provider: "microsoft",
			callbackURL: `${APP_ORIGIN}/`,
			errorCallbackURL: `${APP_ORIGIN}/sign-in`,
		});

		expect(url).not.toContain("/api/auth/sign-in/social");
	});
});

describe("socialOAuthStartQuery", () => {
	it("rejects a start without a provider", () => {
		expect(
			socialOAuthStartQuery.safeParse({
				callbackURL: `${APP_ORIGIN}/`,
				errorCallbackURL: `${APP_ORIGIN}/sign-in`,
			}).success,
		).toBe(false);
	});

	it("rejects a relative return URL", () => {
		expect(
			socialOAuthStartQuery.safeParse({
				provider: "google",
				callbackURL: "/",
				errorCallbackURL: "/sign-in",
			}).success,
		).toBe(false);
	});
});

describe("ssoOAuthStartURL", () => {
	it("starts SSO on the API origin", () => {
		const url = new URL(
			ssoOAuthStartURL(API_ORIGIN, {
				providerId: "okta",
				callbackURL: `${APP_ORIGIN}/`,
				errorCallbackURL: `${APP_ORIGIN}/sign-in`,
			}),
		);

		expect(url.origin).toBe(API_ORIGIN);
		expect(url.pathname).toBe(OAUTH_START.ssoPath);
		expect(url.searchParams.get("providerId")).toBe("okta");
	});
});
