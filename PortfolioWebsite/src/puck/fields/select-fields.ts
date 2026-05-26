export function castSelectValue<T extends string | number | boolean>(
  value: unknown,
  options: readonly T[],
  fallback: T,
): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

export function coerceLegacyBooleanSelectValue(value: unknown): unknown {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value;
}
