// Event Batcher
// Batches events and sends them efficiently

import { AnalyticsEvent } from './events';
import { getConsentTier } from './consent';

const BATCH_INTERVAL_MS = 5000; // 5 seconds
const MAX_BATCH_SIZE = 20;
const MAX_EVENTS_PER_SESSION = 100;

interface BatcherState {
  queue: AnalyticsEvent[];
  eventCount: number;
  flushTimer: ReturnType<typeof setTimeout> | null;
  convexMutation: ((events: AnalyticsEvent[], consentTier: string) => Promise<void>) | null;
}

const state: BatcherState = {
  queue: [],
  eventCount: 0,
  flushTimer: null,
  convexMutation: null,
};

// Set the Convex mutation function
export function setBatchMutation(
  mutation: (events: AnalyticsEvent[], consentTier: string) => Promise<void>
): void {
  state.convexMutation = mutation;
}

// Add event to queue
export function queueEvent(event: AnalyticsEvent): void {
  // Check event limit
  if (state.eventCount >= MAX_EVENTS_PER_SESSION) {
    console.debug('[Analytics] Session event limit reached, skipping event');
    return;
  }

  state.queue.push(event);
  state.eventCount++;

  // Flush if batch is full
  if (state.queue.length >= MAX_BATCH_SIZE) {
    flush();
    return;
  }

  // Start flush timer if not running
  if (!state.flushTimer) {
    state.flushTimer = setTimeout(() => {
      flush();
    }, BATCH_INTERVAL_MS);
  }
}

// Flush queue to backend
export async function flush(): Promise<void> {
  // Clear timer
  if (state.flushTimer) {
    clearTimeout(state.flushTimer);
    state.flushTimer = null;
  }

  // Nothing to flush
  if (state.queue.length === 0) {
    return;
  }

  // No mutation set
  if (!state.convexMutation) {
    console.debug('[Analytics] No mutation set, dropping events');
    state.queue = [];
    return;
  }

  // Get events and clear queue
  const events = [...state.queue];
  state.queue = [];

  // Get consent tier
  const consentTier = getConsentTier();

  try {
    await state.convexMutation(events, consentTier);
    console.debug(`[Analytics] Flushed ${events.length} events`);
  } catch (error) {
    console.error('[Analytics] Failed to flush events:', error);
    // Re-queue events on failure (up to limit)
    const requeue = events.slice(0, MAX_BATCH_SIZE - state.queue.length);
    state.queue = [...requeue, ...state.queue];
  }
}

// Flush on page unload
export function setupUnloadHandler(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flush();
    }
  });

  window.addEventListener('beforeunload', () => {
    flush();
  });
}

// Reset batcher (for testing)
export function resetBatcher(): void {
  state.queue = [];
  state.eventCount = 0;
  if (state.flushTimer) {
    clearTimeout(state.flushTimer);
    state.flushTimer = null;
  }
}
