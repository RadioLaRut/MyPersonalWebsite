export type JsonContentBudget = {
  maxArrayLength: number;
  maxBytes: number;
  maxDepth: number;
  maxObjectKeys: number;
  maxPuckComponents: number;
  maxStringCodePoints: number;
  maxValues: number;
};

export type ContentBudgetProfile = {
  componentLab: {
    maxInstances: number;
  };
  generator: {
    concurrency: number;
  };
  pageDocument: JsonContentBudget;
  requestBytes: {
    componentDesignJson: number;
    fontLabJson: number;
    multipart: number;
    puckJson: number;
  };
  slug: {
    maxNormalizedLength: number;
    maxSegmentLength: number;
    maxSegments: number;
  };
  storage: {
    pageBytes: number;
    pageCount: number;
    puckImageBytes: number;
    puckImageFiles: number;
  };
  version: 1;
};

export const CONTENT_BUDGET_PROFILE_V1: ContentBudgetProfile = Object.freeze({
  componentLab: Object.freeze({
    maxInstances: 1_000,
  }),
  generator: Object.freeze({
    concurrency: 8,
  }),
  pageDocument: Object.freeze({
    maxArrayLength: 256,
    maxBytes: 512 * 1024,
    maxDepth: 32,
    maxObjectKeys: 128,
    maxPuckComponents: 256,
    maxStringCodePoints: 32_768,
    maxValues: 4_096,
  }),
  requestBytes: Object.freeze({
    componentDesignJson: 128 * 1024,
    fontLabJson: 128 * 1024,
    multipart: 11 * 1024 * 1024,
    puckJson: 512 * 1024,
  }),
  slug: Object.freeze({
    maxNormalizedLength: 256,
    maxSegmentLength: 64,
    maxSegments: 8,
  }),
  storage: Object.freeze({
    pageBytes: 50 * 1024 * 1024,
    pageCount: 500,
    puckImageBytes: 2 * 1024 * 1024 * 1024,
    puckImageFiles: 1_000,
  }),
  version: 1,
});

export type JsonContentMetrics = {
  bytes: number;
  depth: number;
  maxArrayLength: number;
  maxObjectKeys: number;
  maxStringCodePoints: number;
  puckComponents: number;
  values: number;
};

export class ContentBudgetExceededError extends Error {
  readonly code = "CONTENT_BUDGET_EXCEEDED";
  readonly status = 422;

  constructor(message: string) {
    super(message);
    this.name = "ContentBudgetExceededError";
  }
}

export class ContentQuotaExceededError extends Error {
  readonly code = "CONTENT_QUOTA_EXCEEDED";
  readonly status = 507;

  constructor(message: string) {
    super(message);
    this.name = "ContentQuotaExceededError";
  }
}

