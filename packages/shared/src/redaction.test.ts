import { describe, expect, it } from "vitest";
import { redactSecrets } from "./redaction.js";

describe("redaction", () => {
  it("redacts nested sensitive keys", () => {
    expect(
      redactSecrets({
        authorization: "Bearer abc",
        nested: { apiKey: "secret", ok: "visible" },
      }),
    ).toEqual({
      authorization: "[REDACTED]",
      nested: { apiKey: "[REDACTED]", ok: "visible" },
    });
  });
});
