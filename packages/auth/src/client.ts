import { apiKeyClient } from "@better-auth/api-key/client";
import { ssoClient } from "@better-auth/sso/client";
import { genericOAuthClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { resolveAuthClientBaseURL } from "./client-base-url";

export const authClient = createAuthClient({
	baseURL: resolveAuthClientBaseURL(),
	fetchOptions: {
		credentials: "include",
	},
	plugins: [ssoClient(), genericOAuthClient(), apiKeyClient()],
});

export const { getSession, signIn, signOut, useSession } = authClient;

export type AuthClient = typeof authClient;
