# Phase 1 — Planning & Confirmation

## Goal Restatement

You're building a **learning telemetry system** for Whiskers, an educational app that helps children/teens transition from block-based (Scratch-style) programming to text-based code. The system should:

1. **Measure learning progression** — understand how users move from drag-and-drop scaffolding to typed code
2. **Validate product-market fit** — lean startup metrics for the landing page (who visits, who converts, what resonates)
3. **Improve product quality** — identify friction points, confusion, and drop-off moments
4. **Respect privacy** — comply with COPPA/GDPR-K, avoid PII, and default to aggregation

This is **pedagogical instrumentation + lean validation**, not ad tracking.

---

## Refined Execution Plan

### 1. Raw Metrics (Captured Events)

#### A. Landing Page Events (Lean Startup Focus)

| Event | Data Captured | Lean Insight |
|-------|---------------|--------------|
| `landing_view` | timestamp, referrer category (direct/search/social/other), device type | How are people finding us? |
| `role_selected` | role (`student`/`parent`/`teacher`), time since page load | Who is our audience? |
| `section_scrolled_into_view` | section ID (`demo`/`why`/`how`/`who`/`whats-next`), role context | What content resonates per persona? |
| `section_time_spent` | section ID, duration (bucketed: <5s, 5-15s, 15-30s, 30s+), role | Deep engagement signal |
| `cta_clicked` | button ID, section context, role | Which CTAs convert? |
| `demo_interaction` | interaction type (view/scroll/hover), role | Is the demo compelling? |
| `external_link_clicked` | link category (playground/support/author), role | Exit intent |
| `bounce` | time on page before leave, last section viewed, role (if selected) | Where do we lose people? |

#### B. Funnel Events

| Event | Purpose |
|-------|---------|
| `funnel_step` | Generic: `{ funnelName: 'landing_to_playground', step: 'role_selected', role }` |

#### C. Editor/Playground Events (Same as Before)

| Event | Data Captured |
|-------|---------------|
| `session_start` | anonymous session ID, timestamp, viewport size, device type |
| `session_end` | duration, final state |
| `page_view` | route, referrer section |
| `editor_focus` | timestamp, focus duration |
| `code_run` | success/failure, error category, code length, block count, typed ratio |
| `compile_attempt` | success/failure, error category, latency |

---

### 2. Learnable Metrics (Derived/Computed)

#### A. Landing Page Metrics (Lean Startup)

| Metric | Computation | Question Answered |
|--------|-------------|-------------------|
| **Visitor Segmentation** | Count of `role_selected` by role | Who is our primary audience? |
| **Role Selection Rate** | `role_selected` / `landing_view` | Are visitors self-identifying? |
| **Section Engagement by Role** | Avg `section_time_spent` per section, grouped by role | What content works for each persona? |
| **CTA Click-Through Rate (CTR)** | `cta_clicked(X)` / `section_scrolled_into_view(section containing X)` | Which CTAs convert? |
| **Demo Engagement Rate** | `demo_interaction` / `role_selected(student)` | Does the demo hook students? |
| **Landing → Playground Conversion** | `page_view(/playground)` / `landing_view` | Overall funnel health |
| **Conversion by Role** | `page_view(/playground)` per role / `role_selected` per role | Which persona converts best? |
| **Bounce Rate by Section** | `bounce` where `last_section = X` / total bounces | Where do we lose people? |
| **Time to Role Selection** | Avg time from `landing_view` to `role_selected` | Is the hook clear? |
| **Content A vs B Ratio** | For any two CTAs: `clicks(A)` / `clicks(B)` | Relative preference |

#### B. Funnel Metrics

| Funnel | Steps | Metric |
|--------|-------|--------|
| **Student Path** | `landing_view` → `role_selected(student)` → `section_viewed(demo)` → `cta_clicked(try-it)` → `page_view(/playground)` | Step-by-step drop-off |
| **Parent Path** | `landing_view` → `role_selected(parent)` → `section_viewed(why)` → `section_viewed(demo)` → `cta_clicked` | Information → conviction |
| **Teacher Path** | Same as parent, plus `section_viewed(who)` | Institutional validation |

