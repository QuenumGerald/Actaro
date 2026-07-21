import { describe, expect, it } from "vitest";
import { createActaro, defineAction } from "../src/core.js";
import { z } from "zod";

describe("idempotency", () => {
  it("prevents multiple concurrent runs and uses persisted receipts", async () => {
    const actaro = createActaro();
    let executions = 0;

    const action = defineAction({
      name: "test-idempotency",
      input: z.object({ id: z.string() }),
      idempotencyKey: (input) => `test-${input.id}`,
      execute: async () => {
        executions++;
        await new Promise((r) => setTimeout(r, 50));
        return { ok: true };
      },
      verify: () => ({ status: "verified" }),
    });

    const promise1 = actaro.run(action, { id: "1" });
    const promise2 = actaro.run(action, { id: "1" });

    const [r1, r2] = await Promise.all([promise1, promise2]);

    expect(executions).toBe(1);
    expect(r1.id).toBe(r2.id);

    // Call again, should use persisted receipt
    const r3 = await actaro.run(action, { id: "1" });
    expect(executions).toBe(1);
    expect(r3.id).toBe(r1.id);
  });
});
