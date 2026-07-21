import type { JsonValue, RedactionOptions } from "./types.js";

function jsonSafe(value: unknown, seen = new WeakSet()): JsonValue {
  if (value === undefined) return null;
  if (value === null) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (typeof value === "function" || typeof value === "symbol") {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    if (seen.has(value)) {
      return "[Circular]";
    }
    seen.add(value);

    if (value instanceof Map) {
      const obj: Record<string, JsonValue> = {};
      for (const [k, v] of value.entries()) {
        if (typeof k === "string") {
          obj[k] = jsonSafe(v, seen);
        } else {
          // If map has non-string keys, we just stringify the key
          obj[String(k)] = jsonSafe(v, seen);
        }
      }
      return obj;
    }

    if (value instanceof Set) {
      const arr: JsonValue[] = [];
      for (const v of value) {
        arr.push(jsonSafe(v, seen));
      }
      return arr;
    }

    if (Array.isArray(value)) {
      return value.map((v) => jsonSafe(v, seen));
    }

    const obj: Record<string, JsonValue> = {};
    for (const [k, v] of Object.entries(value)) {
      obj[k] = jsonSafe(v, seen);
    }
    return obj;
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
