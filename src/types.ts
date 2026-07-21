import type { z } from "zod";

export type Awaitable<T> = T | Promise<T>;
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type VerificationResult =
  | { status: "verified"; evidence?: unknown }
  | { status: "pending"; reason?: string; evidence?: unknown }
  | { status: "failed"; reason: string; evidence?: unknown };

export interface ActionDefinition<S extends z.ZodTypeAny = z.ZodTypeAny, E = unknown> {
  name: string;
  description?: string;
  input: S;
  execute: (input: z.infer<S>) => Awaitable<E>;
  verify: (input: z.infer<S>, execution: E) => Awaitable<VerificationResult>;
  idempotencyKey?: (input: z.infer<S>) => string;
  metadata?: Record<string, unknown>;
}

export interface ActionReceipt {
  id: string;
  action: { name: string; description?: string; metadata?: JsonValue; idempotencyKey?: string };
  status: "verified" | "pending" | "failed";
  startedAt: string;
  completedAt: string;
  attempts: number;
  input: JsonValue;
  execution?: { output?: JsonValue; error?: string; completedAt: string };
  verification?: { status: "verified" | "pending" | "failed"; checkedAt: string };
  evidence?: JsonValue;
  reason?: string;
}

export interface ReceiptStore {
  save(receipt: ActionReceipt): Promise<void>;
  get(id: string): Promise<ActionReceipt | undefined>;
  getByIdempotencyKey?(actionName: string, idempotencyKey: string): Promise<ActionReceipt | undefined>;
  list(): Promise<ActionReceipt[]>;
}

export interface ActaroHooks {
  executionStarted?: (context: { action: string; input: unknown }) => Awaitable<void>;
  executionFinished?: (context: {
    action: string;
    output?: unknown;
    error?: Error;
  }) => Awaitable<void>;
  verificationAttempt?: (context: { action: string; attempt: number }) => Awaitable<void>;
  receiptCreated?: (receipt: ActionReceipt) => Awaitable<void>;
}

export interface RedactionOptions {
  fields: Array<string | RegExp>;
  replacement?: string;
}

export interface ActaroOptions {
  store?: ReceiptStore;
  verification?: { retries?: number; delayMs?: number; timeoutMs?: number };
  redaction?: RedactionOptions;
  hooks?: ActaroHooks;
}

export interface RunOptions {
  retries?: number;
  delayMs?: number;
  timeoutMs?: number;
}
