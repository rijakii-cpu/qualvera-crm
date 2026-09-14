import { z } from "zod";
import { MAILBOX_PROVIDER_IDS } from "./scopes";

const returnUrl = z.string().trim().url();

export const socialOAuthStartQuery = z.object({
	provider: z.enum(MAILBOX_PROVIDER_IDS),
	callbackURL: returnUrl,
	errorCallbackURL: returnUrl,
});

export type SocialOAuthStartQuery = z.infer<typeof socialOAuthStartQuery>;

export const ssoOAuthStartQuery = z.object({
	providerId: z.string().trim().min(1).max(120),
	callbackURL: returnUrl,
	errorCallbackURL: returnUrl,
});

export type SsoOAuthStartQuery = z.infer<typeof ssoOAuthStartQuery>;

export const oauthStartRedirect = z.object({
	url: z.string().trim().min(1),
});
