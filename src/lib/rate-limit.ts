import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// General site-wide limiter — generous, just catches obvious bot floods.
export const generalRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "60 s"), // 60 requests / minute / IP
  prefix: "ratelimit:general",
  analytics: true,
});

// Tighter limiter for the admin login route — bots love brute-forcing this.
export const loginRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 attempts / minute / IP
  prefix: "ratelimit:login",
  analytics: true,
});

// Contact form — public-facing, protect against spam floods.
export const contactRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "60 s"), // 3 submissions / minute / IP
  prefix: "ratelimit:contact",
  analytics: true,
});

// Vercel puts the real client IP in this header. Falls back to a generic
// bucket if it's ever missing (e.g. local dev), so rate limiting doesn't
// crash — it just becomes a shared bucket for all local requests.
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}