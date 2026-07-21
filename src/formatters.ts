import type { ActionReceipt } from "./types.js";

export function toAgentResult(receipt: ActionReceipt): { toolResult: string; canClaimCompletion: boolean } {
  let toolResultMessage = "";

  if (receipt.status === "verified") {
    toolResultMessage = `Success! Actaro verified the real-world effect.`;
    if (receipt.evidence !== undefined) {
      toolResultMessage += ` Evidence: ${JSON.stringify(receipt.evidence)}`;
    }
  } else {
    toolResultMessage = `Actaro Validation Failed! Status: ${receipt.status}.`;
    if (receipt.reason) {
      toolResultMessage += ` Reason: ${receipt.reason}.`;
    }
    if (receipt.execution?.error) {
      toolResultMessage += ` Error: ${receipt.execution.error}`;
    }
  }

  return {
    toolResult: toolResultMessage.trim(),
    canClaimCompletion: receipt.status === "verified",
  };
}
