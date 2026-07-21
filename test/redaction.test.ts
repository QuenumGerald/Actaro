import { describe, expect, it } from "vitest";
import { redact } from "../src/redaction.js";

describe("redaction", () => {
  it("handles robust serialization", () => {
    const obj: any = { a: 1, set: new Set([1, 2]), map: new Map([["key", "value"]]), bigint: 123n };
    obj.circular = obj; // circular

    const result = redact(obj) as any;
    expect(result.a).toBe(1);
    expect(result.set).toEqual([1, 2]);
    expect(result.map).toEqual({ key: "value" });
    expect(result.bigint).toBe("123");
    expect(result.circular).toBe("[Circular]");
  });

  it("handles errors", () => {
    const error = new Error("Test error");
    const result = redact(error) as any;
    expect(result.name).toBe("Error");
    expect(result.message).toBe("Test error");
    expect(result.stack).toBeDefined();
  });
});
