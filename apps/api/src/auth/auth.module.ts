import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthHooksService } from "./auth-hooks.service";
import { OAuthStartController } from "./oauth-start.controller";

@Module({
	controllers: [AuthController, OAuthStartController],
	providers: [AuthService, AuthHooksService],
	exports: [AuthService],
})
export class AuthModule {}
