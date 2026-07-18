import { fileStore } from "./stores.js";

const [command, path, id] = process.argv.slice(2);
if (!command || !path || !["list", "get"].includes(command)) {
  console.error("Usage: actaro list <receipts.jsonl> | actaro get <receipts.jsonl> <id>");
  process.exitCode = 1;
} else {
  const store = fileStore(path);
  const result = command === "list" ? await store.list() : id ? await store.get(id) : undefined;
  if (command === "get" && !id) {
    console.error("Receipt id is required.");
    process.exitCode = 1;
  } else if (result === undefined) {
    console.error("Receipt not found.");
    process.exitCode = 1;
  } else console.log(JSON.stringify(result, null, 2));
}
