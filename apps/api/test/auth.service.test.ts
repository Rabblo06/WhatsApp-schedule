import { describe, expect, it } from "vitest";
import { AuthService } from "../src/auth/auth.service.js";

describe("AuthService", () => {
  it("rejects missing session cookies", () => {
    const service = new AuthService();
    expect(service.verifySession(undefined)).toBe(false);
  });
});
