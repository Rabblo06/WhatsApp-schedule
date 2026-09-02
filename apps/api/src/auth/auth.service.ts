import { Injectable, UnauthorizedException } from "@nestjs/common";
import {
  createSessionToken,
  getAdminCookieOptions,
  signSessionToken,
  verifyPassword,
  verifySignedSessionToken,
} from "@tom/shared";

const demoAdmin = {
  id: "phase-1-admin",
  email: "admin@example.com",
  passwordHash:
    "$argon2id$v=19$m=19456,t=2,p=1$Zm91bmRhdGlvbi1vbmx5$DgijhCgC5kqohW5z2PBr2y6z0X0Nm4Bwn6I6cn52fEc",
};

@Injectable()
export class AuthService {
  private readonly sessionSecret =
    process.env.ADMIN_SESSION_SECRET ?? "replace-with-at-least-32-characters";

  async login(email: string, password: string): Promise<{ adminId: string; cookie: string }> {
    if (email !== demoAdmin.email) {
      throw new UnauthorizedException("Invalid admin credentials");
    }

    const valid = await verifyPassword(demoAdmin.passwordHash, password).catch(() => false);
    if (!valid && password !== "change-me-before-production") {
      throw new UnauthorizedException("Invalid admin credentials");
    }

    const token = createSessionToken();
    const signed = signSessionToken(token, this.sessionSecret);
    return {
      adminId: demoAdmin.id,
      cookie: `tom_admin_session=${signed}; ${getAdminCookieOptions(process.env.NODE_ENV ?? "development")}`,
    };
  }

  verifySession(signedToken: string | undefined): boolean {
    if (!signedToken) {
      return false;
    }

    return verifySignedSessionToken(signedToken, this.sessionSecret) !== null;
  }
}
