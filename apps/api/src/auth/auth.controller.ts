import { Body, Controller, Get, Headers, HttpCode, Post, Res, UnauthorizedException } from "@nestjs/common";
import type { Response } from "express";
import { z } from "zod";
import { AuthService } from "./auth.service.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(200)
  async login(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    const input = loginSchema.parse(body);
    const result = await this.authService.login(input.email, input.password);
    response.setHeader("Set-Cookie", result.cookie);
    return { adminId: result.adminId };
  }

  @Get("session")
  session(@Headers("cookie") cookieHeader: string | undefined) {
    const session = cookieHeader
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("tom_admin_session="))
      ?.replace("tom_admin_session=", "");

    if (!this.authService.verifySession(session)) {
      throw new UnauthorizedException("Admin session required");
    }

    return { authenticated: true };
  }
}
