import type { JsonValue, RedactionOptions } from "./types.js";

function jsonSafe(value: unknown): JsonValue {
  if (value === undefined) return null;
  return JSON.parse(JSON.stringify(value)) as JsonValue;
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
