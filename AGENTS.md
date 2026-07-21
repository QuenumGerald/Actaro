# Actaro Guide for AI Agents

Welcome to the Actaro codebase. Actaro is a TypeScript SDK designed to verify the real-world effects of AI agent tool calls.

## Core Concepts

1. **Independent Verification**: Tools often lie or fail silently. Actaro runs the tool (`execute`), then independently checks if the expected state change occurred (`verify`).
2. **ActionReceipt**: Every run returns a standardized receipt detailing inputs, execution results, and crucially, the verification status and evidence.
3. **Idempotency**: Runs can specify an `idempotencyKey` to prevent concurrent duplication and allow returning the previously persisted receipt.
4. **toAgentResult**: When returning a result back to an AI Agent context (like an LLM), use `toAgentResult(receipt)` to get a structured message and completion flag.

## Working with the SDK

- Always return the `message` from `toAgentResult(receipt)` back to the LLM agent instead of the raw `execute` result.
- The `canClaimCompletion` flag indicates whether the task was actually successful (`receipt.status === "verified"`).
- If `receipt.status` is `pending`, the SDK retried multiple times but could not verify the state (e.g., eventual consistency taking too long, or permission errors).
- If `receipt.status` is `failed`, either execution or verification threw an error.

## Example Integration

```typescript
import { createActaro, toAgentResult } from "actaro";

const actaro = createActaro();
const receipt = await actaro.run(action, input);
const result = toAgentResult(receipt);

// Return result.message to the AI chat model
```
