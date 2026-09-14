import { apiKeyClient } from "@better-auth/api-key/client";
import { ssoClient } from "@better-auth/sso/client";
import { genericOAuthClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL:
		process.env.NEXT_PUBLIC_API_URL || globalThis.window?.location.origin,
	fetchOptions: {
		credentials: "include",
	},
	plugins: [ssoClient(), genericOAuthClient(), apiKeyClient()],
});

export const { getSession, signIn, signOut, useSession } = authClient;

export type AuthClient = typeof authClient;
