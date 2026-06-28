import { getStore } from '@netlify/blobs';
import { errorResponse, jsonResponse, parseJsonBody, HttpError } from './_lib/http';

type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

interface AnalyticsIngestRequest {
  eventName?: string;
  payload?: AnalyticsPayload;
  pathname?: string | null;
  url?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
  sessionId?: string;
  timestamp?: number;
  surface?: 'web' | 'native';
}

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

function randomId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizePayload(payload: AnalyticsIngestRequest['payload']) {
  if (!payload || typeof payload !== 'object') {
    return {} as AnalyticsPayload;
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => {
      return (
        value === null ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        typeof value === 'undefined'
      );
    })
  ) as AnalyticsPayload;
}

function getDayKey(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export default async (request: Request) => {
  try {
    if (request.method !== 'POST') {
      throw new HttpError(405, 'Methode non autorisee.');
    }

    const body = await parseJsonBody<AnalyticsIngestRequest>(request);
    const eventName = body.eventName?.trim();

    if (!eventName) {
      throw new HttpError(400, 'Nom d evenement manquant.');
    }

    const timestamp =
      typeof body.timestamp === 'number' && Number.isFinite(body.timestamp)
        ? Math.round(body.timestamp)
        : Date.now();
    const id = randomId();
    const event: StoredAnalyticsEvent = {
      id,
      eventName,
      payload: sanitizePayload(body.payload),
      pathname: typeof body.pathname === 'string' ? body.pathname : null,
      url: typeof body.url === 'string' ? body.url : null,
      referrer: typeof body.referrer === 'string' ? body.referrer : null,
      userAgent: typeof body.userAgent === 'string' ? body.userAgent : null,
      sessionId: body.sessionId?.trim() || 'anonymous',
      timestamp,
      surface: body.surface === 'native' ? 'native' : 'web',
    };

    await analyticsStore.setJSON(`events/${getDayKey(timestamp)}/${timestamp}-${id}.json`, event);

    return jsonResponse({ ok: true }, 202);
  } catch (error) {
    return errorResponse(error);
  }
};