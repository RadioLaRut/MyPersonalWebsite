declare global {
  var __portfolioContentWriteQueue: Promise<void> | undefined;
}

export async function withContentWriteQueue<T>(task: () => Promise<T>): Promise<T> {
  const previous = globalThis.__portfolioContentWriteQueue ?? Promise.resolve();
  const result = previous.catch(() => undefined).then(task);
  globalThis.__portfolioContentWriteQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}
