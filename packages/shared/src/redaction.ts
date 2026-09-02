const sensitiveKeyPattern = /(authorization|cookie|password|token|api[_-]?key|secret|session)/i;

export function redactSecrets<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => redactSecrets(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        sensitiveKeyPattern.test(key) ? "[REDACTED]" : redactSecrets(entry),
      ]),
    ) as T;
  }

  return value;
}
