import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Allowed event types (whitelist for security)
const ALLOWED_EVENT_TYPES = [
  "landing_view",
  "role_selected",
  "section_viewed",
  "cta_clicked",
  "bounce",
  "page_view",
  "session_start",
  "session_end",
] as const;

// Allowed section IDs
const ALLOWED_SECTIONS = [
  "hero",
  "role-selection",
  "demo",
  "why",
  "how",
  "who",
  "whats-next",
  "footer",
] as const;

// Allowed roles
const ALLOWED_ROLES = ["student", "parent", "teacher"] as const;

// Validate and sanitize payload
function sanitizePayload(eventType: string, payload: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  // Only allow predefined fields per event type
  switch (eventType) {
    case "landing_view":
      if (["direct", "search", "social", "referral", "other"].includes(payload.referrerCategory as string)) {
        sanitized.referrerCategory = payload.referrerCategory;
      }
      if (["mobile", "tablet", "desktop"].includes(payload.deviceType as string)) {
        sanitized.deviceType = payload.deviceType;
      }
      if (typeof payload.viewportWidth === "number") {
        // Bucket viewport widths
        const vw = payload.viewportWidth as number;
        sanitized.viewportWidth = vw < 480 ? 320 : vw < 768 ? 480 : vw < 1024 ? 768 : vw < 1440 ? 1024 : 1440;
      }
      break;

    case "role_selected":
      if (ALLOWED_ROLES.includes(payload.role as typeof ALLOWED_ROLES[number])) {
        sanitized.role = payload.role;
      }
      if (typeof payload.timeSincePageLoadMs === "number") {
        sanitized.timeSincePageLoadMs = Math.min(payload.timeSincePageLoadMs as number, 300000); // Cap at 5 min
      }
      break;

    case "section_viewed":
      if (ALLOWED_SECTIONS.includes(payload.sectionId as typeof ALLOWED_SECTIONS[number])) {
        sanitized.sectionId = payload.sectionId;
      }
      if (payload.role === null || ALLOWED_ROLES.includes(payload.role as typeof ALLOWED_ROLES[number])) {
        sanitized.role = payload.role;
      }
      if (["<5s", "5-15s", "15-30s", "30s+"].includes(payload.durationBucket as string)) {
        sanitized.durationBucket = payload.durationBucket;
      }
      break;

    case "cta_clicked":
      // Only allow alphanumeric button IDs with dashes
      if (typeof payload.buttonId === "string" && /^[a-z0-9-]+$/.test(payload.buttonId) && payload.buttonId.length <= 50) {
        sanitized.buttonId = payload.buttonId;
      }
      if (ALLOWED_SECTIONS.includes(payload.sectionId as typeof ALLOWED_SECTIONS[number])) {
        sanitized.sectionId = payload.sectionId;
      }
      if (payload.role === null || ALLOWED_ROLES.includes(payload.role as typeof ALLOWED_ROLES[number])) {
        sanitized.role = payload.role;
      }
      break;

    case "bounce":
      if (typeof payload.timeOnPageMs === "number") {
        sanitized.timeOnPageMs = Math.min(payload.timeOnPageMs as number, 3600000); // Cap at 1 hour
      }
      if (payload.lastSectionViewed === null || ALLOWED_SECTIONS.includes(payload.lastSectionViewed as typeof ALLOWED_SECTIONS[number])) {
        sanitized.lastSectionViewed = payload.lastSectionViewed;
      }
      if (payload.role === null || ALLOWED_ROLES.includes(payload.role as typeof ALLOWED_ROLES[number])) {
        sanitized.role = payload.role;
      }
      if (typeof payload.scrollDepthPercent === "number") {
        // Bucket to 10s
        sanitized.scrollDepthPercent = Math.floor((payload.scrollDepthPercent as number) / 10) * 10;
      }
      break;

    case "page_view":
      if (typeof payload.route === "string" && payload.route.startsWith("/") && payload.route.length <= 100) {
        sanitized.route = payload.route;
      }
      if (payload.referrerSection === null || ALLOWED_SECTIONS.includes(payload.referrerSection as typeof ALLOWED_SECTIONS[number])) {
        sanitized.referrerSection = payload.referrerSection;
      }
      break;

    case "session_start":
    case "session_end":
      if (typeof payload.duration === "number") {
        sanitized.duration = payload.duration;
      }
      break;
  }

  return sanitized;
}

