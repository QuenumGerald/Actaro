import { z } from "zod";
import { actaro, fromMcpTool } from "actaro";

const records = new Map<string, string>();
const action = fromMcpTool({
  name: "local-record-tool",
  input: z.object({ key: z.string(), value: z.string() }),
  call: ({ key, value }) => {
    records.set(key, value);
    return { content: [{ type: "text", text: "Record created" }] };
  },
  verify: ({ key, value }) =>
    records.get(key) === value
      ? { status: "verified", evidence: { key, storedValue: records.get(key) } }
      : { status: "failed", reason: "Stored value differs" },
});

console.log(await actaro.run(action, { key: "release", value: "0.1.0" }));
