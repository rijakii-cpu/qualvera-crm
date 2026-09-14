import { apiKeyClient } from "@better-auth/api-key/client";
import { ssoClient } from "@better-auth/sso/client";
import { genericOAuthClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { resolveAuthClientBaseURL } from "./client-base-url";
import { socialOAuthStartURL, ssoOAuthStartURL } from "./oauth-start-url";
import type { MailboxProviderId } from "./scopes";

export const authClient = createAuthClient({
	baseURL: resolveAuthClientBaseURL(),
	fetchOptions: {
		credentials: "include",
	},
	plugins: [ssoClient(), genericOAuthClient(), apiKeyClient()],
});

export const { getSession, signIn, signOut, useSession } = authClient;

export type AuthClient = typeof authClient;

export function startSocialOAuth(provider: MailboxProviderId): void {
	globalThis.window.location.assign(
		socialOAuthStartURL(requireApiOrigin(), {
			provider,
			...returnUrls(),
		}),
	);
}

export function startSsoOAuth(providerId: string): void {
	globalThis.window.location.assign(
		ssoOAuthStartURL(requireApiOrigin(), {
			providerId,
			...returnUrls(),
		}),
	);
}

function requireApiOrigin(): string {
	const apiUrl = resolveAuthClientBaseURL();
	if (!apiUrl) {
		throw new Error("Could not reach the sign-in service.");
	}
	return apiUrl;
}

function returnUrls() {
	const origin = globalThis.window.location.origin;
	return {
		callbackURL: `${origin}/`,
		errorCallbackURL: `${origin}/sign-in`,
	};
}
