import { getStore } from '@netlify/blobs';
import { errorResponse, jsonResponse, HttpError } from './_lib/http';
import { getUserBySessionToken } from './_lib/service';

type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

interface StoredAnalyticsEvent {
  id: string;
  eventName: string;
  payload: AnalyticsPayload;
  pathname: string | null;
  url: string | null;
  referrer: string | null;
  userAgent: string | null;
  sessionId: string;
  timestamp: number;
  surface: 'web' | 'native';
}

const analyticsStore = getStore({ name: 'weto-analytics', consistency: 'strong' });

function getSessionToken(request: Request) {
  return request.headers.get('x-weto-session')?.trim() ?? '';
}

function getDateKeys(days: number) {
  return Array.from({ length: days }, (_value, index) => {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - index);
    return date.toISOString().slice(0, 10);
  });
}

export default async (request: Request) => {
  try {
    if (request.method !== 'GET') {
      throw new HttpError(405, 'Methode non autorisee.');
    }

    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      throw new HttpError(401, 'Session absente.');
    }

    const user = await getUserBySessionToken(sessionToken);
    if (!user) {
      throw new HttpError(401, 'Session invalide.');
    }

    if (!user.isAdmin) {
      throw new HttpError(403, 'Acces admin refuse.');
    }

    const url = new URL(request.url);
    const requestedDays = Number.parseInt(url.searchParams.get('days')?.trim() ?? '7', 10);
    const windowDays = Number.isFinite(requestedDays) ? Math.min(Math.max(requestedDays, 1), 30) : 7;
    const todayKey = new Date().toISOString().slice(0, 10);
    const dateKeys = getDateKeys(windowDays);

    const keysByDay = await Promise.all(
      dateKeys.map(async (dateKey) => {
        const { blobs } = await analyticsStore.list({ prefix: `events/${dateKey}/` });
        return blobs.map((entry) => entry.key);
      })
    );

    const eventKeys = keysByDay.flat();
    const events = (
      await Promise.all(eventKeys.map((key) => analyticsStore.get(key, { type: 'json' })))
    ).filter((entry): entry is StoredAnalyticsEvent => Boolean(entry));

    const byEventMap = new Map<string, { eventName: string; total: number; today: number; lastSeenAt: number | null }>();
    const uniqueSessions = new Set<string>();

    for (const event of events) {
      uniqueSessions.add(event.sessionId);
      const summary = byEventMap.get(event.eventName) ?? {
        eventName: event.eventName,
        total: 0,
        today: 0,
        lastSeenAt: null,
      };

      summary.total += 1;
      if (new Date(event.timestamp).toISOString().slice(0, 10) === todayKey) {
        summary.today += 1;
      }
      summary.lastSeenAt = Math.max(summary.lastSeenAt ?? 0, event.timestamp);
      byEventMap.set(event.eventName, summary);
    }

    const byEvent = Array.from(byEventMap.values()).sort((first, second) => second.total - first.total);
    const recentEvents = events
      .slice()
      .sort((first, second) => second.timestamp - first.timestamp)
      .slice(0, 20)
      .map((event) => ({
        id: event.id,
        eventName: event.eventName,
        timestamp: event.timestamp,
        pathname: event.pathname,
        surface: event.surface,
        sessionId: event.sessionId,
      }));

    return jsonResponse({
      summary: {
        generatedAt: Date.now(),
        windowDays,
        totalEvents: events.length,
        uniqueSessions: uniqueSessions.size,
        byEvent,
        recentEvents,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
};