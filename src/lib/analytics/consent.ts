// Consent Management
// Privacy-first: default to no tracking

import { ConsentTier } from './events';

const CONSENT_STORAGE_KEY = 'whiskers_consent';
const CONSENT_TIMESTAMP_KEY = 'whiskers_consent_time';

export type ConsentState = 'not_asked' | 'declined' | 'essential' | 'analytics';

interface ConsentData {
  state: ConsentState;
  timestamp: number;
}

// Get current consent state
export function getConsentState(): ConsentState {
  if (typeof window === 'undefined') {
    return 'not_asked';
  }

  const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (!stored) {
    return 'not_asked';
  }

  try {
    const data: ConsentData = JSON.parse(stored);
    return data.state;
  } catch {
    return 'not_asked';
  }
}

// Set consent state
export function setConsentState(state: ConsentState): void {
  if (typeof window === 'undefined') return;

  const data: ConsentData = {
    state,
    timestamp: Date.now(),
  };

  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(data));
}

// Get consent tier for tracking
export function getConsentTier(): ConsentTier {
  const state = getConsentState();
  
  switch (state) {
    case 'analytics':
      return 'analytics';
    case 'essential':
      return 'essential';
    case 'declined':
    case 'not_asked':
    default:
      return 'essential'; // Default to essential only
  }
}

// Check if tracking is allowed for a specific event type
export function canTrackEvent(eventType: string): boolean {
  const tier = getConsentTier();
  
  // Essential events always allowed (if any consent given)
  const essentialEvents = ['session_start', 'session_end', 'page_view'];
  
  if (essentialEvents.includes(eventType)) {
    return tier === 'essential' || tier === 'analytics';
  }
  
  // Other events require full analytics consent
  return tier === 'analytics';
}

// Check if consent banner should be shown
export function shouldShowConsentBanner(): boolean {
  return getConsentState() === 'not_asked';
}

// Accept analytics consent
export function acceptAnalytics(): void {
  setConsentState('analytics');
}

// Accept only essential
export function acceptEssentialOnly(): void {
  setConsentState('essential');
}

// Decline all tracking
export function declineTracking(): void {
  setConsentState('declined');
}

// Reset consent (for testing)
export function resetConsent(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CONSENT_STORAGE_KEY);
  localStorage.removeItem(CONSENT_TIMESTAMP_KEY);
}
