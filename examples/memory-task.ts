import { z } from "zod";
import { actaro, defineAction } from "../src/index.js";

const tasks: Array<{ id: string; title: string }> = [];
const action = defineAction({
  name: "create-task",
  description: "Create an in-memory task",
  input: z.object({ title: z.string().min(1) }),
  execute: ({ title }: { title: string }) => {
    const task = { id: crypto.randomUUID(), title };
    tasks.push(task);
    return task;
  },
  verify: ({ title }: { title: string }) => {
    const task = tasks.find((item) => item.title === title);
    return task
      ? { status: "verified", evidence: task }
      : { status: "pending", reason: "Task not found" };
  },
});

console.log(await actaro.run(action, { title: "Publish release notes" }));
