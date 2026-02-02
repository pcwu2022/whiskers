// Analytics Event Types
// Privacy-first: No PII, no keystrokes, no raw text

export type UserRole = 'student' | 'parent' | 'teacher';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type ReferrerCategory = 'direct' | 'search' | 'social' | 'referral' | 'other';
export type ConsentTier = 'essential' | 'analytics';

export type SectionId = 
  | 'hero' 
  | 'role-selection' 
  | 'demo' 
  | 'why' 
  | 'how' 
  | 'who' 
  | 'whats-next' 
  | 'footer';

export type DurationBucket = '<5s' | '5-15s' | '15-30s' | '30s+';

// Base event interface
export interface AnalyticsEventBase {
  eventType: string;
  sessionId: string;
  timestamp: number;
  clientTimestamp: number;
}

// Landing page view
export interface LandingViewEvent extends AnalyticsEventBase {
  eventType: 'landing_view';
  payload: {
    referrerCategory: ReferrerCategory;
    deviceType: DeviceType;
    viewportWidth: number;
  };
}

// Role selected
export interface RoleSelectedEvent extends AnalyticsEventBase {
  eventType: 'role_selected';
  payload: {
    role: UserRole;
    timeSincePageLoadMs: number;
  };
}

// Section viewed (with time spent)
export interface SectionViewedEvent extends AnalyticsEventBase {
  eventType: 'section_viewed';
  payload: {
    sectionId: SectionId;
    role: UserRole | null;
    durationBucket: DurationBucket;
  };
}

// CTA clicked
export interface CTAClickedEvent extends AnalyticsEventBase {
  eventType: 'cta_clicked';
  payload: {
    buttonId: string;
    sectionId: SectionId;
    role: UserRole | null;
  };
}

// Bounce (user leaves without converting)
export interface BounceEvent extends AnalyticsEventBase {
  eventType: 'bounce';
  payload: {
    timeOnPageMs: number;
    lastSectionViewed: SectionId | null;
    role: UserRole | null;
    scrollDepthPercent: number;
  };
}

// Page view (navigation)
export interface PageViewEvent extends AnalyticsEventBase {
  eventType: 'page_view';
  payload: {
    route: string;
    referrerSection: SectionId | null;
  };
}

// Session start
export interface SessionStartEvent extends AnalyticsEventBase {
  eventType: 'session_start';
  payload: Record<string, never>;
}

// Session end
export interface SessionEndEvent extends AnalyticsEventBase {
  eventType: 'session_end';
  payload: {
    duration: number;
  };
}

// Union type for all events
export type AnalyticsEvent =
  | LandingViewEvent
  | RoleSelectedEvent
  | SectionViewedEvent
  | CTAClickedEvent
  | BounceEvent
  | PageViewEvent
  | SessionStartEvent
  | SessionEndEvent;

// Event type guard helpers
export function isLandingViewEvent(event: AnalyticsEvent): event is LandingViewEvent {
  return event.eventType === 'landing_view';
}

export function isRoleSelectedEvent(event: AnalyticsEvent): event is RoleSelectedEvent {
  return event.eventType === 'role_selected';
}

export function isSectionViewedEvent(event: AnalyticsEvent): event is SectionViewedEvent {
  return event.eventType === 'section_viewed';
}

export function isCTAClickedEvent(event: AnalyticsEvent): event is CTAClickedEvent {
  return event.eventType === 'cta_clicked';
}
