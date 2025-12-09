// Type declarations for dynamic imports
declare module "../services/syncService" {
  export function startSync(): Promise<void>;
  export function retryItem(itemId: string): Promise<void>;
  export function startAutoRetry(): void;
  export function stopAutoRetry(): void;
}
