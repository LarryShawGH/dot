/**
 * Storage keys used by the app. Used by Reset Demo Data to clear all client state.
 */
export const DEMO_STORAGE_KEYS = [
  "arch-review-poc:latest-review",
  "arch-review-poc:approvals",
] as const;

/**
 * Clears all demo-related localStorage. Call from client only.
 */
export function clearDemoLocalStorage(): void {
  if (typeof window === "undefined") return;
  for (const key of DEMO_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}
