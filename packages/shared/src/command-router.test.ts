import { describe, expect, it } from "vitest";
import { parseTomCommand, shouldInvokeAi } from "./command-router.js";

describe("command router", () => {
  it("does not invoke AI for ordinary messages", () => {
    expect(parseTomCommand("hello").kind).toBe("ORDINARY");
    expect(shouldInvokeAi("hello")).toBe(false);
  });

  it("invokes AI for slash tom messages", () => {
    expect(parseTomCommand("/tom hello")).toEqual({ kind: "TOM", prompt: "hello" });
    expect(shouldInvokeAi("/tom hello")).toBe(true);
  });

  it("invokes AI for natural Tom messages", () => {
    expect(parseTomCommand("Tom ennada ithu?")).toEqual({
      kind: "TOM",
      prompt: "ennada ithu?",
    });
    expect(shouldInvokeAi("Tom hello")).toBe(true);
  });

  it("routes store separately from AI", () => {
    expect(parseTomCommand("/store").kind).toBe("STORE");
    expect(shouldInvokeAi("/store")).toBe(false);
  });

  it("routes groups as a private control command without invoking AI", () => {
    expect(parseTomCommand("/groups")).toEqual({ kind: "GROUPS", prompt: "all" });
    expect(parseTomCommand("/groups active")).toEqual({ kind: "GROUPS", prompt: "active" });
    expect(shouldInvokeAi("/groups")).toBe(false);
  });

  it("routes group numeric selection without accepting arbitrary group IDs", () => {
    expect(parseTomCommand("/group 2")).toEqual({ kind: "GROUP_SELECT", prompt: "2" });
    expect(parseTomCommand("/group clabc123")).toEqual({
      kind: "ORDINARY",
      prompt: "/group clabc123",
    });
  });
});
