import { OpenAI } from "openai";
import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { z } from "zod";
import { createActaro, defineAction, toAgentResult } from "../src/index.js";

// --- 1. Fake Environments ---
const db = new Map<string, { id: string; content: string; status: string }>();
const mailInbox = new Set<string>(); // Used to check if an email was actually delivered

// --- 2. Define Actaro Actions (Different Situations) ---

// Situation A: Eventual Consistency (The original note creation)
const createNoteAction = defineAction({
  name: "create-note",
  description: "Creates a new note in the database and returns its ID.",
  input: z.object({
    id: z.string().describe("A unique identifier for the note (e.g. note-1)"),
    content: z.string().describe("The content of the note"),
  }),
  execute: async ({ id, content }) => {
    console.log(`[Tool Execution] Saving note ${id} to database...`);
    setTimeout(() => {
      db.set(id, { id, content, status: "saved" });
      console.log(`\n[Database] Note ${id} successfully written to disk.`);
    }, 2000);
    return { status: "accepted", message: `Note ${id} creation accepted.` };
  },
  verify: async ({ id }) => {
    const note = db.get(id);
    if (note) {
      return {
        status: "verified",
        evidence: { found: true, actualContent: note.content },
      };
    }
    console.log(
      `[Actaro Verify] Note ${id} not found yet. Returning 'pending' to trigger a retry...`,
    );
    return { status: "pending", reason: "Note not found in the database yet." };
  },
});

// Situation B: Fail Silently (API lies)
const sendEmailAction = defineAction({
  name: "send-email",
  description: "Sends an email to a user.",
  input: z.object({
    to: z.string().email().describe("The recipient email address"),
    subject: z.string().describe("The subject of the email"),
  }),
  execute: async ({ to }) => {
    console.log(`[Tool Execution] Sending email to ${to} via SMTP API...`);
    // API Returns success, but we simulate a silent network drop / spam filter
    return { status: "success", apiResponse: "250 OK: Message accepted for delivery" };
  },
  verify: async ({ to }) => {
    console.log(`[Actaro Verify] Checking ${to}'s inbox for the email...`);
    if (mailInbox.has(to)) {
      return { status: "verified", evidence: { delivered: true } };
    }
    return { status: "pending", reason: "Email not yet found in the recipient's inbox." };
  },
});

// Situation C: Permission Denied during Verification
const createAdminAction = defineAction({
  name: "create-admin",
  description: "Promotes a user to administrator status.",
  input: z.object({
    userId: z.string().describe("The user ID to promote"),
  }),
  execute: async ({ userId }) => {
    console.log(`[Tool Execution] Promoting user ${userId} to admin...`);
    return { status: "success", message: `User ${userId} is now admin.` };
  },
  verify: async () => {
    console.log(`[Actaro Verify] Attempting to read admin ACLs...`);
    throw new Error("HTTP 403 Forbidden: Missing 'read:acl' scope to verify admin status.");
  },
});

// Situation D: Sensitive Data Redaction
const resetPasswordAction = defineAction({
  name: "reset-password",
  description: "Resets the password for a user and returns a temporary password.",
  input: z.object({
    email: z.string().email(),
    newPassword: z.string(),
  }),
  execute: async ({ email, newPassword }) => {
    console.log(`[Tool Execution] Updating password for ${email}...`);
    return { status: "success", tempPasswordProvided: newPassword };
  },
  verify: async ({ email }) => {
    console.log(`[Actaro Verify] Verifying login endpoint with new credentials...`);
    return { status: "verified", evidence: { loginSuccessfulFor: email } };
  },
});

// Situation E: Immediate Execution Error
const triggerBackupAction = defineAction({
  name: "trigger-backup",
  description: "Triggers a database backup. (Demonstrates immediate execution failure)",
  input: z.object({
    databaseId: z.string(),
  }),
  execute: async ({ databaseId }) => {
    console.log(`[Tool Execution] Initiating backup for ${databaseId}...`);
    throw new Error("HTTP 500 Internal Server Error: Storage full.");
  },
  verify: async () => {
    return { status: "pending", reason: "Should not be reached." };
  },
});

