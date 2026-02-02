'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { trackSectionViewed } from '@/lib/analytics';
import { SectionId } from '@/lib/analytics/events';

interface TrackedSectionProps {
  id: SectionId;
  children: ReactNode;
  className?: string;
  threshold?: number; // Intersection threshold (0-1)
}

export default function TrackedSection({
  id,
  children,
  className = '',
  threshold = 0.5,
}: TrackedSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const entryTimeRef = useRef<number | null>(null);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting) {
          // Section came into view
          entryTimeRef.current = Date.now();
        } else if (entryTimeRef.current && !hasTrackedRef.current) {
          // Section left view - track time spent
          const duration = Date.now() - entryTimeRef.current;
          
          // Only track if viewed for at least 1 second
          if (duration >= 1000) {
            trackSectionViewed(id, duration);
            hasTrackedRef.current = true; // Only track once per session
          }
          
          entryTimeRef.current = null;
        }
      },
      {
        threshold,
        rootMargin: '0px',
      }
    );

    observer.observe(section);

    // Track on unmount if still in view
    return () => {
      observer.disconnect();
      
      if (entryTimeRef.current && !hasTrackedRef.current) {
        const duration = Date.now() - entryTimeRef.current;
        if (duration >= 1000) {
          trackSectionViewed(id, duration);
        }
      }
    };
  }, [id, threshold]);

  return (
    <section ref={sectionRef} id={id} className={className}>
      {children}
    </section>
  );
}
