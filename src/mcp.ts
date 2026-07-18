import type { z } from "zod";
import { defineAction } from "./core.js";
import type { ActionDefinition, Awaitable, VerificationResult } from "./types.js";

export interface McpToolAdapter<S extends z.ZodTypeAny, E> {
  name: string;
  description?: string;
  input: S;
  call: (input: z.infer<S>) => Awaitable<E>;
  verify: (input: z.infer<S>, toolResult: E) => Awaitable<VerificationResult>;
  idempotencyKey?: (input: z.infer<S>) => string;
  metadata?: Record<string, unknown>;
}

export function fromMcpTool<S extends z.ZodTypeAny, E>(
  tool: McpToolAdapter<S, E>,
): ActionDefinition<S, E> {
  return defineAction({
    name: tool.name,
    description: tool.description,
    input: tool.input,
    execute: tool.call,
    verify: tool.verify,
    idempotencyKey: tool.idempotencyKey,
    metadata: { source: "mcp", ...tool.metadata },
  });
}
