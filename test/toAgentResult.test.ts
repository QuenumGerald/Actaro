import { describe, expect, it } from "vitest";
import { toAgentResult } from "../src/core.js";

describe("toAgentResult", () => {
  it("formats verified results", () => {
    const result = toAgentResult({
      status: "verified",
      evidence: { id: "123" },
    } as any);
    expect(result.canClaimCompletion).toBe(true);
    expect(result.message).toContain("VERIFIED");
    expect(result.message).toContain('{"id":"123"}');
  });

  it("formats failed results", () => {
    const result = toAgentResult({
      status: "failed",
      reason: "Timeout",
      execution: { error: "Network Error" },
    } as any);
    expect(result.canClaimCompletion).toBe(false);
    expect(result.message).toContain("FAILED");
    expect(result.message).toContain("Timeout");
    expect(result.message).toContain("Network Error");
  });
});
