import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const ALLOWED_CATEGORIES = ["bug", "feature", "question", "other"] as const;

// Rate-limit: max messages per session within a time window
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 messages per minute per session

/**
 * Submit feedback / contact message.
 * Includes server-side rate limiting per sessionId.
 */
export const submit = mutation({
  args: {
    sessionId: v.string(),
    category: v.string(),
    message: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate category
    if (!ALLOWED_CATEGORIES.includes(args.category as typeof ALLOWED_CATEGORIES[number])) {
      throw new Error("Invalid category");
    }

    // Validate message length
    const trimmed = args.message.trim();
    if (trimmed.length === 0 || trimmed.length > 5000) {
      throw new Error("Message must be between 1 and 5000 characters");
    }

    // Validate email (if provided)
    if (args.email !== undefined) {
      const email = args.email.trim();
      if (email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Invalid email address");
      }
    }

    // Validate sessionId format
    if (!args.sessionId || args.sessionId.length > 100) {
      throw new Error("Invalid session");
    }

    // Rate limiting: count recent messages from this session
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;
    const recentMessages = await ctx.db
      .query("feedback")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.gte(q.field("timestamp"), windowStart))
      .collect();

    if (recentMessages.length >= RATE_LIMIT_MAX) {
      throw new Error("Too many messages. Please wait a moment before sending another.");
    }

    // Insert the feedback
    await ctx.db.insert("feedback", {
      sessionId: args.sessionId,
      category: args.category,
      message: trimmed,
      email: args.email?.trim() || undefined,
      timestamp: now,
      status: "new",
    });
  },
});

/**
 * Query feedback (for admin dashboard).
 */
export const list = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    let q = ctx.db.query("feedback").order("desc");

    if (args.status) {
      q = ctx.db
        .query("feedback")
        .withIndex("by_status", (qb) => qb.eq("status", args.status!))
        .order("desc");
    }

    return await q.take(limit);
  },
});
