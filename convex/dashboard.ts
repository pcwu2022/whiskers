import { query } from "./_generated/server";
import { v } from "convex/values";

// Dashboard password (in production, use environment variable)
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || "whiskers-admin-2026";

// Helper to verify password
function verifyPassword(password: string): boolean {
  return password === DASHBOARD_PASSWORD;
}

// Get raw events for a date range (for computing metrics on the fly)
export const getEventsForDateRange = query({
  args: {
    password: v.string(),
    startDate: v.number(), // Unix timestamp
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    if (!verifyPassword(args.password)) {
      return { error: "Unauthorized", events: [] };
    }

    const events = await ctx.db
      .query("events")
      .withIndex("by_timestamp", (q) =>
        q.gte("timestamp", args.startDate).lte("timestamp", args.endDate)
      )
      .collect();

    return { events };
  },
});

// Get sessions for a date range
export const getSessionsForDateRange = query({
  args: {
    password: v.string(),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    if (!verifyPassword(args.password)) {
      return { error: "Unauthorized", sessions: [] };
    }

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_start_time", (q) =>
        q.gte("startTime", args.startDate).lte("startTime", args.endDate)
      )
      .collect();

    return { sessions };
  },
});

// Get summary counts (lightweight query for dashboard overview)
export const getSummaryCounts = query({
  args: {
    password: v.string(),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    if (!verifyPassword(args.password)) {
      return { error: "Unauthorized" };
    }

    // Get events in range
    const events = await ctx.db
      .query("events")
      .withIndex("by_timestamp", (q) =>
        q.gte("timestamp", args.startDate).lte("timestamp", args.endDate)
      )
      .collect();

    // Get sessions in range
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_start_time", (q) =>
        q.gte("startTime", args.startDate).lte("startTime", args.endDate)
      )
      .collect();

    // Count by event type
    const eventCounts: Record<string, number> = {};
    for (const event of events) {
      eventCounts[event.eventType] = (eventCounts[event.eventType] || 0) + 1;
    }

    // Count roles
    const roleCounts: Record<string, number> = { student: 0, parent: 0, teacher: 0 };
    for (const event of events) {
      if (event.eventType === "role_selected" && event.payload?.role) {
        const role = event.payload.role as string;
        if (role in roleCounts) {
          roleCounts[role]++;
        }
      }
    }

    // Count conversions (reached playground)
    const conversions = sessions.filter((s) => s.reachedPlayground).length;

    // Count bounces
    const bounces = events.filter((e) => e.eventType === "bounce").length;

    // Count unique sessions
    const uniqueSessions = new Set(events.map((e) => e.sessionId)).size;

    return {
      totalEvents: events.length,
      totalSessions: sessions.length,
      uniqueSessions,
      eventCounts,
      roleCounts,
      conversions,
      bounces,
      conversionRate: sessions.length > 0 ? conversions / sessions.length : 0,
      bounceRate: uniqueSessions > 0 ? bounces / uniqueSessions : 0,
    };
  },
});

