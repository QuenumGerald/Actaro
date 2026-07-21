import { z } from "zod";
import { createActaro, defineAction } from "../src/index.js";

let visible = false;
const action = defineAction({
  name: "eventually-visible",
  input: z.object({ value: z.string() }),
  execute: ({ value }: { value: string }) => {
    setTimeout(() => {
      visible = true;
    }, 100);
    return { value };
  },
  verify: (_: { value: string }, output: any) =>
    visible
      ? { status: "verified", evidence: output }
      : { status: "pending", reason: "Value is not visible yet" },
});

const client = createActaro({ verification: { retries: 5, delayMs: 50, timeoutMs: 1_000 } });
console.log(await client.run(action, { value: "ready" }));
