import { Platform } from 'react-native';

export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

const ANALYTICS_ENDPOINT_PATH = '/.netlify/functions/analytics';
const ANALYTICS_PRODUCTION_ORIGIN = 'https://weto-app.netlify.app';
const ANALYTICS_SESSION_KEY = 'weto.analytics.session';

type AnalyticsTransportEvent = {
  eventName: string;
  payload: AnalyticsPayload;
  pathname: string | null;
  url: string | null;
  referrer: string | null;
  userAgent: string | null;
  sessionId: string;
  timestamp: number;
  surface: 'web' | 'native';
};

function getAnalyticsEndpoint() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}${ANALYTICS_ENDPOINT_PATH}`;
  }

  return `${ANALYTICS_PRODUCTION_ORIGIN}${ANALYTICS_ENDPOINT_PATH}`;
}

function createAnalyticsSessionId() {
  const cryptoAny = globalThis.crypto as Crypto | undefined;
  if (typeof cryptoAny?.randomUUID === 'function') {
    return cryptoAny.randomUUID();
  }

  return `weto-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getAnalyticsSessionId() {
  const globalAny = globalThis as any;
  if (globalAny.__wetoAnalyticsSessionId) {
    return globalAny.__wetoAnalyticsSessionId as string;
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const existing = window.sessionStorage.getItem(ANALYTICS_SESSION_KEY);
      if (existing) {
        globalAny.__wetoAnalyticsSessionId = existing;
        return existing;
      }
    } catch {
      // Ignore storage access failures and fall back to in-memory.
    }
  }

  const created = createAnalyticsSessionId();
  globalAny.__wetoAnalyticsSessionId = created;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(ANALYTICS_SESSION_KEY, created);
    } catch {
      // Ignore storage access failures and rely on in-memory session id.
    }
  }

  return created;
}

function sendAnalyticsEvent(event: AnalyticsTransportEvent) {
  const body = JSON.stringify(event);
  const endpoint = getAnalyticsEndpoint();

  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
      return;
    } catch {
      // Fallback to fetch below.
    }
  }

  void fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export function trackEvent(eventName: string, payload: AnalyticsPayload = {}) {
  const surface = Platform.OS === 'web' ? 'web' : 'native';
  const sessionId = getAnalyticsSessionId();
  const url = typeof window !== 'undefined' ? window.location.href : null;
  const pathname = typeof window !== 'undefined' ? window.location.pathname : null;
  const referrer = typeof document !== 'undefined' ? document.referrer || null : null;
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;

  if (typeof window !== 'undefined') {
    const windowAny = window as any;
    windowAny.dataLayer = windowAny.dataLayer || [];
    windowAny.dataLayer.push({ event: eventName, ...payload });

    if (typeof windowAny.gtag === 'function') {
      windowAny.gtag('event', eventName, payload);
    }

    if (typeof windowAny.plausible === 'function') {
      windowAny.plausible(eventName, { props: payload });
    }
  }

  sendAnalyticsEvent({
    eventName,
    payload,
    pathname,
    url,
    referrer,
    userAgent,
    sessionId,
    timestamp: Date.now(),
    surface,
  });

  console.info('[weto-analytics]', eventName, payload);
}