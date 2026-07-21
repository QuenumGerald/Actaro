# Actaro Agent Guidelines

Actaro is an SDK that enforces real-world verification of AI agent actions. When working with this codebase:

1. **Receipts & Deduplication**: Actaro stores `ActionReceipt`s and manages concurrent promise deduplication through `idempotencyKey` and `Store`. When modifying the `core.ts` runner, be careful to preserve idempotency semantics.
2. **Serialization**: Action inputs and verification evidences are serialized using a safe stringify clone. `BigInt`, `Map`, `Set`, and Circular references are handled gracefully. Keep `redaction.ts` up-to-date if you introduce new types.
3. **Agent Integration**: Expose tool completions using `toAgentResult()`. This guarantees standardized feedback loops (with `toolResult` and `canClaimCompletion`) across any LLM wrapper.
4. **Types**: Ensure proper schema typing with `zod`. Use `npx tsc --noEmit` or `npm run typecheck` to verify your changes locally before committing.
