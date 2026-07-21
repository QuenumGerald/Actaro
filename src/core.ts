import { randomUUID } from "node:crypto";
import type { z } from "zod";
import { redact } from "./redaction.js";
import { memoryStore } from "./stores.js";
import type {
  ActionDefinition,
  ActionReceipt,
  ActaroOptions,
  RunOptions,
  VerificationResult,
} from "./types.js";

export function defineAction<S extends z.ZodTypeAny, E>(
  action: ActionDefinition<S, E>,
): ActionDefinition<S, E> {
  return action;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

export function createActaro(options: ActaroOptions = {}) {
  const store = options.store ?? memoryStore();
  const ongoingExecutions = new Map<string, Promise<ActionReceipt>>();

  return {
    store,
    async run<S extends z.ZodTypeAny, E>(
      action: ActionDefinition<S, E>,
      rawInput: z.input<S>,
      runOptions: RunOptions = {},
    ): Promise<ActionReceipt> {
      const input = action.input.parse(rawInput) as z.infer<S>;
      const idempotencyKey = action.idempotencyKey?.(input);

      const dedupeKey = idempotencyKey ? `${action.name}:${idempotencyKey}` : undefined;

      if (dedupeKey && ongoingExecutions.has(dedupeKey)) {
        return ongoingExecutions.get(dedupeKey)!;
      }

      const runPromise = (async (): Promise<ActionReceipt> => {
        if (dedupeKey && store.getByIdempotencyKey) {
          const existing = await store.getByIdempotencyKey(action.name, idempotencyKey!);
          if (existing) return existing;
        }

        const startedAt = new Date().toISOString();
        const receipt: ActionReceipt = {
          id: randomUUID(),
        action: {
          name: action.name,
          ...(action.description && { description: action.description }),
          ...(action.metadata && { metadata: redact(action.metadata, options.redaction) }),
          ...(action.idempotencyKey && { idempotencyKey: action.idempotencyKey(input) }),
        },
        status: "pending",
        startedAt,
        completedAt: startedAt,
        attempts: 0,
        input: redact(input, options.redaction),
      };
      let output: E;
      try {
        await options.hooks?.executionStarted?.({ action: action.name, input });
        output = await action.execute(input);
        receipt.execution = {
          output: redact(output, options.redaction),
          completedAt: new Date().toISOString(),
        };
        await options.hooks?.executionFinished?.({ action: action.name, output });
      } catch (error) {
        const message = errorMessage(error);
        receipt.status = "failed";
        receipt.reason = message;
        receipt.execution = { error: message, completedAt: new Date().toISOString() };
        await options.hooks?.executionFinished?.({
          action: action.name,
          error: error instanceof Error ? error : new Error(message),
        });
        return finish(receipt);
      }

      const retries = runOptions.retries ?? options.verification?.retries ?? 0;
      const delayMs = runOptions.delayMs ?? options.verification?.delayMs ?? 250;
      const timeoutMs = runOptions.timeoutMs ?? options.verification?.timeoutMs ?? 5_000;
      const deadline = Date.now() + timeoutMs;
      let result: VerificationResult = { status: "pending", reason: "Verification did not run" };
      for (let attempt = 1; attempt <= retries + 1; attempt++) {
        receipt.attempts = attempt;
        if (Date.now() >= deadline) {
          result = { status: "failed", reason: `Verification timed out after ${timeoutMs}ms` };
          break;
        }
        await options.hooks?.verificationAttempt?.({ action: action.name, attempt });
        try {
          result = await withTimeout(
            action.verify(input, output),
            Math.max(1, deadline - Date.now()),
            timeoutMs,
          );
        } catch (error) {
          result = { status: "failed", reason: errorMessage(error) };
        }
        if (result.status !== "pending" || attempt > retries) break;
        const remaining = deadline - Date.now();
        if (remaining <= delayMs) {
          result = { status: "failed", reason: `Verification timed out after ${timeoutMs}ms` };
          break;
        }
        await sleep(delayMs);
      }
      receipt.status = result.status;
      receipt.verification = { status: result.status, checkedAt: new Date().toISOString() };
      if (result.evidence !== undefined)
        receipt.evidence = redact(result.evidence, options.redaction);
      if ("reason" in result && result.reason) receipt.reason = result.reason;
      return finish(receipt);

      async function finish(value: ActionReceipt): Promise<ActionReceipt> {
        value.completedAt = new Date().toISOString();
        await store.save(value);
        await options.hooks?.receiptCreated?.(value);
        return value;
      }
      })();

      if (idempotencyKey) {
        const dedupeKey = `${action.name}:${idempotencyKey}`;
        ongoingExecutions.set(dedupeKey, runPromise);
        runPromise.finally(() => {
          if (ongoingExecutions.get(dedupeKey) === runPromise) {
            ongoingExecutions.delete(dedupeKey);
          }
        });
      }

      return runPromise;
    },
  };
}

async function withTimeout<T>(
  promise: Promise<T> | T,
  ms: number,
  configuredMs: number,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Verification timed out after ${configuredMs}ms`)),
      ms,
    );
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

export const actaro = createActaro();
