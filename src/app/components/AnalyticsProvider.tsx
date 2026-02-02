'use client';

import { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
  initAnalytics,
  trackLandingView,
  trackSessionStart,
  trackBounce,
  trackSessionEnd,
  flush,
} from '@/lib/analytics';
import { AnalyticsEvent } from '@/lib/analytics/events';

interface AnalyticsContextValue {
  isInitialized: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextValue>({ isInitialized: false });

export function useAnalytics() {
  return useContext(AnalyticsContext);
}

interface AnalyticsProviderProps {
  children: ReactNode;
  trackLanding?: boolean; // Whether to track landing view on mount
}

export function AnalyticsProvider({ children, trackLanding = false }: AnalyticsProviderProps) {
  const ingestBatch = useMutation(api.analytics.ingestBatch);
  const initializedRef = useRef(false);
  const hasConvertedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Initialize analytics with Convex mutation
    const sendEvents = async (events: AnalyticsEvent[], consentTier: string) => {
      try {
        await ingestBatch({
          events: events.map((e) => ({
            eventType: e.eventType,
            sessionId: e.sessionId,
            timestamp: e.timestamp,
            clientTimestamp: e.clientTimestamp,
            payload: 'payload' in e ? e.payload : {},
          })),
          consentTier,
        });
      } catch (error) {
        console.error('[Analytics] Failed to send events:', error);
      }
    };

    initAnalytics(sendEvents);

    // Track session start
    trackSessionStart();

    // Track landing view if requested
    if (trackLanding) {
      trackLandingView();
    }

    // Track bounce on unload (if not converted)
    const handleUnload = () => {
      if (!hasConvertedRef.current) {
        trackBounce();
      }
      trackSessionEnd();
      flush();
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [ingestBatch, trackLanding]);

  // Mark as converted (prevents bounce tracking)
  const markConverted = () => {
    hasConvertedRef.current = true;
  };

  return (
    <AnalyticsContext.Provider value={{ isInitialized: initializedRef.current }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// Hook to mark conversion (call when user navigates to playground)
export function useMarkConversion() {
  const hasConverted = useRef(false);

  return () => {
    hasConverted.current = true;
  };
}
