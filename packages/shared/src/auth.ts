import { randomBytes, timingSafeEqual, createHmac } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";

export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verifyPassword(hashValue: string, password: string): Promise<boolean> {
  return verify(hashValue, password);
}

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function signSessionToken(token: string, secret: string): string {
  const signature = createHmac("sha256", secret).update(token).digest("base64url");
  return `${token}.${signature}`;
}

export function verifySignedSessionToken(signedToken: string, secret: string): string | null {
  const [token, signature] = signedToken.split(".");
  if (!token || !signature) {
    return null;
  }

  const expected = createHmac("sha256", secret).update(token).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length) {
    return null;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer) ? token : null;
}

export function getAdminCookieOptions(nodeEnv: string): string {
  const secure = nodeEnv === "production" ? "; Secure" : "";
  return `HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${secure}`;
}
