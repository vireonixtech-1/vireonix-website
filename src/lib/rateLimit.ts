// In-memory sliding-window limiter. Vercel keeps a serverless function's module
// state warm between nearby invocations on the same instance, so this throttles
// bursts from repeat visitors in practice — but it resets on cold starts and isn't
// shared across concurrent instances, so it's a best-effort spam deterrent, not a
// hard guarantee.
export class SlidingWindowLimiter {
  private hits = new Map<string, number[]>();

  constructor(private readonly limit: number, private readonly windowMs: number) {}

  check(key: string): { allowed: boolean; retryAfterSeconds: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const timestamps = (this.hits.get(key) ?? []).filter((t) => t > windowStart);

    if (timestamps.length >= this.limit) {
      const retryAfterSeconds = Math.ceil((timestamps[0] + this.windowMs - now) / 1000);
      this.hits.set(key, timestamps);
      return { allowed: false, retryAfterSeconds };
    }

    timestamps.push(now);
    this.hits.set(key, timestamps);
    this.sweep(now);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  // Bound memory growth: occasionally drop keys with no recent activity.
  private sweep(now: number) {
    if (this.hits.size < 1000 || Math.random() > 0.01) return;
    const windowStart = now - this.windowMs;
    for (const [key, timestamps] of this.hits) {
      if (!timestamps.some((t) => t > windowStart)) this.hits.delete(key);
    }
  }
}
