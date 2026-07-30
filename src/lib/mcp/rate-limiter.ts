// ThinkPost AI — MCP Rate Limiter
// Uses Upstash Redis for rate limiting: 60 calls/min per user per MCP tool.
// FRD Section 6: Rate Limiting.

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { rateLimitedError } from '@/lib/errors/app-error';

let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit {
  if (!ratelimit) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      console.warn('[ThinkPost AI] Upstash Redis not configured — rate limiting disabled');
      // Return a no-op limiter in development
      return {
        limit: async () => ({ success: true, limit: 60, remaining: 59, reset: 0 }),
      } as unknown as Ratelimit;
    }

    ratelimit = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 calls per minute
      analytics: false,
      prefix: 'thinkpost:ratelimit',
    });
  }
  return ratelimit;
}

/**
 * Check rate limit for a user + tool combination.
 * Throws RATE_LIMITED error if exceeded.
 *
 * @param userId - Internal user ID
 * @param toolName - MCP tool name (e.g., 'get_profile')
 */
export async function checkRateLimit(userId: string, toolName: string): Promise<void> {
  const limiter = getRatelimit();
  const key = `${userId}:${toolName}`;

  const { success } = await limiter.limit(key);

  if (!success) {
    throw rateLimitedError();
  }
}
