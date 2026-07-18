import { z } from "zod";
import { createActaro, defineAction } from "actaro";

let visible = false;
const action = defineAction({
  name: "eventually-visible",
  input: z.object({ value: z.string() }),
  execute: ({ value }) => {
    setTimeout(() => {
      visible = true;
    }, 100);
    return { value };
  },
  verify: (_, output) =>
    visible
      ? { status: "verified", evidence: output }
      : { status: "pending", reason: "Value is not visible yet" },
});

const client = createActaro({ verification: { retries: 5, delayMs: 50, timeoutMs: 1_000 } });
console.log(await client.run(action, { value: "ready" }));
