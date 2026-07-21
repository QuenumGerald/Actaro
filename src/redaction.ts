import type { JsonValue, RedactionOptions } from "./types.js";

function jsonSafe(value: unknown, seen = new WeakSet()): JsonValue {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "function" || typeof value === "symbol") return null;

  if (typeof value === "object") {
    if (seen.has(value as object)) return "[Circular]";
    seen.add(value as object);

    let result: JsonValue = null;
    if (typeof (value as any).toJSON === "function") {
      result = jsonSafe((value as any).toJSON(), seen);
    } else if (value instanceof Error) {
      result = jsonSafe({ name: value.name, message: value.message, stack: value.stack }, seen);
    } else if (value instanceof Map) {
      result = jsonSafe(Object.fromEntries(value.entries()), seen);
    } else if (value instanceof Set) {
      result = jsonSafe(Array.from(value), seen);
    } else if (Array.isArray(value)) {
      result = value.map((v) => jsonSafe(v, seen));
    } else if (value instanceof Date) {
      result = value.toISOString();
    } else {
      const obj: { [key: string]: JsonValue } = {};
      for (const [k, v] of Object.entries(value)) {
        if (v === undefined || typeof v === "function" || typeof v === "symbol") continue;
        obj[k] = jsonSafe(v, seen);
      }
      result = obj;
    }

    seen.delete(value as object);
    return result;
  }
  return null;
}

export function redact(value: unknown, options?: RedactionOptions): JsonValue {
  const safe = jsonSafe(value);
  if (!options) return safe;
  const replacement = options.replacement ?? "[REDACTED]";
  const matches = (key: string): boolean =>
    options.fields.some((field) => (typeof field === "string" ? field === key : field.test(key)));
  const visit = (item: JsonValue): JsonValue => {
    if (Array.isArray(item)) return item.map(visit);
    if (item !== null && typeof item === "object") {
      return Object.fromEntries(
        Object.entries(item).map(([key, child]) => [
          key,
          matches(key) ? replacement : visit(child),
        ]),
      );
    }
    return item;
  };
  return visit(safe);
}
