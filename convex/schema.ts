import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Raw event log - TTL managed by scheduled cleanup
  events: defineTable({
    eventType: v.string(),
    sessionId: v.string(),
    timestamp: v.number(),
    clientTimestamp: v.number(),
    payload: v.any(), // Flexible payload per event type
  })
    .index("by_session", ["sessionId"])
    .index("by_type", ["eventType"])
    .index("by_timestamp", ["timestamp"]),

  // Session metadata
  sessions: defineTable({
    sessionId: v.string(),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    deviceType: v.string(),
    referrerCategory: v.string(),
    role: v.optional(v.string()),
    reachedPlayground: v.boolean(),
    consentTier: v.string(), // 'essential' | 'analytics'
  })
    .index("by_session_id", ["sessionId"])
    .index("by_start_time", ["startTime"]),

  // Daily aggregated metrics (computed, never raw PII)
  dailyMetrics: defineTable({
    date: v.string(), // YYYY-MM-DD
    metricType: v.string(), // 'landing' | 'playground'
    data: v.any(), // Aggregated metrics object
  })
    .index("by_date", ["date"])
    .index("by_type_date", ["metricType", "date"]),
});
