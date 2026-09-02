export interface IdempotencyStore {
  has(key: string): Promise<boolean>;
  set(key: string): Promise<void>;
}

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly keys = new Set<string>();

  async has(key: string): Promise<boolean> {
    return this.keys.has(key);
  }

  async set(key: string): Promise<void> {
    this.keys.add(key);
  }
}

export async function runOnce<T>(
  store: IdempotencyStore,
  key: string,
  action: () => Promise<T>,
): Promise<{ executed: true; result: T } | { executed: false; result: undefined }> {
  if (await store.has(key)) {
    return { executed: false, result: undefined };
  }

  const result = await action();
  await store.set(key);
  return { executed: true, result };
}
