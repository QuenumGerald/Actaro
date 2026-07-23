<p align="center">
  <img src="/logo.png" alt="Actaro Logo" width="160" />
</p>

# Actaro

Actaro is a small TypeScript SDK that verifies whether an AI agent action actually changed real state. It does not trust a tool's success message: it executes the action, reads the state again through a separate `verify` function, and emits a JSON-serializable receipt containing the evidence.

## Installation

```bash
npm install actaro zod
```

Actaro requires Node.js 20 or newer.

## Quick start

```ts
import { actaro, defineAction } from "actaro";
import { z } from "zod";

const action = defineAction({
  name: "create-task",
  input: z.object({ title: z.string().min(1) }),
  execute: ({ title }) => taskApi.create({ title }),
  verify: async ({ title }) => {
    const task = await taskApi.findByTitle(title);
    return task
      ? { status: "verified", evidence: { id: task.id, state: task.state } }
      : { status: "pending", reason: "Task not visible yet" };
  },
});

const receipt = await actaro.run(action, { title: "Publish release notes" });
```

`defineAction` also accepts `description`, `metadata`, and an `idempotencyKey(input)` function. Configure retry and timeout globally with `createActaro({ verification: { retries, delayMs, timeoutMs } })`, or override them for one call through the third argument to `run`. A pending verification is retried; verified and failed results stop immediately. Execution and verification exceptions become failed receipts. Invalid input throws Zod's validation error before execution.

## Receipts and persistence

Every run produces an `ActionReceipt` with its UUID, action information, status, ISO dates, verification-attempt count, sanitized input, execution result, final verification, evidence, and reason. Receipts contain JSON values only.

The default client uses an in-memory store. Use a dedicated client for explicit persistence:

```ts
import { createActaro, fileStore } from "actaro";
const client = createActaro({ store: fileStore("./data/receipts.jsonl") });
```

`ReceiptStore` has asynchronous `save`, `get`, `list`, and `getByIdempotencyKey` methods. `memoryStore()` and append-only JSONL `fileStore(path)` are included. Read persisted receipts with `actaro list ./data/receipts.jsonl` or `actaro get ./data/receipts.jsonl <id>`. Concurrent requests with matching idempotency keys are automatically deduplicated.

## Security and redaction

Receipts may otherwise preserve sensitive input, output, metadata, or evidence. Configure recursive key redaction before storing them:

```ts
createActaro({ redaction: { fields: ["password", "apiKey", /token/i] } });
```

Redaction is a safety aid, not a substitute for minimizing collected data, access controls, retention limits, and encryption. Verification functions should return the smallest useful proof. Hooks (`executionStarted`, `executionFinished`, `verificationAttempt`, and `receiptCreated`) should also avoid logging secrets because they receive live values.

## MCP tools

`fromMcpTool()` adapts a tool call into an action. Its `call` function invokes the MCP-style tool, while its required `verify` function independently reads real state. A textual tool response is never evidence by itself. See `examples/local-mcp-style.ts`.

## Agent Feedback

Format receipts directly for LLM tools using `toAgentResult`:

```ts
import { toAgentResult } from "actaro";

const receipt = await actaro.run(action, input);
const { toolResult, canClaimCompletion } = toAgentResult(receipt);

// Send toolResult back to the LLM (OpenAI, DeepSeek, Anthropic, etc.)
// canClaimCompletion is true only if the action was verified
```

## Actaro versus Temporal

Actaro is a verification SDK: it runs one operation, checks its effect, and records a receipt. Temporal is a durable workflow orchestration platform offering scheduling, recovery, distributed execution, and long-running workflow state. Actaro neither replaces nor embeds a workflow engine; it can be called from a Temporal activity when both durable orchestration and effect verification are needed.

## Development

```bash
npm test
npm run lint
npm run build
```

The `examples/` directory also includes an in-memory task and eventual-consistency retry example. The public API is exported from the package root. See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [CHANGELOG.md](CHANGELOG.md).