#### C. Playground/Learning Metrics (Same as Before)

| Metric | Computation | Insight |
|--------|-------------|---------|
| **Scaffolding Graduation Rate** | % sessions where typed > dragged after N minutes | Learning transition |
| **Time to First Run** | `code_run.timestamp - session_start.timestamp` | Onboarding friction |
| **Error Recovery Rate** | % fail → success within 2 min | Resilience |
| **Session Depth** | Distinct actions per session | Engagement quality |

---

### 3. Event Schema (TypeScript Types)

```typescript
// Base
interface AnalyticsEvent {
  eventType: string;
  sessionId: string;
  timestamp: number;
  clientTimestamp: number;
}

// Landing Page Events
interface LandingViewEvent extends AnalyticsEvent {
  eventType: 'landing_view';
  referrerCategory: 'direct' | 'search' | 'social' | 'referral' | 'other';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  viewportWidth: number; // Bucketed: 320, 768, 1024, 1440+
}

interface RoleSelectedEvent extends AnalyticsEvent {
  eventType: 'role_selected';
  role: 'student' | 'parent' | 'teacher';
  timeSincePageLoadMs: number;
}

interface SectionViewedEvent extends AnalyticsEvent {
  eventType: 'section_viewed';
  sectionId: 'hero' | 'role-selection' | 'demo' | 'why' | 'how' | 'who' | 'whats-next' | 'footer';
  role: 'student' | 'parent' | 'teacher' | null;
  durationBucket: '<5s' | '5-15s' | '15-30s' | '30s+';
}

interface CTAClickedEvent extends AnalyticsEvent {
  eventType: 'cta_clicked';
  buttonId: string;        // e.g., 'hero-cta', 'try-demo', 'start-coding'
  sectionId: string;       // Where the button lives
  role: 'student' | 'parent' | 'teacher' | null;
}

interface BounceEvent extends AnalyticsEvent {
  eventType: 'bounce';
  timeOnPageMs: number;
  lastSectionViewed: string | null;
  role: 'student' | 'parent' | 'teacher' | null;
  scrollDepthPercent: number; // 0-100, bucketed to 10s
}

interface FunnelStepEvent extends AnalyticsEvent {
  eventType: 'funnel_step';
  funnelName: 'student_activation' | 'parent_conviction' | 'teacher_adoption';
  stepName: string;
  stepIndex: number;
  role: 'student' | 'parent' | 'teacher';
}

// Playground Events
interface CodeRunEvent extends AnalyticsEvent {
  eventType: 'code_run';
  success: boolean;
  errorCategory?: 'syntax' | 'runtime' | 'type' | 'unknown';
  codeLength: number;
  blockCount: number;
  typedRatio: number;
}
```

---

### 4. Convex Backend Structure

#### Tables

| Table | Purpose | Fields | TTL |
|-------|---------|--------|-----|
| `events` | Raw event log | `eventType`, `sessionId`, `timestamp`, `payload` | 30 days |
| `sessions` | Session metadata | `sessionId`, `startTime`, `endTime`, `deviceType`, `role`, `source` | 90 days |
| `dailyLandingMetrics` | Landing page rollups | `date`, `roleDistribution`, `conversionRates`, `sectionEngagement` | Forever |
| `dailyFunnelMetrics` | Funnel step counts | `date`, `funnelName`, `stepCounts`, `dropOffRates` | Forever |
| `dailyPlaygroundMetrics` | Playground rollups | `date`, `sessions`, `avgDuration`, `graduationRate` | Forever |

#### Functions

