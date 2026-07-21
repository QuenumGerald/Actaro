import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { ActionReceipt, ReceiptStore } from "./types.js";

export function memoryStore(): ReceiptStore {
  const receipts = new Map<string, ActionReceipt>();
  return {
    async save(receipt) {
      receipts.set(receipt.id, structuredClone(receipt));
    },
    async get(id) {
      const value = receipts.get(id);
      return value && structuredClone(value);
    },
    async getByIdempotencyKey(actionName, idempotencyKey) {
      const value = [...receipts.values()]
        .reverse()
        .find((r) => r.action.name === actionName && r.action.idempotencyKey === idempotencyKey);
      return value && structuredClone(value);
    },
    async list() {
      return [...receipts.values()].map((item) => structuredClone(item));
    },
  };
}

export function fileStore(path: string): ReceiptStore {
  const readAll = async (): Promise<ActionReceipt[]> => {
    try {
      const data = await readFile(path, "utf8");
      return data
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as ActionReceipt);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  };
  return {
    async save(receipt) {
      await mkdir(dirname(path), { recursive: true });
      await appendFile(path, `${JSON.stringify(receipt)}\n`, "utf8");
    },
    async get(id) {
      return (await readAll()).reverse().find((receipt) => receipt.id === id);
    },
    async getByIdempotencyKey(actionName, idempotencyKey) {
      return (await readAll())
        .reverse()
        .find(
          (receipt) =>
            receipt.action.name === actionName && receipt.action.idempotencyKey === idempotencyKey,
        );
    },
    async list() {
      return readAll();
    },
  };
}
