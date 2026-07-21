import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  createActaro,
  defineAction,
  fileStore,
  memoryStore,
  fromMcpTool,
  toAgentResult,
} from "../src/index.js";

const input = z.object({ title: z.string().min(1), secret: z.string().optional() });

describe("Actaro", () => {
  it("executes and verifies an action", async () => {
    const action = defineAction({
      name: "create",
      input,
      execute: ({ title }) => ({ id: "1", title }),
      verify: async (_, output) => ({ status: "verified" as const, evidence: output }),
    });
    const receipt = await createActaro().run(action, { title: "Ship" });
    expect(receipt.status).toBe("verified");
    expect(receipt.evidence).toEqual({ id: "1", title: "Ship" });
    expect(receipt.attempts).toBe(1);
  });

  it("creates a failed receipt when execution fails", async () => {
    const store = memoryStore();
    const action = defineAction({
      name: "fail",
      input,
      execute: () => {
        throw new Error("API unavailable");
      },
      verify: () => ({ status: "verified" as const }),
    });
    const receipt = await createActaro({ store }).run(action, { title: "Ship" });
    expect(receipt).toMatchObject({ status: "failed", reason: "API unavailable", attempts: 0 });
    expect(await store.get(receipt.id)).toEqual(receipt);
  });

  it("retries pending verification", async () => {
    const verify = vi
      .fn()
      .mockResolvedValueOnce({ status: "pending", reason: "Not visible" })
      .mockResolvedValue({ status: "verified", evidence: { found: true } });
    const action = defineAction({ name: "eventual", input, execute: () => undefined, verify });
    const receipt = await createActaro({ verification: { retries: 2, delayMs: 1 } }).run(action, {
      title: "Ship",
    });
    expect(receipt.status).toBe("verified");
    expect(receipt.attempts).toBe(2);
    expect(verify).toHaveBeenCalledTimes(2);
  });

  it("times out slow verification", async () => {
    const action = defineAction({
      name: "slow",
      input,
      execute: () => undefined,
      verify: () => new Promise((resolve) => setTimeout(() => resolve({ status: "verified" }), 50)),
    });
    const receipt = await createActaro({ verification: { timeoutMs: 5 } }).run(action, {
      title: "Ship",
    });
    expect(receipt).toMatchObject({ status: "failed", reason: "Verification timed out after 5ms" });
  });

  it("redacts sensitive fields recursively", async () => {
    const action = defineAction({
      name: "secret",
      input,
      execute: ({ secret }) => ({ nested: { secret } }),
      verify: () => ({ status: "verified" as const, evidence: { token: "abc" } }),
    });
    const receipt = await createActaro({ redaction: { fields: ["secret", /token/i] } }).run(
      action,
      { title: "Ship", secret: "password" },
    );
    expect(receipt.input).toEqual({ title: "Ship", secret: "[REDACTED]" });
    expect(receipt.execution?.output).toEqual({ nested: { secret: "[REDACTED]" } });
    expect(receipt.evidence).toEqual({ token: "[REDACTED]" });
  });

  it("persists and reads JSONL receipts", async () => {
    const directory = await mkdtemp(join(tmpdir(), "actaro-"));
    const path = join(directory, "receipts.jsonl");
    const store = fileStore(path);
    const action = defineAction({
      name: "persist",
      input,
      execute: () => "ok",
      verify: () => ({ status: "verified" as const }),
    });
    const receipt = await createActaro({ store }).run(action, { title: "Ship" });
    expect(await store.get(receipt.id)).toEqual(receipt);
    expect(await store.list()).toEqual([receipt]);
    expect(JSON.parse((await readFile(path, "utf8")).trim())).toEqual(receipt);
  });

  it("deduplicates concurrent executions with the same idempotencyKey", async () => {
    let executeCount = 0;
    const action = defineAction({
      name: "idempotent-action",
      input,
      idempotencyKey: (val) => val.title,
      execute: async () => {
        executeCount++;
        // Simulate an async delay so concurrent calls pile up
        await new Promise((resolve) => setTimeout(resolve, 20));
        return "ok";
      },
      verify: () => ({ status: "verified" as const }),
    });

    const client = createActaro();
    const [receipt1, receipt2, receipt3] = await Promise.all([
      client.run(action, { title: "Ship" }),
      client.run(action, { title: "Ship" }),
      client.run(action, { title: "Ship" }),
    ]);

    // All should be exactly the same receipt
    expect(receipt1.id).toBe(receipt2.id);
    expect(receipt2.id).toBe(receipt3.id);
    // Execute should only have run once
    expect(executeCount).toBe(1);
  });

  it("adapts an MCP tool into an action and enforces verification", async () => {
    let callCount = 0;
    const action = fromMcpTool({
      name: "mcp-test",
      input,
      call: async () => {
        callCount++;
        return { content: [{ type: "text", text: "Fake Success" }] };
      },
      verify: (_, output) => {
        // Enforce real verification
        return { status: "verified" as const, evidence: output };
      },
    });

    const receipt = await createActaro().run(action, { title: "Ship" });
    expect(callCount).toBe(1);
    expect(receipt.status).toBe("verified");
    // The execution output should be the standardized MCP result
    expect(receipt.execution?.output).toEqual({
      content: [{ type: "text", text: "Fake Success" }],
    });
  });

  it("formats receipts for LLM tools via toAgentResult", async () => {
    const action = defineAction({
      name: "agent-tool",
      input,
      execute: () => "ok",
      verify: () => ({ status: "verified" as const, evidence: { id: "123" } }),
    });

    const receipt = await createActaro().run(action, { title: "Ship" });
    const formatted = toAgentResult(receipt);

    expect(formatted.canClaimCompletion).toBe(true);
    expect(formatted.toolResult).toContain("Success! Actaro verified the real-world effect.");
    expect(formatted.toolResult).toContain('"id":"123"');

    const failedAction = defineAction({
      name: "agent-tool-fail",
      input,
      execute: () => {
        throw new Error("API Down");
      },
      verify: () => ({ status: "pending" as const }),
    });

    const failedReceipt = await createActaro().run(failedAction, { title: "Ship" });
    const failedFormatted = toAgentResult(failedReceipt);

    expect(failedFormatted.canClaimCompletion).toBe(false);
    expect(failedFormatted.toolResult).toContain("Actaro Validation Failed!");
    expect(failedFormatted.toolResult).toContain("API Down");
  });
});