| Function | Type | Purpose |
|----------|------|---------|
| `ingestEvent` | Mutation | Validate + write event |
| `ingestBatch` | Mutation | Batch write (up to 20 events) |
| `endSession` | Mutation | Finalize session, compute metrics |
| `computeDailyLandingMetrics` | Scheduled Action | Nightly: role distribution, CTRs, funnels |
| `getLandingDashboard` | Query | Fetch landing metrics for dashboard |
| `getFunnelAnalysis` | Query | Get funnel drop-off by role |
| `purgeOldEvents` | Scheduled Action | TTL enforcement |

---

### 5. Client Instrumentation Architecture

```
src/
├── lib/
│   └── analytics/
│       ├── index.ts              # Public API
│       ├── events.ts             # Type definitions
│       ├── sessionManager.ts     # Anonymous session handling
│       ├── batcher.ts            # Batch + debounce
│       ├── consent.ts            # Consent state
│       ├── sanitizer.ts          # Redaction
│       ├── funnels.ts            # Funnel tracking helpers
│       └── hooks/
│           ├── useTrackSection.ts    # Intersection observer hook
│           ├── useTrackCTA.ts        # Click tracking hook
│           └── usePageLifecycle.ts   # Bounce detection
├── app/
│   ├── components/
│   │   ├── AnalyticsProvider.tsx     # React context
│   │   └── TrackedSection.tsx        # HOC for section tracking
│   └── page.tsx                      # Landing page (instrumented)
```

#### Landing Page Instrumentation Points

```tsx
// In page.tsx - conceptual placement
<TrackedSection id="hero">
  <HeroSection />
</TrackedSection>

<TrackedSection id="role-selection">
  <RoleSelection onSelect={(role) => {
    track('role_selected', { role, timeSincePageLoadMs });
    trackFunnelStep('student_activation', 'role_selected', 1);
  }} />
</TrackedSection>

<TrackedSection id="demo">
  <DemoSection />
</TrackedSection>

// CTAs automatically tracked via useTrackCTA or data attributes
<button data-track-cta="start-coding" data-section="demo">
  Start Coding
</button>
```

---

### 6. Privacy, Consent, and Redaction Strategy

| Requirement | Implementation |
|-------------|----------------|
| **No PII** | Session IDs are random UUIDs, rotated daily |
| **Consent** | Opt-in banner; default = essential only (session duration) |
| **Age-appropriate** | No targeting, no profiling, aggregate only |
| **Redaction** | `buttonId` and `sectionId` from predefined allowlist only |
| **Bucketing** | Times bucketed (not exact), viewports bucketed |
| **TTL** | Raw events: 30 days; Aggregates: retained |
| **No fingerprinting** | No canvas, fonts, or hardware enumeration |

**Consent Tiers:**
| Tier | What's Tracked |
|------|----------------|
| `essential` | Session start/end, page views only |
| `analytics` | All events in plan |

---

### 7. Rollups / Aggregates

#### Daily Landing Page Metrics

```typescript
{
  date: '2026-02-02',
  visitors: {
    total: 1420,
    byDevice: { mobile: 680, tablet: 120, desktop: 620 },
    bySource: { direct: 400, search: 600, social: 300, other: 120 }
  },
  roleSelection: {
    total: 890,                    // 62.7% selection rate
    byRole: { student: 534, parent: 223, teacher: 133 },
    avgTimeToSelectMs: 8400
  },
  sectionEngagement: {
    // Per section: views, avg duration bucket, by role
    demo: { views: 780, avgDuration: '15-30s', byRole: { student: 500, parent: 180, teacher: 100 } },
    why: { views: 320, avgDuration: '5-15s', byRole: { student: 20, parent: 200, teacher: 100 } },
    // ...
  },
  ctaPerformance: {
    'hero-cta': { impressions: 1420, clicks: 890, ctr: 0.627 },
    'try-demo': { impressions: 780, clicks: 340, ctr: 0.436 },
    'start-coding': { impressions: 600, clicks: 180, ctr: 0.300 }
  },
  funnels: {
    student_activation: {
      steps: ['landing', 'role_selected', 'demo_viewed', 'playground'],
      counts: [1420, 534, 480, 180],
      dropOff: [0, 0.624, 0.101, 0.625]  // Where we lose students
    },
    parent_conviction: {
      steps: ['landing', 'role_selected', 'why_viewed', 'demo_viewed', 'playground'],
      counts: [1420, 223, 200, 150, 45],
      dropOff: [0, 0.843, 0.103, 0.250, 0.700]
    }
  },
  bounces: {
    total: 530,                    // 37.3% bounce rate
    byLastSection: { hero: 200, 'role-selection': 180, demo: 100, other: 50 },
    avgTimeBeforeBounce: 12000     // ms
  },
  conversion: {
    overall: 0.155,                // 220/1420 reached playground
    byRole: { student: 0.337, parent: 0.202, teacher: 0.188 }
  }
}
```

