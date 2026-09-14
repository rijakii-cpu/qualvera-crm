import { OAUTH_START } from "./oauth-start-config";
import type {
	SocialOAuthStartQuery,
	SsoOAuthStartQuery,
} from "./oauth-start-query";

export function socialOAuthStartURL(
	apiUrl: string,
	input: SocialOAuthStartQuery,
): string {
	const url = new URL(OAUTH_START.socialPath, apiUrl);
	url.searchParams.set("provider", input.provider);
	url.searchParams.set("callbackURL", input.callbackURL);
	url.searchParams.set("errorCallbackURL", input.errorCallbackURL);
	return url.toString();
}

export function ssoOAuthStartURL(
	apiUrl: string,
	input: SsoOAuthStartQuery,
): string {
	const url = new URL(OAUTH_START.ssoPath, apiUrl);
	url.searchParams.set("providerId", input.providerId);
	url.searchParams.set("callbackURL", input.callbackURL);
	url.searchParams.set("errorCallbackURL", input.errorCallbackURL);
	return url.toString();
}
