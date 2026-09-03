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

// Chat — starting a new conversation. IP-based, so clearing localStorage
// to get a fresh visitor_id doesn't bypass this (unlike the existing
// visitor_id-based ban system in chat/actions.ts, which this complements).
export const chatStartRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"), // 5 new conversations / 10 min / IP
  prefix: "ratelimit:chat-start",
  analytics: true,
});

// Chat — sending messages. A looser IP-based backstop layered on top of
// the existing per-visitor_id DB rate limit/auto-ban.
export const chatMessageRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "60 s"), // 20 messages / minute / IP
  prefix: "ratelimit:chat-message",
  analytics: true,
});

// Enrollment form — public-facing, protect against spam floods.
export const enrollRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "60 s"), // 3 submissions / minute / IP
  prefix: "ratelimit:enroll",
  analytics: true,
});

/**
 * Extracts client IP from headers.
 * 
 * SECURITY NOTE: This function trusts x-forwarded-for and x-real-ip headers.
 * It MUST only be used when the application is deployed behind a trusted
 * proxy (e.g., Vercel, Cloudflare, AWS ALB) that sets these headers and
 * strips any client-supplied values. In Vercel/Next.js, these headers are
 * automatically set by the platform infrastructure.
 * 
 * If deploying elsewhere without a trusted proxy, replace this with a
 * platform-specific IP detection method or use a fixed "unknown" bucket.
 */
export function getClientIp(headers: Headers): string {
  // Vercel sets x-forwarded-for with the original client IP as the first value
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map(ip => ip.trim());
    // Return the first (original client) IP
    return ips[0];
  }

  // Fallback for other proxies that use x-real-ip
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Fallback for local development or misconfigured deployments
  // Using a shared bucket limits DoS impact
  return "unknown";
}

/**
 * Validates that an IP address is a reasonable format (not spoofed).
 * Only use this if you cannot trust your proxy headers.
 */
export function isValidIp(ip: string): boolean {
  if (ip === "unknown") return true; // Allow unknown bucket
  
  // Basic IPv4 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    const parts = ip.split(".").map(Number);
    return parts.every(part => part >= 0 && part <= 255);
  }

  // Basic IPv6 validation (simplified)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  if (ipv6Regex.test(ip)) return true;

  // Compressed IPv6 (::)
  const compressedIpv6Regex = /^([0-9a-fA-F]{1,4}:)*::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/;
  if (compressedIpv6Regex.test(ip)) return true;

  return false;
}