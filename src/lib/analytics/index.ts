// Analytics Public API
// Privacy-first learning telemetry for Whiskers

import {
  AnalyticsEvent,
  UserRole,
  DeviceType,
  ReferrerCategory,
  SectionId,
  DurationBucket,
} from './events';
import { getSessionId, getTimeSincePageLoad, resetPageLoadTime } from './sessionManager';
import { canTrackEvent, getConsentTier } from './consent';
import { queueEvent, flush, setBatchMutation, setupUnloadHandler } from './batcher';

// Re-export consent functions for easy access
export {
  getConsentState,
  shouldShowConsentBanner,
  acceptAnalytics,
  acceptEssentialOnly,
  declineTracking,
} from './consent';

// Re-export types
export type { UserRole, SectionId, ConsentTier } from './events';

// Internal state
let initialized = false;
let currentRole: UserRole | null = null;
let lastSectionViewed: SectionId | null = null;
let maxScrollDepth = 0;

// Detect device type
function detectDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// Detect referrer category
function detectReferrerCategory(): ReferrerCategory {
  if (typeof document === 'undefined') return 'direct';
  
  const referrer = document.referrer;
  if (!referrer) return 'direct';
  
  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();
    
    // Search engines
    if (hostname.includes('google') || hostname.includes('bing') || hostname.includes('duckduckgo') || hostname.includes('yahoo')) {
      return 'search';
    }
    
    // Social media
    if (hostname.includes('facebook') || hostname.includes('twitter') || hostname.includes('linkedin') || hostname.includes('instagram') || hostname.includes('tiktok')) {
      return 'social';
    }
    
    // Same domain = direct
    if (typeof window !== 'undefined' && hostname === window.location.hostname) {
      return 'direct';
    }
    
    return 'referral';
  } catch {
    return 'other';
  }
}

// Bucket viewport width
function bucketViewportWidth(): number {
  if (typeof window === 'undefined') return 1024;
  
  const width = window.innerWidth;
  if (width < 480) return 320;
  if (width < 768) return 480;
  if (width < 1024) return 768;
  if (width < 1440) return 1024;
  return 1440;
}

// Create base event
function createBaseEvent<T extends string>(eventType: T) {
  return {
    eventType,
    sessionId: getSessionId(),
    timestamp: Date.now(),
    clientTimestamp: Date.now(),
  };
}

// Initialize analytics
export function initAnalytics(
  convexMutation: (events: AnalyticsEvent[], consentTier: string) => Promise<void>
): void {
  if (initialized) return;
  
  setBatchMutation(convexMutation);
  setupUnloadHandler();
  
  // Track scroll depth
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      maxScrollDepth = Math.max(maxScrollDepth, Math.min(scrollPercent, 100));
    });
  }
  
  initialized = true;
}

// Track landing page view
export function trackLandingView(): void {
  if (!canTrackEvent('landing_view')) return;
  
  const event: AnalyticsEvent = {
    ...createBaseEvent('landing_view'),
    eventType: 'landing_view',
    payload: {
      referrerCategory: detectReferrerCategory(),
      deviceType: detectDeviceType(),
      viewportWidth: bucketViewportWidth(),
    },
  };
  
  queueEvent(event);
}

// Track role selection
export function trackRoleSelected(role: UserRole): void {
  if (!canTrackEvent('role_selected')) return;
  
  currentRole = role;
  
  const event: AnalyticsEvent = {
    ...createBaseEvent('role_selected'),
    eventType: 'role_selected',
    payload: {
      role,
      timeSincePageLoadMs: getTimeSincePageLoad(),
    },
  };
  
  queueEvent(event);
}

// Track section viewed
export function trackSectionViewed(sectionId: SectionId, durationMs: number): void {
  if (!canTrackEvent('section_viewed')) return;
  
  lastSectionViewed = sectionId;
  
  // Bucket duration
  let durationBucket: DurationBucket;
  if (durationMs < 5000) durationBucket = '<5s';
  else if (durationMs < 15000) durationBucket = '5-15s';
  else if (durationMs < 30000) durationBucket = '15-30s';
  else durationBucket = '30s+';
  
  const event: AnalyticsEvent = {
    ...createBaseEvent('section_viewed'),
    eventType: 'section_viewed',
    payload: {
      sectionId,
      role: currentRole,
      durationBucket,
    },
  };
  
  queueEvent(event);
}

// Track CTA click
export function trackCTAClick(buttonId: string, sectionId: SectionId): void {
  if (!canTrackEvent('cta_clicked')) return;
  
  // Sanitize button ID
  const sanitizedId = buttonId.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 50);
  
  const event: AnalyticsEvent = {
    ...createBaseEvent('cta_clicked'),
    eventType: 'cta_clicked',
    payload: {
      buttonId: sanitizedId,
      sectionId,
      role: currentRole,
    },
  };
  
  queueEvent(event);
}

// Track page view (navigation)
export function trackPageView(route: string, referrerSection?: SectionId): void {
  if (!canTrackEvent('page_view')) return;
  
  // Sanitize route
  const sanitizedRoute = route.split('?')[0].slice(0, 100);
  
  const event: AnalyticsEvent = {
    ...createBaseEvent('page_view'),
    eventType: 'page_view',
    payload: {
      route: sanitizedRoute,
      referrerSection: referrerSection || lastSectionViewed,
    },
  };
  
  queueEvent(event);
  resetPageLoadTime();
}

// Track bounce (call on unload if no conversion)
export function trackBounce(): void {
  if (!canTrackEvent('bounce')) return;
  
  const event: AnalyticsEvent = {
    ...createBaseEvent('bounce'),
    eventType: 'bounce',
    payload: {
      timeOnPageMs: getTimeSincePageLoad(),
      lastSectionViewed,
      role: currentRole,
      scrollDepthPercent: Math.floor(maxScrollDepth / 10) * 10, // Bucket to 10s
    },
  };
  
  queueEvent(event);
}

// Track session start
export function trackSessionStart(): void {
  if (!canTrackEvent('session_start')) return;
  
  const event: AnalyticsEvent = {
    ...createBaseEvent('session_start'),
    eventType: 'session_start',
    payload: {},
  };
  
  queueEvent(event);
}

// Track session end
export function trackSessionEnd(): void {
  if (!canTrackEvent('session_end')) return;
  
  const event: AnalyticsEvent = {
    ...createBaseEvent('session_end'),
    eventType: 'session_end',
    payload: {
      duration: getTimeSincePageLoad(),
    },
  };
  
  queueEvent(event);
}

// Get current role (for components that need it)
export function getCurrentRole(): UserRole | null {
  return currentRole;
}

// Set current role (for hydration)
export function setCurrentRole(role: UserRole | null): void {
  currentRole = role;
}

// Flush events (for testing or forced sync)
export { flush };
