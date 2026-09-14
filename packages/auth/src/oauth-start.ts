import { auth } from "./auth";
import {
	oauthStartRedirect,
	type SocialOAuthStartQuery,
	type SsoOAuthStartQuery,
} from "./oauth-start-query";

export type OAuthStartResult = {
	url: string;
	cookies: string[];
};

export class OAuthStartError extends Error {
	readonly status: number;
	readonly body: string;

	constructor(status: number, body: string) {
		super("OAuth start failed");
		this.status = status;
		this.body = body;
	}
}

export async function issueSocialOAuthStart(
	input: SocialOAuthStartQuery,
	headers: Headers,
): Promise<OAuthStartResult> {
	const response = await auth.api.signInSocial({
		body: {
			provider: input.provider,
			callbackURL: input.callbackURL,
			errorCallbackURL: input.errorCallbackURL,
		},
		headers,
		asResponse: true,
	});

	return readOAuthStartResponse(response);
}

export async function issueSsoOAuthStart(
	input: SsoOAuthStartQuery,
	headers: Headers,
): Promise<OAuthStartResult> {
	const response = await auth.api.signInSSO({
		body: {
			providerId: input.providerId,
			callbackURL: input.callbackURL,
			errorCallbackURL: input.errorCallbackURL,
		},
		headers,
		asResponse: true,
	});

	return readOAuthStartResponse(response);
}

async function readOAuthStartResponse(
	response: Response,
): Promise<OAuthStartResult> {
	const cookies = response.headers.getSetCookie();

	if (!response.ok) {
		throw new OAuthStartError(response.status, await response.text());
	}

	const location = response.headers.get("location");
	if (location) {
		return { url: location, cookies };
	}

	const parsed = oauthStartRedirect.safeParse(await response.json());
	if (!parsed.success) {
		throw new OAuthStartError(502, "Sign-in did not return a provider URL.");
	}

	return { url: parsed.data.url, cookies };
}