// Situation F: Timeout during verification
const provisionServerAction = defineAction({
  name: "provision-server",
  description: "Provisions a new server. (Demonstrates verification timeout)",
  input: z.object({
    hostname: z.string(),
  }),
  execute: async ({ hostname }) => {
    console.log(`[Tool Execution] Sending provision request for ${hostname}...`);
    return { status: "accepted", ticketId: "REQ-999" };
  },
  verify: async ({ hostname }) => {
    console.log(`[Actaro Verify] Server ${hostname} is still booting...`);
    // Will always return pending, causing Actaro to exhaust retries and fail
    return { status: "pending", reason: "Server is still not responsive." };
  },
});

// Situation G: Idempotency
const processPaymentAction = defineAction({
  name: "process-payment",
  description: "Processes a payment for an order. (Demonstrates idempotency)",
  input: z.object({
    orderId: z.string(),
    amount: z.number(),
  }),
  // Actaro will use this key to prevent double execution if called again with the same input
  idempotencyKey: (input) => `payment-${input.orderId}`,
  execute: async ({ orderId, amount }) => {
    console.log(`[Tool Execution] Charging $${amount} for order ${orderId}...`);
    return { status: "success", transactionId: `TXN-${Math.floor(Math.random() * 10000)}` };
  },
  verify: async ({ orderId }) => {
    console.log(`[Actaro Verify] Confirming transaction in accounting ledger...`);
    return { status: "verified", evidence: { orderPaid: orderId } };
  },
});

const actionsMap: Record<string, any> = {
  [createNoteAction.name]: createNoteAction,
  [sendEmailAction.name]: sendEmailAction,
  [createAdminAction.name]: createAdminAction,
  [resetPasswordAction.name]: resetPasswordAction,
  [triggerBackupAction.name]: triggerBackupAction,
  [provisionServerAction.name]: provisionServerAction,
  [processPaymentAction.name]: processPaymentAction,
};

// Map actions to OpenAI tools dynamically
const tools: any[] = [
  createNoteAction,
  sendEmailAction,
  createAdminAction,
  resetPasswordAction,
  triggerBackupAction,
  provisionServerAction,
  processPaymentAction,
].map((action) => ({
  type: "function",
  function: {
    name: action.name,
    description: action.description || "",
    parameters: {
      type: "object",
      properties: {},
    },
  },
}));

// Manually setup schemas
tools[0].function.parameters = {
  type: "object",
  properties: {
    id: { type: "string" },
    content: { type: "string" },
  },
  required: ["id", "content"],
};
tools[1].function.parameters = {
  type: "object",
  properties: {
    to: { type: "string" },
    subject: { type: "string" },
  },
  required: ["to", "subject"],
};
tools[2].function.parameters = {
  type: "object",
  properties: { userId: { type: "string" } },
  required: ["userId"],
};
tools[3].function.parameters = {
  type: "object",
  properties: {
    email: { type: "string" },
    newPassword: { type: "string" },
  },
  required: ["email", "newPassword"],
};
tools[4].function.parameters = {
  type: "object",
  properties: { databaseId: { type: "string" } },
  required: ["databaseId"],
};
tools[5].function.parameters = {
  type: "object",
  properties: { hostname: { type: "string" } },
  required: ["hostname"],
};
tools[6].function.parameters = {
  type: "object",
  properties: {
    orderId: { type: "string" },
    amount: { type: "number" },
  },
  required: ["orderId", "amount"],
};

