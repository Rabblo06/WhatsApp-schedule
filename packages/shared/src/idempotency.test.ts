import { describe, expect, it } from "vitest";
import { InMemoryIdempotencyStore, runOnce } from "./idempotency.js";

describe("idempotency", () => {
  it("executes a side effect once for the same key", async () => {
    const store = new InMemoryIdempotencyStore();
    let count = 0;

    const action = async () => {
      count += 1;
      return count;
    };

    expect(await runOnce(store, "whatsapp:event:1", action)).toEqual({
      executed: true,
      result: 1,
    });
    expect(await runOnce(store, "whatsapp:event:1", action)).toEqual({
      executed: false,
      result: undefined,
    });
    expect(count).toBe(1);
  });
});
