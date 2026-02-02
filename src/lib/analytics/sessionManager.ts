// Session Manager
// Handles anonymous session IDs with daily rotation

const SESSION_STORAGE_KEY = 'whiskers_session';
const SESSION_DATE_KEY = 'whiskers_session_date';

interface SessionData {
  sessionId: string;
  startTime: number;
  pageLoadTime: number;
}

// Generate a UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Get today's date as YYYY-MM-DD
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Get or create session
export function getSession(): SessionData {
  if (typeof window === 'undefined') {
    // SSR fallback
    return {
      sessionId: generateUUID(),
      startTime: Date.now(),
      pageLoadTime: Date.now(),
    };
  }

  const storedDate = sessionStorage.getItem(SESSION_DATE_KEY);
  const today = getTodayDate();

  // Rotate session daily for privacy
  if (storedDate !== today) {
    const newSession: SessionData = {
      sessionId: generateUUID(),
      startTime: Date.now(),
      pageLoadTime: Date.now(),
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
    sessionStorage.setItem(SESSION_DATE_KEY, today);
    return newSession;
  }

  const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Corrupted data, create new session
    }
  }

  // Create new session
  const newSession: SessionData = {
    sessionId: generateUUID(),
    startTime: Date.now(),
    pageLoadTime: Date.now(),
  };
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
  sessionStorage.setItem(SESSION_DATE_KEY, today);
  return newSession;
}

// Get time since page load
export function getTimeSincePageLoad(): number {
  const session = getSession();
  return Date.now() - session.pageLoadTime;
}

// Reset page load time (for SPA navigation)
export function resetPageLoadTime(): void {
  if (typeof window === 'undefined') return;
  
  const session = getSession();
  session.pageLoadTime = Date.now();
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

// Get session ID
export function getSessionId(): string {
  return getSession().sessionId;
}
