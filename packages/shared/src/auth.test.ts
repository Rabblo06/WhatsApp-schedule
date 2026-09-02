import { describe, expect, it } from "vitest";
import {
  createSessionToken,
  getAdminCookieOptions,
  signSessionToken,
  verifySignedSessionToken,
} from "./auth.js";

describe("auth primitives", () => {
  it("signs and verifies session tokens", () => {
    const secret = "12345678901234567890123456789012";
    const token = createSessionToken();
    const signed = signSessionToken(token, secret);

    expect(verifySignedSessionToken(signed, secret)).toBe(token);
    expect(verifySignedSessionToken(`${signed}tampered`, secret)).toBeNull();
  });

  it("uses secure cookies in production", () => {
    expect(getAdminCookieOptions("production")).toContain("Secure");
    expect(getAdminCookieOptions("development")).not.toContain("Secure");
    expect(getAdminCookieOptions("production")).toContain("HttpOnly");
  });
});
