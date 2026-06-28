import { Platform } from 'react-native';
import {
  AnalyticsSummary,
  ChatMessageInput,
  ChatThread,
  MatchProfile,
  ModerationAction,
  ModerationReportSummary,
  ScenarioLevel,
  UserVector,
} from '../types';

const PRODUCTION_ORIGIN = 'https://weto-app.netlify.app';

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface RemoteUserSnapshot {
  id: string;
  name: string;
  avatar: string;
  birthYear: string;
  gender: string;
  seeking: string;
  hasCompletedOnboarding: boolean;
  selectedLevel: ScenarioLevel;
  userVector: UserVector;
  profileCompletion: number;
  answeredScenarioIds: string[];
  email: string | null;
  isAdmin: boolean;
  isSuspended: boolean;
  suspensionReason: string | null;
}

export interface RemoteSnapshot {
  user: RemoteUserSnapshot;
  matches: MatchProfile[];
  chats: ChatThread[];
  syncVersion: number;
}

export interface SessionPayload extends RemoteSnapshot {
  sessionToken: string;
}

export interface AnswerPayload extends RemoteSnapshot {
  pendingMatch: MatchProfile | null;
}

export interface RealtimeSyncPayload {
  changed: boolean;
  syncVersion: number;
  reason: string;
  reportId?: string;
}

function getApiBase() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/.netlify/functions`;
  }

  return `${PRODUCTION_ORIGIN}/.netlify/functions`;
}

async function requestJson<T>(path: string, options: RequestInit = {}, sessionToken?: string): Promise<T> {
  const headers = new Headers(options.headers ?? {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (sessionToken) {
    headers.set('x-weto-session', sessionToken);
  }

  const response = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload && typeof payload.error === 'string'
      ? payload.error
      : 'La requete Weto a echoue.';
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export async function createOrUpdateSession(input: {
  sessionToken?: string;
  name: string;
  avatar: string;
  birthYear: string;
  gender: string;
  seeking: string;
  email?: string;
  password?: string;
}) {
  return requestJson<SessionPayload>('/session', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function loginAccount(input: { email: string; password: string }) {
  return requestJson<SessionPayload>('/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function logoutAccount(sessionToken: string) {
  return requestJson<{ ok: boolean }>('/logout', {
    method: 'POST',
  }, sessionToken);
}

export async function bootstrapSession(sessionToken: string) {
  return requestJson<RemoteSnapshot>('/bootstrap', { method: 'GET' }, sessionToken);
}

export async function submitAnswer(sessionToken: string, payload: {
  scenarioId: string;
  choiceIndex: number;
  reactionTimeMs: number;
}) {
  return requestJson<AnswerPayload>('/answer', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, sessionToken);
}

export async function fetchChatThread(sessionToken: string, contactId: string) {
  return requestJson<{ thread: ChatThread }>(`/chat-thread?contactId=${encodeURIComponent(contactId)}`, {
    method: 'GET',
  }, sessionToken);
}

export async function sendChatMessage(sessionToken: string, contactId: string, message: ChatMessageInput) {
  return requestJson<{ thread: ChatThread }>('/send-message', {
    method: 'POST',
    body: JSON.stringify({ contactId, message }),
  }, sessionToken);
}

export async function markChatAsRead(sessionToken: string, contactId: string) {
  return requestJson<{ ok: boolean }>('/mark-read', {
    method: 'POST',
    body: JSON.stringify({ contactId }),
  }, sessionToken);
}

export async function setChatTypingState(sessionToken: string, contactId: string, isTyping: boolean) {
  return requestJson<{ ok: boolean }>('/typing', {
    method: 'POST',
    body: JSON.stringify({ contactId, isTyping }),
  }, sessionToken);
}

export async function setChatEphemeralMode(sessionToken: string, contactId: string, enabled: boolean) {
  return requestJson<{ ok: boolean; thread: ChatThread }>('/chat-mode', {
    method: 'POST',
    body: JSON.stringify({ contactId, ephemeralMode24h: enabled }),
  }, sessionToken);
}

export async function resetRemoteSession(sessionToken: string) {
  return requestJson<{ ok: boolean }>('/reset-session', {
    method: 'POST',
  }, sessionToken);
}

export async function waitForRealtimeChange(sessionToken: string, lastVersion: number) {
  return requestJson<RealtimeSyncPayload>(`/sync?lastVersion=${encodeURIComponent(String(lastVersion))}`, {
    method: 'GET',
  }, sessionToken);
}

export async function reportChatMessage(
  sessionToken: string,
  payload: { contactId: string; messageId: string; reason: string }
) {
  return requestJson<{ ok: boolean; reportId: string }>('/report-message', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, sessionToken);
}

export async function fetchModerationReports(sessionToken: string) {
  return requestJson<{ reports: ModerationReportSummary[] }>('/admin-reports', {
    method: 'GET',
  }, sessionToken);
}

export async function moderateModerationReport(
  sessionToken: string,
  payload: { reportId: string; action: ModerationAction; note?: string }
) {
  return requestJson<{ ok: boolean; report: ModerationReportSummary }>('/moderate-report', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, sessionToken);
}

export async function fetchAnalyticsSummary(sessionToken: string, days = 7) {
  return requestJson<{ summary: AnalyticsSummary }>(`/analytics-summary?days=${encodeURIComponent(String(days))}`, {
    method: 'GET',
  }, sessionToken);
}