export function assertAggregateContentQuota(
  usage: {
    bytes: number;
    files: number;
    replacedBytes?: number;
    replacesExisting?: boolean;
  },
  nextFileBytes: number,
  quota: {
    maxBytes: number;
    maxFiles: number;
  },
) {
  const nextFiles = usage.files + (usage.replacesExisting ? 0 : 1);
  const nextBytes = usage.bytes - (usage.replacedBytes ?? 0) + nextFileBytes;
  if (nextFiles > quota.maxFiles) {
    throw new ContentQuotaExceededError(
      `Content file count exceeds ${quota.maxFiles}`,
    );
  }
  if (nextBytes > quota.maxBytes) {
    throw new ContentQuotaExceededError(
      `Content storage exceeds ${quota.maxBytes} bytes`,
    );
  }
  return { bytes: nextBytes, files: nextFiles };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function countCodePoints(value: string, limit: number) {
  let count = 0;
  const iterator = value[Symbol.iterator]();
  while (!iterator.next().done) {
    count += 1;
    if (count > limit) return count;
  }
  return count;
}

function fail(message: string): never {
  throw new ContentBudgetExceededError(message);
}

export function inspectJsonContent(
  rootValue: unknown,
  budget: JsonContentBudget = CONTENT_BUDGET_PROFILE_V1.pageDocument,
): JsonContentMetrics {
  const metrics: JsonContentMetrics = {
    bytes: 0,
    depth: 0,
    maxArrayLength: 0,
    maxObjectKeys: 0,
    maxStringCodePoints: 0,
    puckComponents: 0,
    values: 0,
  };
  const seenContainers = new WeakSet<object>();
  const stack: Array<{ depth: number; value: unknown }> = [
    { depth: 1, value: rootValue },
  ];
  let rawStringBytes = 0;

  while (stack.length > 0) {
    const entry = stack.pop();
    if (!entry) break;

    metrics.values += 1;
    metrics.depth = Math.max(metrics.depth, entry.depth);
    if (metrics.values > budget.maxValues) {
      fail(`JSON value count exceeds ${budget.maxValues}`);
    }
    if (entry.depth > budget.maxDepth) {
      fail(`JSON depth exceeds ${budget.maxDepth}`);
    }

    const value = entry.value;
    if (value === null || typeof value === "boolean") continue;
    if (typeof value === "number") {
      if (!Number.isFinite(value)) fail("JSON numbers must be finite");
      continue;
    }
    if (typeof value === "string") {
      const codePoints = countCodePoints(value, budget.maxStringCodePoints);
      metrics.maxStringCodePoints = Math.max(metrics.maxStringCodePoints, codePoints);
      if (codePoints > budget.maxStringCodePoints) {
        fail(`JSON string length exceeds ${budget.maxStringCodePoints} code points`);
      }
      rawStringBytes += new TextEncoder().encode(value).byteLength;
      if (rawStringBytes > budget.maxBytes) {
        fail(`JSON UTF-8 size exceeds ${budget.maxBytes} bytes`);
      }
      continue;
    }
    if (typeof value !== "object" || value === undefined) {
      fail("Value is not JSON-serializable");
    }

    if (seenContainers.has(value)) {
      fail("JSON value must not contain cycles");
    }
    seenContainers.add(value);

    if (Array.isArray(value)) {
      metrics.maxArrayLength = Math.max(metrics.maxArrayLength, value.length);
      if (value.length > budget.maxArrayLength) {
        fail(`JSON array length exceeds ${budget.maxArrayLength}`);
      }
      for (let index = value.length - 1; index >= 0; index -= 1) {
        stack.push({ depth: entry.depth + 1, value: value[index] });
      }
      continue;
    }

    if (!isRecord(value)) {
      fail("Value is not a JSON object");
    }
    const keys = Object.keys(value);
    metrics.maxObjectKeys = Math.max(metrics.maxObjectKeys, keys.length);
    if (keys.length > budget.maxObjectKeys) {
      fail(`JSON object key count exceeds ${budget.maxObjectKeys}`);
    }
    for (const key of keys) {
      const codePoints = countCodePoints(key, budget.maxStringCodePoints);
      metrics.maxStringCodePoints = Math.max(metrics.maxStringCodePoints, codePoints);
      if (codePoints > budget.maxStringCodePoints) {
        fail(`JSON string length exceeds ${budget.maxStringCodePoints} code points`);
      }
      rawStringBytes += new TextEncoder().encode(key).byteLength;
      if (rawStringBytes > budget.maxBytes) {
        fail(`JSON UTF-8 size exceeds ${budget.maxBytes} bytes`);
      }
    }
    if (typeof value.type === "string" && isRecord(value.props)) {
      metrics.puckComponents += 1;
      if (metrics.puckComponents > budget.maxPuckComponents) {
        fail(`Puck component count exceeds ${budget.maxPuckComponents}`);
      }
    }
    for (let index = keys.length - 1; index >= 0; index -= 1) {
      stack.push({ depth: entry.depth + 1, value: value[keys[index]] });
    }
  }

  let serialized: string;
  try {
    serialized = JSON.stringify(rootValue);
  } catch {
    fail("Value is not JSON-serializable");
  }
  if (serialized === undefined) {
    fail("Value is not JSON-serializable");
  }
  metrics.bytes = new TextEncoder().encode(serialized).byteLength;
  if (metrics.bytes > budget.maxBytes) {
    fail(`JSON UTF-8 size exceeds ${budget.maxBytes} bytes`);
  }

  return metrics;
}

export function assertPageDocumentBudget(value: unknown): JsonContentMetrics {
  return inspectJsonContent(value, CONTENT_BUDGET_PROFILE_V1.pageDocument);
}