// --- 3. Chatbot implementation using DeepSeek API ---
async function main() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error("Error: DEEPSEEK_API_KEY environment variable is not set.");
    console.log("Run with: DEEPSEEK_API_KEY=your_key tsx examples/chatbot.ts");
    process.exit(1);
  }

  // Initialize OpenAI client pointing to DeepSeek
  const client = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: apiKey,
  });

  const rl = readline.createInterface({ input, output });

  // Define a custom actaro instance for the redaction demo and fast retries
  const customActaro = createActaro({
    verification: { retries: 3, delayMs: 1000 },
    redaction: {
      fields: ["newPassword", "tempPasswordProvided", /password/i], // Redact these fields from all receipts!
    },
  });

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are a helpful assistant testing the Actaro verification SDK.
You have 7 tools available to demonstrate different situations:
1. 'create-note': Creates a note (Eventual Consistency).
2. 'send-email': Sends an email (Fail Silently API).
3. 'create-admin': Promotes an admin (Permission error during verification).
4. 'reset-password': Resets a password (Data redaction in receipts).
5. 'trigger-backup': Triggers a backup (Immediate execution crash).
6. 'provision-server': Provisions a server (Timeout - verification never succeeds).
7. 'process-payment': Processes a payment (Idempotency - try calling this twice with the same orderId to see what happens!).

Always inform the user of the final Actaro verification result after using a tool.`,
    },
  ];

  console.log("=== Actaro + DeepSeek Comprehensive Demo ===");
  console.log("You can try the following scenarios:");
  console.log("- 'Create a note about Actaro' (Eventual consistency)");
  console.log("- 'Send an email to john@example.com' (Fail silently API)");
  console.log("- 'Make user 123 an admin' (Permission denied in verify)");
  console.log("- 'Reset password for alice@example.com to supersecret123' (Data redaction)");
  console.log("- 'Trigger backup for db-1' (Execution error)");
  console.log("- 'Provision server web-01' (Timeout error)");
  console.log("- 'Process payment for order 99' (Idempotency - ask to do it twice!)");
  console.log("Type 'exit' or 'quit' to stop.\n");

  while (true) {
    const userInput = await rl.question("\nYou: ");

    if (userInput.toLowerCase() === "exit" || userInput.toLowerCase() === "quit") {
      break;
    }

    messages.push({ role: "user", content: userInput });

    try {
      console.log("AI is thinking...");
      const response = await client.chat.completions.create({
        model: "deepseek-chat",
        messages: messages,
        tools: tools,
        temperature: 0.1,
      });

      const responseMessage = response.choices[0]!.message;
      messages.push(responseMessage);

      // Handle tool calls
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        for (const toolCall of responseMessage.tool_calls) {
          const actionToRun = actionsMap[(toolCall as any).function.name];

          if (actionToRun) {
            const args = JSON.parse((toolCall as any).function.arguments);
            console.log(
              `\n🤖 AI wants to call: ${(toolCall as any).function.name}(${JSON.stringify(args)})`,
            );

            console.log(`\n🛡️  Actaro intercepts the tool call to verify its effect...`);

            // Run the action through Actaro to get the verification receipt
            const receipt = await customActaro.run(actionToRun, args);

            console.log(`\n🧾 Actaro Final Receipt (safe to store):`);
            console.log(
              JSON.stringify(
                {
                  id: receipt.id,
                  action: receipt.action.name,
                  status: receipt.status,
                  sanitizedInput: receipt.input, // Observe the redaction here!
                  executionOutput: receipt.execution?.output, // Observe the redaction here!
                  executionError: receipt.execution?.error,
                  verificationStatus: receipt.verification?.status,
                  verificationEvidence: receipt.evidence,
                  verificationReason: receipt.reason,
                  attempts: receipt.attempts,
                },
                null,
                2,
              ),
            );

            // Inform the AI about the result of the tool call including Actaro's verification
            const { toolResult } = toAgentResult(receipt);

            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: toolResult,
            });
          } else {
            console.log(
              `\n⚠️ AI tried to call an unknown tool: ${(toolCall as any).function.name}`,
            );
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: "Error: Tool not found.",
            });
          }
        }

        // Get the final AI response after all tool executions are complete
        const finalResponse = await client.chat.completions.create({
          model: "deepseek-chat",
          messages: messages,
        });

        const finalContent = finalResponse.choices[0]!.message.content;
        console.log(`\nAI: ${finalContent}`);
        messages.push(finalResponse.choices[0]!.message);
      } else {
        // Just a normal text response
        console.log(`AI: ${responseMessage.content}`);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  rl.close();
}

main().catch(console.error);