#### Key Lean Startup Questions Answered

| Question | Metric | Target |
|----------|--------|--------|
| **Who is our audience?** | Role distribution | Track shift over time |
| **Is the value prop clear?** | Time to role selection | < 10s |
| **Does the demo hook students?** | Student demo → playground conversion | > 40% |
| **Does "Why" convince parents?** | Parent why_viewed → demo_viewed | > 80% |
| **Which CTA performs best?** | CTA CTR comparison | Iterate on lowest |
| **Where do we lose people?** | Funnel drop-off by step | Fix biggest leak |
| **Mobile vs Desktop?** | Conversion by device | Parity goal |

---

### 8. Rollout, Testing, and Cost Controls

| Phase | Scope | Landing Page | Playground |
|-------|-------|--------------|------------|
| **Alpha** | Internal | 100% | 100% |
| **Beta** | 10% traffic | Full schema | Basic events |
| **GA** | 100% traffic | Full schema | Full schema |

**Cost Controls:**
- Max 30 events per landing page session
- Max 50 events per playground session
- Batch size: 10-20 events per request
- Section tracking debounced to 1 event per section per session

---

## Assumptions

1. **Convex is not yet set up** — I'll add it as part of implementation
2. **No user accounts** — all anonymous
3. **Single landing page** — `page.tsx` is the primary entry point
4. **Three distinct user journeys** — student, parent, teacher (already in code)
5. **You want actionable lean metrics** — not vanity metrics

---

## Risks and Tradeoffs

| Risk | Mitigation |
|------|------------|
| **Over-tracking sections** | Debounce + sample high-frequency events |
| **Consent friction** | Default to essential; full analytics opt-in |
| **Analysis paralysis** | Focus on 3 key funnels first |
| **Mobile bounce rates** | Ensure tracking works on slow connections |

---

## V1 Scope

### ✅ In V1 (Landing Page Focus)

**Events:**
- `landing_view`
- `role_selected`
- `section_viewed` (for key sections)
- `cta_clicked`
- `bounce`
- `page_view` (for playground navigation)

**Metrics:**
- Role distribution
- Role selection rate + time
- Section engagement by role
- CTA click-through rates
- Landing → Playground conversion by role
- Bounce rate by section

**Infrastructure:**
- Convex setup with `events` table
- Client analytics library with batching
- `TrackedSection` component
- Consent banner (opt-in)
- Basic daily rollup query

### ⏳ Postponed to V2

- Full funnel tracking with step-by-step analysis
- Playground code_run metrics
- Scaffolding graduation detection
- Nightly scheduled rollups (manual queries in V1)
- Admin dashboard UI
- A/B testing framework
- Cohort analysis

---

## Summary

This revised plan adds **lean startup landing page metrics**:
- **Who**: Role segmentation (student/parent/teacher distribution)
- **What resonates**: Section engagement by persona
- **What converts**: CTA performance comparison
- **Where we lose people**: Funnel drop-off analysis
- **Is it working**: Conversion rates by role

All while maintaining:
- Privacy-first (no PII, bucketed data, consent required)
- Pedagogical focus (learning metrics when they reach playground)
- Minimal implementation (start with 6 core events)