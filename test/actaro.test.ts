import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createActaro, defineAction, fileStore, memoryStore } from "../src/index.js";

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
});
