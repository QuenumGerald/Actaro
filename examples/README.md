# Actaro Examples

This directory contains practical examples demonstrating how to use the Actaro SDK to verify real-world effects of AI agent actions.

## Overview of Examples

1. **`chatbot.ts`**: A complete, interactive CLI chatbot built with the DeepSeek/OpenAI API. It implements 7 distinct tools to demonstrate various Actaro scenarios (Eventual Consistency, Fail Silently, Timeout, Idempotency, Redaction, Permission Denied, and Execution Crash).
2. **`eventual-consistency.ts`**: A minimal, self-contained example demonstrating how Actaro's retry mechanism gracefully handles an asynchronous task that takes time to become visible.
3. **`local-mcp-style.ts`**: Demonstrates how to use `fromMcpTool()` to wrap an existing Model Context Protocol (MCP) tool, adding a verification step to it.
4. **`memory-task.ts`**: The most basic Actaro setup, defining a simple action and verifying a change in a local memory object.

## Running the Examples

Actaro requires Node.js >= 20. The easiest way to run TypeScript files directly is using `tsx`. We recommend running the examples from the root of the repository.

```bash
# First, ensure dependencies are installed
npm install

# Run the chatbot example (requires an API key)
DEEPSEEK_API_KEY="your_api_key" npx tsx examples/chatbot.ts

# Run other minimal examples
npx tsx examples/eventual-consistency.ts
npx tsx examples/local-mcp-style.ts
```

## The Chatbot Scenarios (`chatbot.ts`)

The interactive chatbot is the most comprehensive example. It exposes 7 tools to the AI, each simulating a different edge case in AI execution. Try asking the AI to perform the following actions:

- **Eventual Consistency** (`create-note`): _Ask "Create a note about Actaro"_
  - **What happens:** The execution simulates an API that immediately returns "accepted", but takes 2 seconds to actually save the data. Actaro's `verify` function will initially return "pending", triggering automatic retries until the data appears.
- **Fail Silently API** (`send-email`): _Ask "Send an email to john@example.com"_
  - **What happens:** The execution simulates an API that lies, returning a successful `250 OK`. However, the effect never happens. Actaro's `verify` function checks the inbox, fails to find the email, and eventually marks the receipt as `failed`, allowing the AI to realize the failure.
- **Permission Denied** (`create-admin`): _Ask "Make user 123 an admin"_
  - **What happens:** The execution succeeds, but the `verify` function crashes with an HTTP 403 Forbidden error because it lacks read access. Actaro catches the crash safely and records the verification error in the receipt.
- **Data Redaction** (`reset-password`): _Ask "Reset password for alice@example.com to secret123"_
  - **What happens:** The tool passes sensitive information (a password). Because Actaro is initialized with `redaction: { fields: [/password/i] }`, the final generated receipt automatically scrubs the password from both the `input` and `executionResult` before it is saved or printed.
- **Execution Crash** (`trigger-backup`): _Ask "Trigger backup for db-1"_
  - **What happens:** The `execute` function crashes immediately (e.g., HTTP 500 Storage Full). Actaro catches the error, marks the execution as failed, and skips the verification step entirely.
- **Timeout** (`provision-server`): _Ask "Provision server web-01"_
  - **What happens:** The execution succeeds, but the `verify` function continuously returns "pending" (simulating a server taking forever to boot). After the maximum number of retries is reached, Actaro marks the action as failed due to timeout.
- **Idempotency** (`process-payment`): _Ask "Process payment for order 99", then ask it to "Do it again"_
  - **What happens:** The action defines an `idempotencyKey` based on the order ID. The first time, the payment executes. If the AI hallucinates or tries to blindly retry the exact same order, Actaro intercepts it and prevents the execution, immediately returning the previous verification result.