// Detailed landing page metrics (computed on request)
export const getLandingMetrics = query({
  args: {
    password: v.string(),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    if (!verifyPassword(args.password)) {
      return { error: "Unauthorized" };
    }

    const events = await ctx.db
      .query("events")
      .withIndex("by_timestamp", (q) =>
        q.gte("timestamp", args.startDate).lte("timestamp", args.endDate)
      )
      .collect();

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_start_time", (q) =>
        q.gte("startTime", args.startDate).lte("startTime", args.endDate)
      )
      .collect();

    // Compute metrics
    const landingViews = events.filter((e) => e.eventType === "landing_view");
    const roleSelections = events.filter((e) => e.eventType === "role_selected");
    const sectionViews = events.filter((e) => e.eventType === "section_viewed");
    const ctaClicks = events.filter((e) => e.eventType === "cta_clicked");
    const bounces = events.filter((e) => e.eventType === "bounce");
    const pageViews = events.filter((e) => e.eventType === "page_view");

    // Role distribution
    const roleDistribution: Record<string, number> = { student: 0, parent: 0, teacher: 0 };
    for (const event of roleSelections) {
      const role = event.payload?.role as string;
      if (role in roleDistribution) {
        roleDistribution[role]++;
      }
    }

    // Device distribution
    const deviceDistribution: Record<string, number> = { mobile: 0, tablet: 0, desktop: 0 };
    for (const event of landingViews) {
      const device = event.payload?.deviceType as string;
      if (device in deviceDistribution) {
        deviceDistribution[device]++;
      }
    }

    // Source distribution
    const sourceDistribution: Record<string, number> = { direct: 0, search: 0, social: 0, referral: 0, other: 0 };
    for (const event of landingViews) {
      const source = event.payload?.referrerCategory as string;
      if (source in sourceDistribution) {
        sourceDistribution[source]++;
      }
    }

    // Section engagement
    const sectionEngagement: Record<string, { views: number; byRole: Record<string, number>; durationBuckets: Record<string, number> }> = {};
    for (const event of sectionViews) {
      const sectionId = event.payload?.sectionId as string;
      if (!sectionId) continue;

      if (!sectionEngagement[sectionId]) {
        sectionEngagement[sectionId] = {
          views: 0,
          byRole: { student: 0, parent: 0, teacher: 0, unknown: 0 },
          durationBuckets: { "<5s": 0, "5-15s": 0, "15-30s": 0, "30s+": 0 },
        };
      }

      sectionEngagement[sectionId].views++;

      const role = (event.payload?.role as string) || "unknown";
      if (role in sectionEngagement[sectionId].byRole) {
        sectionEngagement[sectionId].byRole[role]++;
      }

      const duration = event.payload?.durationBucket as string;
      if (duration && duration in sectionEngagement[sectionId].durationBuckets) {
        sectionEngagement[sectionId].durationBuckets[duration]++;
      }
    }

    // CTA performance
    const ctaPerformance: Record<string, { clicks: number; byRole: Record<string, number> }> = {};
    for (const event of ctaClicks) {
      const buttonId = event.payload?.buttonId as string;
      if (!buttonId) continue;

      if (!ctaPerformance[buttonId]) {
        ctaPerformance[buttonId] = { clicks: 0, byRole: { student: 0, parent: 0, teacher: 0, unknown: 0 } };
      }

      ctaPerformance[buttonId].clicks++;

      const role = (event.payload?.role as string) || "unknown";
      if (role in ctaPerformance[buttonId].byRole) {
        ctaPerformance[buttonId].byRole[role]++;
      }
    }

    // Bounce analysis
    const bouncesBySection: Record<string, number> = {};
    let totalBounceTime = 0;
    for (const event of bounces) {
      const section = (event.payload?.lastSectionViewed as string) || "unknown";
      bouncesBySection[section] = (bouncesBySection[section] || 0) + 1;
      totalBounceTime += (event.payload?.timeOnPageMs as number) || 0;
    }

    // Time to role selection
    const roleSelectionTimes: number[] = [];
    for (const event of roleSelections) {
      const time = event.payload?.timeSincePageLoadMs as number;
      if (time && time > 0) {
        roleSelectionTimes.push(time);
      }
    }
    const avgTimeToRoleSelection =
      roleSelectionTimes.length > 0
        ? roleSelectionTimes.reduce((a, b) => a + b, 0) / roleSelectionTimes.length
        : 0;

    // Conversion by role
    const conversionByRole: Record<string, { selected: number; converted: number }> = {
      student: { selected: 0, converted: 0 },
      parent: { selected: 0, converted: 0 },
      teacher: { selected: 0, converted: 0 },
    };

    // Group events by session
    const sessionEvents: Record<string, typeof events> = {};
    for (const event of events) {
      if (!sessionEvents[event.sessionId]) {
        sessionEvents[event.sessionId] = [];
      }
      sessionEvents[event.sessionId].push(event);
    }

    // Analyze each session for conversion
    for (const [sessionId, sessEvents] of Object.entries(sessionEvents)) {
      const roleEvent = sessEvents.find((e) => e.eventType === "role_selected");
      const playgroundEvent = sessEvents.find(
        (e) => e.eventType === "page_view" && (e.payload?.route as string)?.includes("/playground")
      );

      if (roleEvent) {
        const role = roleEvent.payload?.role as string;
        if (role in conversionByRole) {
          conversionByRole[role].selected++;
          if (playgroundEvent) {
            conversionByRole[role].converted++;
          }
        }
      }
    }

    return {
      summary: {
        totalVisitors: landingViews.length,
        roleSelectionRate: landingViews.length > 0 ? roleSelections.length / landingViews.length : 0,
        avgTimeToRoleSelectionMs: avgTimeToRoleSelection,
        bounceRate: landingViews.length > 0 ? bounces.length / landingViews.length : 0,
        avgBounceTimeMs: bounces.length > 0 ? totalBounceTime / bounces.length : 0,
        overallConversionRate:
          landingViews.length > 0
            ? pageViews.filter((e) => (e.payload?.route as string)?.includes("/playground")).length /
              landingViews.length
            : 0,
      },
      roleDistribution,
      deviceDistribution,
      sourceDistribution,
      sectionEngagement,
      ctaPerformance,
      bouncesBySection,
      conversionByRole,
      totalSessions: sessions.length,
    };
  },
});

// Get recent events (for live view)
export const getRecentEvents = query({
  args: {
    password: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!verifyPassword(args.password)) {
      return { error: "Unauthorized", events: [] };
    }

    const limit = args.limit || 50;

    const events = await ctx.db
      .query("events")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);

    return { events };
  },
});