// Ingest a single event
export const ingestEvent = mutation({
  args: {
    eventType: v.string(),
    sessionId: v.string(),
    timestamp: v.number(),
    clientTimestamp: v.number(),
    payload: v.any(),
    consentTier: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate consent
    if (args.consentTier !== "analytics" && args.consentTier !== "essential") {
      return { success: false, error: "Invalid consent tier" };
    }

    // For essential consent, only allow session events
    if (args.consentTier === "essential" && !["session_start", "session_end", "page_view"].includes(args.eventType)) {
      return { success: false, error: "Event not allowed under essential consent" };
    }

    // Validate event type
    if (!ALLOWED_EVENT_TYPES.includes(args.eventType as typeof ALLOWED_EVENT_TYPES[number])) {
      return { success: false, error: "Invalid event type" };
    }

    // Validate session ID format (UUID-like)
    if (!/^[a-f0-9-]{36}$/.test(args.sessionId)) {
      return { success: false, error: "Invalid session ID" };
    }

    // Sanitize payload
    const sanitizedPayload = sanitizePayload(args.eventType, args.payload || {});

    // Insert event
    await ctx.db.insert("events", {
      eventType: args.eventType,
      sessionId: args.sessionId,
      timestamp: args.timestamp,
      clientTimestamp: args.clientTimestamp,
      payload: sanitizedPayload,
    });

    return { success: true };
  },
});

// Ingest batch of events (more efficient)
export const ingestBatch = mutation({
  args: {
    events: v.array(
      v.object({
        eventType: v.string(),
        sessionId: v.string(),
        timestamp: v.number(),
        clientTimestamp: v.number(),
        payload: v.any(),
      })
    ),
    consentTier: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate consent
    if (args.consentTier !== "analytics" && args.consentTier !== "essential") {
      return { success: false, error: "Invalid consent tier", inserted: 0 };
    }

    // Limit batch size
    if (args.events.length > 20) {
      return { success: false, error: "Batch too large (max 20)", inserted: 0 };
    }

    let inserted = 0;

    for (const event of args.events) {
      // For essential consent, only allow session events
      if (args.consentTier === "essential" && !["session_start", "session_end", "page_view"].includes(event.eventType)) {
        continue;
      }

      // Validate event type
      if (!ALLOWED_EVENT_TYPES.includes(event.eventType as typeof ALLOWED_EVENT_TYPES[number])) {
        continue;
      }

      // Validate session ID
      if (!/^[a-f0-9-]{36}$/.test(event.sessionId)) {
        continue;
      }

      // Sanitize and insert
      const sanitizedPayload = sanitizePayload(event.eventType, event.payload || {});

      await ctx.db.insert("events", {
        eventType: event.eventType,
        sessionId: event.sessionId,
        timestamp: event.timestamp,
        clientTimestamp: event.clientTimestamp,
        payload: sanitizedPayload,
      });

      inserted++;
    }

    return { success: true, inserted };
  },
});

// Create or update session
export const upsertSession = mutation({
  args: {
    sessionId: v.string(),
    deviceType: v.string(),
    referrerCategory: v.string(),
    consentTier: v.string(),
    role: v.optional(v.string()),
    reachedPlayground: v.optional(v.boolean()),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Validate session ID
    if (!/^[a-f0-9-]{36}$/.test(args.sessionId)) {
      return { success: false, error: "Invalid session ID" };
    }

    // Check if session exists
    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existing) {
      // Update existing session
      await ctx.db.patch(existing._id, {
        ...(args.role && ALLOWED_ROLES.includes(args.role as typeof ALLOWED_ROLES[number]) ? { role: args.role } : {}),
        ...(args.reachedPlayground !== undefined ? { reachedPlayground: args.reachedPlayground } : {}),
        ...(args.endTime ? { endTime: args.endTime } : {}),
      });
    } else {
      // Create new session
      await ctx.db.insert("sessions", {
        sessionId: args.sessionId,
        startTime: Date.now(),
        deviceType: ["mobile", "tablet", "desktop"].includes(args.deviceType) ? args.deviceType : "desktop",
        referrerCategory: ["direct", "search", "social", "referral", "other"].includes(args.referrerCategory)
          ? args.referrerCategory
          : "other",
        role: args.role && ALLOWED_ROLES.includes(args.role as typeof ALLOWED_ROLES[number]) ? args.role : undefined,
        reachedPlayground: args.reachedPlayground ?? false,
        consentTier: ["essential", "analytics"].includes(args.consentTier) ? args.consentTier : "essential",
      });
    }

    return { success: true };
  },
});
