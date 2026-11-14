interface BucketEntry {
  timestamps: number[];
}

const buckets = new Map<string, BucketEntry>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

export function checkUserRateLimit(uid: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = buckets.get(uid) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);

  if (entry.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = entry.timestamps[0] ?? now;
    const retryAfterSeconds = Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000));
    buckets.set(uid, entry);
    return { allowed: false, retryAfterSeconds };
  }

  entry.timestamps.push(now);
  buckets.set(uid, entry);
  return { allowed: true, retryAfterSeconds: 0 };
}
