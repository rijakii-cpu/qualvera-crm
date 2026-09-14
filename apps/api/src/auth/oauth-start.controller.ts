import {
	issueSocialOAuthStart,
	issueSsoOAuthStart,
	OAuthStartError,
	socialOAuthStartQuery,
	ssoOAuthStartQuery,
} from "@crm/auth";
import {
	BadRequestException,
	Controller,
	Get,
	Logger,
	Req,
	Res,
} from "@nestjs/common";
import { ApiFoundResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { fromNodeHeaders } from "better-auth/node";
import type { Request, Response } from "express";

@ApiTags("Auth")
@Controller("oauth")
export class OAuthStartController {
	private readonly logger = new Logger(OAuthStartController.name);

	@Get("social/start")
	@AllowAnonymous()
	@ApiOperation({
		summary: "Start Google or Microsoft sign-in as a first-party redirect",
	})
	@ApiFoundResponse({
		description:
			"Redirects to the provider after setting the OAuth state cookie.",
	})
	async startSocial(
		@Req() request: Request,
		@Res() response: Response,
	): Promise<void> {
		const parsed = socialOAuthStartQuery.safeParse(request.query);
		if (!parsed.success) {
			throw new BadRequestException(
				"Sign-in is missing a provider or a return URL.",
			);
		}

		await this.redirect(
			() =>
				issueSocialOAuthStart(parsed.data, fromNodeHeaders(request.headers)),
			response,
		);
	}

	@Get("sso/start")
	@AllowAnonymous()
	@ApiOperation({
		summary: "Start SSO sign-in as a first-party redirect",
	})
	@ApiFoundResponse({
		description:
			"Redirects to the identity provider after setting the OAuth state cookie.",
	})
	async startSso(
		@Req() request: Request,
		@Res() response: Response,
	): Promise<void> {
		const parsed = ssoOAuthStartQuery.safeParse(request.query);
		if (!parsed.success) {
			throw new BadRequestException(
				"Sign-in is missing a provider or a return URL.",
			);
		}

		await this.redirect(
			() => issueSsoOAuthStart(parsed.data, fromNodeHeaders(request.headers)),
			response,
		);
	}

	private async redirect(
		start: () => Promise<{ url: string; cookies: string[] }>,
		response: Response,
	): Promise<void> {
		try {
			const result = await start();
			for (const cookie of result.cookies) {
				response.append("Set-Cookie", cookie);
			}
			response.redirect(302, result.url);
		} catch (error) {
			if (response.headersSent) throw error;

			this.logger.error(
				{ message: "OAuth start failed" },
				error instanceof Error ? error.stack : undefined,
			);

			if (error instanceof OAuthStartError) {
				response.status(error.status).json({
					message: "Could not start sign-in.",
				});
				return;
			}

			throw error;
		}
	}
}
