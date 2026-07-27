export type ComponentLabHistoryEntry<Value> = {
  after: Value;
  before: Value;
};

export type ComponentLabHistoryState<Value> = {
  future: ComponentLabHistoryEntry<Value>[];
  past: ComponentLabHistoryEntry<Value>[];
};

export function createComponentLabHistory<Value>(): ComponentLabHistoryState<Value> {
  return {
    future: [],
    past: [],
  };
}

export function pushComponentLabHistory<Value>({
  after,
  before,
  history,
  isEqual,
  limit = 100,
}: {
  after: Value;
  before: Value;
  history: ComponentLabHistoryState<Value>;
  isEqual: (left: Value, right: Value) => boolean;
  limit?: number;
}): ComponentLabHistoryState<Value> {
  if (isEqual(before, after)) return history;
  return {
    future: [],
    past: [...history.past, { after, before }].slice(-limit),
  };
}

export function undoComponentLabHistory<Value>(
  history: ComponentLabHistoryState<Value>,
): {
  history: ComponentLabHistoryState<Value>;
  value: Value | null;
} {
  const entry = history.past.at(-1);
  if (!entry) return { history, value: null };
  return {
    history: {
      future: [entry, ...history.future],
      past: history.past.slice(0, -1),
    },
    value: entry.before,
  };
}

export function redoComponentLabHistory<Value>(
  history: ComponentLabHistoryState<Value>,
): {
  history: ComponentLabHistoryState<Value>;
  value: Value | null;
} {
  const [entry, ...remaining] = history.future;
  if (!entry) return { history, value: null };
  return {
    history: {
      future: remaining,
      past: [...history.past, entry],
    },
    value: entry.after,
  };
}
