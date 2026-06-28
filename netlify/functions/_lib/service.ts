import { getStore } from '@netlify/blobs';
import { PROFILE_COMPLETION_TARGET, SCENARIOS } from '../../../src/data/scenarios';
import {
  ChatMessage,
  ChatDilemmaPayload,
  ChatMessageInput,
  ChatMessageType,
  ChatThread,
  MatchProfile,
  ModerationAction,
  ModerationReportSummary,
  ScenarioLevel,
  UserVector,
} from '../../../src/types';
import {
  calculateProfile,
  cosineSimilarity,
  generateCompatibilityReasons,
  similarityToPercent,
} from '../../../src/utils';
import { HttpError } from './http';

const store = getStore({ name: 'weto-data', consistency: 'strong' });

const INITIAL_VECTOR: UserVector = {
  sociability: 50,
  humor: 50,
  risk: 50,
  emotion: 50,
  conflict: 50,
  stability: 50,
};

const MATCH_SIMILARITY_THRESHOLD = 0.65;
const MATCH_SIMILARITY_MAX = 0.97;
const MATCH_DISCOVERY_START = 10;
const MATCH_DISCOVERY_INTERVAL = 2;
const MATCH_SEEKING_ALIGNMENT_BONUS = 6;
const MATCH_LEVEL_ALIGNMENT_BONUS = 3;
const MATCH_ACTIVITY_RECENCY_BONUS = 4;
const MATCH_ANSWER_GAP_PENALTY = 0.4;
const SYSTEM_MATCH_MESSAGE = 'Vous avez matché ! Envoyez le premier message.';
const PASSWORD_ITERATIONS = 120_000;
const PASSWORD_MIN_LENGTH = 8;
const SYNC_WAIT_TIMEOUT_MS = 8_000;
const SYNC_WAIT_INTERVAL_MS = 500;
const DEFAULT_ADMIN_EMAILS = ['dimsakaya@gmail.com'];
const ONLINE_WINDOW_MS = 90_000;
const TYPING_WINDOW_MS = 6_000;
const THREAD_EPHEMERAL_DURATION_MS = 24 * 60 * 60 * 1000;
const THREAD_VISIBLE_HISTORY_LIMIT = 300;
const THREAD_MAX_MESSAGES = 1200;
const MAX_MESSAGE_TEXT_LENGTH = 2_000;
const MAX_MEDIA_URI_LENGTH = 2_000_000;
const MAX_DILEMMA_CHOICES = 8;
const MESSAGE_BURST_WINDOW_MS = 8_000;
const MESSAGE_BURST_MAX = 6;

interface StoredAnswer {
  scenarioId: string;
  choiceIndex: number;
  reactionTimeMs: number;
  timestamp: number;
}

interface StoredSession {
  userId: string;
  createdAt: number;
  lastActiveAt: number;
}

interface StoredSyncState {
  version: number;
  updatedAt: number;
  reason: string;
  reportId?: string;
}

export interface StoredUser {
  id: string;
  sessionTokens: string[];
  sessionToken?: string;
  name: string;
  avatar: string;
  birthYear: string;
  gender: string;
  seeking: string;
  hasCompletedOnboarding: boolean;
  selectedLevel: ScenarioLevel;
  userVector: UserVector;
  answers: Record<string, StoredAnswer>;
  answersCount: number;
  profileCompletion: number;
  emailLower: string | null;
  passwordHash: string | null;
  passwordSalt: string | null;
  isAdmin: boolean;
  suspendedAt: number | null;
  suspensionReason: string | null;
  createdAt: number;
  updatedAt: number;
  lastActiveAt: number;
  profilePhotos?: string[];
  favoriteScenarioIds?: string[];
  profileVisibility?: string;
}

interface StoredMessage {
  id: string;
  text: string;
  type: ChatMessageType;
  mediaUri?: string;
  durationMs?: number;
  dilemma?: ChatDilemmaPayload;
  ephemeral?: boolean;
  secure?: boolean;
  secureKind?: 'pdf' | 'video' | 'image';
  secureDurationSec?: number;
  expiresAt?: number;
  timestamp: number;
  senderId: string | null;
  senderKind: 'user' | 'system';
  hiddenAt?: number;
  hiddenBy?: string | null;
  hiddenReason?: string | null;
}

interface StoredThread {
  id: string;
  memberIds: [string, string];
  compatibilityScore: number;
  compatibilityReasons: string[];
  createdAt: number;
  updatedAt: number;
  lastReadAt: Record<string, number>;
  typingByUserId?: Record<string, number>;
  ephemeralMode24h?: boolean;
  messages: StoredMessage[];
}

interface StoredReport {
  id: string;
  type: 'message';
  status: 'open' | 'resolved' | 'dismissed';
  reporterUserId: string;
  reportedUserId: string;
  threadId: string;
  messageId: string;
  messagePreview: string;
  reason: string;
  createdAt: number;
  updatedAt: number;
  resolvedAt: number | null;
  resolvedBy: string | null;
  resolution: ModerationAction | null;
  resolutionNote: string | null;
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

function getConfiguredAdminEmails() {
  const configured = (globalThis as any).process?.env?.WETO_ADMIN_EMAILS as string | undefined;
  const source = configured && configured.trim().length > 0 ? configured : DEFAULT_ADMIN_EMAILS.join(',');
  return new Set(
    source
      .split(',')
      .map((entry) => normalizeEmail(entry))
      .filter((entry): entry is string => Boolean(entry))
  );
}

const ADMIN_EMAILS = getConfiguredAdminEmails();

function randomId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function randomToken() {
  const generated = randomId();
  return `${generated.replace(/-/g, '')}${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeEmail(value?: string | null) {
  const normalized = value?.trim().toLowerCase() ?? '';
  return normalized || null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeScenarioLevel(level: unknown): ScenarioLevel {
  return level === 'intense' || level === 'fire' ? level : 'standard';
}

function userKey(userId: string) {
  return `users/${userId}.json`;
}

function sessionKey(sessionToken: string) {
  return `sessions/${sessionToken}.json`;
}

function emailIndexKey(emailLower: string) {
  return `emailIndex/${emailLower}.txt`;
}

function userThreadsKey(userId: string) {
  return `userThreads/${userId}.json`;
}

function syncKey(userId: string) {
  return `sync/${userId}.json`;
}

function threadKey(threadId: string) {
  return `threads/${threadId}.json`;
}

function reportKey(reportId: string) {
  return `reports/${reportId}.json`;
}

function normalizePair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

function threadIdForUsers(a: string, b: string) {
  const [low, high] = normalizePair(a, b);
  return `${low}__${high}`;
}

function nowMs() {
  return Date.now();
}

function clampMatchScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readJson<T>(key: string) {
  return (await store.get(key, { type: 'json' })) as T | null;
}

async function writeJson(key: string, value: unknown, options?: { onlyIfNew?: boolean }) {
  return store.setJSON(key, value, options);
}

async function listJsonKeys(prefix: string) {
  const { blobs } = await store.list({ prefix });
  return blobs.map((entry) => entry.key);
}

function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
}

async function hashPassword(password: string, salt: string) {
  const encoder = new TextEncoder();
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derivedBits = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: PASSWORD_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  return bufferToHex(derivedBits);
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return diff === 0;
}

async function verifyPassword(password: string, salt: string, expectedHash: string) {
  const actualHash = await hashPassword(password, salt);
  return constantTimeEqual(actualHash, expectedHash);
}

function ensurePassword(password: string) {
  if (password.trim().length < PASSWORD_MIN_LENGTH) {
    throw new HttpError(400, `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caracteres.`);
  }
}

function computeIsAdmin(emailLower: string | null) {
  return Boolean(emailLower && ADMIN_EMAILS.has(emailLower));
}

function normalizeStoredUser(input: unknown): StoredUser | null {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const value = input as Record<string, unknown>;
  const rawVector = (value.userVector ?? {}) as Partial<UserVector>;
  const rawAnswers = value.answers && typeof value.answers === 'object'
    ? (value.answers as Record<string, StoredAnswer>)
    : {};
  const legacySessionToken = typeof value.sessionToken === 'string' ? value.sessionToken : null;
  const rawSessionTokens = Array.isArray(value.sessionTokens)
    ? value.sessionTokens.filter((entry): entry is string => typeof entry === 'string')
    : [];
  const sessionTokens = Array.from(new Set([...rawSessionTokens, ...(legacySessionToken ? [legacySessionToken] : [])]));
  const emailLower = normalizeEmail(
    typeof value.emailLower === 'string'
      ? value.emailLower
      : typeof value.email === 'string'
        ? value.email
        : null
  );

  if (typeof value.id !== 'string') {
    return null;
  }

  return {
    id: value.id,
    sessionTokens,
    sessionToken: legacySessionToken ?? undefined,
    name: typeof value.name === 'string' ? value.name : 'Moi',
    avatar: typeof value.avatar === 'string' ? value.avatar : 'U',
    birthYear: typeof value.birthYear === 'string' ? value.birthYear : '',
    gender: typeof value.gender === 'string' ? value.gender : '',
    seeking: typeof value.seeking === 'string' ? value.seeking : '',
    hasCompletedOnboarding: Boolean(value.hasCompletedOnboarding),
    selectedLevel: normalizeScenarioLevel(value.selectedLevel),
    userVector: {
      sociability: rawVector.sociability ?? INITIAL_VECTOR.sociability,
      humor: rawVector.humor ?? INITIAL_VECTOR.humor,
      risk: rawVector.risk ?? INITIAL_VECTOR.risk,
      emotion: rawVector.emotion ?? INITIAL_VECTOR.emotion,
      conflict: rawVector.conflict ?? INITIAL_VECTOR.conflict,
      stability: rawVector.stability ?? INITIAL_VECTOR.stability,
    },
    answers: rawAnswers,
    answersCount: typeof value.answersCount === 'number' ? value.answersCount : Object.keys(rawAnswers).length,
    profileCompletion: typeof value.profileCompletion === 'number' ? value.profileCompletion : 0,
    emailLower,
    passwordHash: typeof value.passwordHash === 'string' ? value.passwordHash : null,
    passwordSalt: typeof value.passwordSalt === 'string' ? value.passwordSalt : null,
    isAdmin: typeof value.isAdmin === 'boolean' ? value.isAdmin : computeIsAdmin(emailLower),
    suspendedAt: typeof value.suspendedAt === 'number' ? value.suspendedAt : null,
    suspensionReason: typeof value.suspensionReason === 'string' ? value.suspensionReason : null,
    createdAt: typeof value.createdAt === 'number' ? value.createdAt : nowMs(),
    updatedAt: typeof value.updatedAt === 'number' ? value.updatedAt : nowMs(),
    lastActiveAt: typeof value.lastActiveAt === 'number' ? value.lastActiveAt : nowMs(),
  };
}

function normalizeStoredThread(input: unknown): StoredThread | null {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const value = input as Record<string, unknown>;
  if (typeof value.id !== 'string' || !Array.isArray(value.memberIds) || value.memberIds.length !== 2) {
    return null;
  }

  return {
    id: value.id,
    memberIds: [String(value.memberIds[0]), String(value.memberIds[1])],
    compatibilityScore: typeof value.compatibilityScore === 'number' ? value.compatibilityScore : 0,
    compatibilityReasons: Array.isArray(value.compatibilityReasons)
      ? value.compatibilityReasons.filter((entry): entry is string => typeof entry === 'string')
      : [],
    createdAt: typeof value.createdAt === 'number' ? value.createdAt : nowMs(),
    updatedAt: typeof value.updatedAt === 'number' ? value.updatedAt : nowMs(),
    lastReadAt: value.lastReadAt && typeof value.lastReadAt === 'object'
      ? (value.lastReadAt as Record<string, number>)
      : {},
    typingByUserId: value.typingByUserId && typeof value.typingByUserId === 'object'
      ? (value.typingByUserId as Record<string, number>)
      : {},
    ephemeralMode24h: Boolean(value.ephemeralMode24h),
    messages: Array.isArray(value.messages)
      ? value.messages
          .filter((entry) => entry && typeof entry === 'object')
          .map((entry) => {
            const message = entry as Record<string, unknown>;
            return {
              id: typeof message.id === 'string' ? message.id : randomId(),
              text: typeof message.text === 'string' ? message.text : '',
              type: (message.type as ChatMessageType | undefined) ?? 'text',
              mediaUri: typeof message.mediaUri === 'string' ? message.mediaUri : undefined,
              durationMs: typeof message.durationMs === 'number' ? message.durationMs : undefined,
              dilemma: normalizeDilemmaPayload(message.dilemma),
              ephemeral: typeof message.ephemeral === 'boolean' ? message.ephemeral : undefined,
              secure: typeof message.secure === 'boolean' ? message.secure : undefined,
              secureKind:
                message.secureKind === 'pdf' || message.secureKind === 'video' || message.secureKind === 'image'
                  ? message.secureKind
                  : undefined,
              secureDurationSec:
                typeof message.secureDurationSec === 'number' ? message.secureDurationSec : undefined,
              expiresAt: typeof message.expiresAt === 'number' ? message.expiresAt : undefined,
              timestamp: typeof message.timestamp === 'number' ? message.timestamp : nowMs(),
              senderId: typeof message.senderId === 'string' ? message.senderId : null,
              senderKind: message.senderKind === 'system' ? 'system' : 'user',
              hiddenAt: typeof message.hiddenAt === 'number' ? message.hiddenAt : undefined,
              hiddenBy: typeof message.hiddenBy === 'string' ? message.hiddenBy : undefined,
              hiddenReason: typeof message.hiddenReason === 'string' ? message.hiddenReason : undefined,
            } satisfies StoredMessage;
          })
      : [],
  };
}

function normalizeDilemmaPayload(input: unknown): ChatDilemmaPayload | undefined {
  if (!input || typeof input !== 'object') {
    return undefined;
  }

  const value = input as Record<string, unknown>;
  const scenarioId = typeof value.scenarioId === 'string' ? value.scenarioId : '';
  const question = typeof value.question === 'string' ? value.question : '';
  const choices = Array.isArray(value.choices)
    ? value.choices.filter((entry): entry is string => typeof entry === 'string')
    : [];
  const sourceMessageId = typeof value.sourceMessageId === 'string' ? value.sourceMessageId : undefined;
  const selectedChoiceIndex = typeof value.selectedChoiceIndex === 'number' ? value.selectedChoiceIndex : undefined;
  const selectedChoiceLabel = typeof value.selectedChoiceLabel === 'string' ? value.selectedChoiceLabel : undefined;

  if (!scenarioId && !sourceMessageId) {
    return undefined;
  }

  return {
    scenarioId: scenarioId || 'shared',
    question,
    choices,
    sourceMessageId,
    selectedChoiceIndex,
    selectedChoiceLabel,
  };
}

function normalizeStoredReport(input: unknown): StoredReport | null {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const value = input as Record<string, unknown>;
  if (typeof value.id !== 'string') {
    return null;
  }

  return {
    id: value.id,
    type: 'message',
    status: value.status === 'dismissed' ? 'dismissed' : value.status === 'resolved' ? 'resolved' : 'open',
    reporterUserId: typeof value.reporterUserId === 'string' ? value.reporterUserId : '',
    reportedUserId: typeof value.reportedUserId === 'string' ? value.reportedUserId : '',
    threadId: typeof value.threadId === 'string' ? value.threadId : '',
    messageId: typeof value.messageId === 'string' ? value.messageId : '',
    messagePreview: typeof value.messagePreview === 'string' ? value.messagePreview : '',
    reason: typeof value.reason === 'string' ? value.reason : '',
    createdAt: typeof value.createdAt === 'number' ? value.createdAt : nowMs(),
    updatedAt: typeof value.updatedAt === 'number' ? value.updatedAt : nowMs(),
    resolvedAt: typeof value.resolvedAt === 'number' ? value.resolvedAt : null,
    resolvedBy: typeof value.resolvedBy === 'string' ? value.resolvedBy : null,
    resolution: value.resolution === 'hide-message' || value.resolution === 'suspend-user' || value.resolution === 'resolve' || value.resolution === 'dismiss'
      ? value.resolution
      : null,
    resolutionNote: typeof value.resolutionNote === 'string' ? value.resolutionNote : null,
  };
}

function normalizeStoredSync(input: unknown): StoredSyncState {
  if (!input || typeof input !== 'object') {
    return { version: 0, updatedAt: 0, reason: 'init' };
  }

  const value = input as Record<string, unknown>;
  return {
    version: typeof value.version === 'number' ? value.version : 0,
    updatedAt: typeof value.updatedAt === 'number' ? value.updatedAt : 0,
    reason: typeof value.reason === 'string' ? value.reason : 'init',
    reportId: typeof value.reportId === 'string' ? value.reportId : undefined,
  };
}

async function getUserById(userId: string) {
  return normalizeStoredUser(await readJson(userKey(userId)));
}

async function getThreadById(threadId: string) {
  return normalizeStoredThread(await readJson(threadKey(threadId)));
}

async function getReportById(reportId: string) {
  return normalizeStoredReport(await readJson(reportKey(reportId)));
}

async function getSyncState(userId: string) {
  return normalizeStoredSync(await readJson(syncKey(userId)));
}

async function setSyncState(userId: string, reason: string, reportId?: string) {
  const previous = await getSyncState(userId);
  const nextVersion = Math.max(nowMs(), previous.version + 1);
  const nextState: StoredSyncState = {
    version: nextVersion,
    updatedAt: nowMs(),
    reason,
    reportId,
  };
  await writeJson(syncKey(userId), nextState);
  return nextState;
}

async function bumpUsersSync(userIds: string[], reason: string, reportId?: string) {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  await Promise.all(uniqueIds.map((userId) => setSyncState(userId, reason, reportId)));
}

async function getThreadIdsForUser(userId: string) {
  return (await readJson<string[]>(userThreadsKey(userId))) ?? [];
}

async function setThreadIdsForUser(userId: string, threadIds: string[]) {
  await writeJson(userThreadsKey(userId), Array.from(new Set(threadIds)));
}

async function addThreadToUser(userId: string, threadId: string) {
  const threadIds = await getThreadIdsForUser(userId);
  if (!threadIds.includes(threadId)) {
    await setThreadIdsForUser(userId, [...threadIds, threadId]);
  }
}

async function removeThreadFromUser(userId: string, threadId: string) {
  const threadIds = await getThreadIdsForUser(userId);
  await setThreadIdsForUser(
    userId,
    threadIds.filter((entry) => entry !== threadId)
  );
}

async function saveUser(user: StoredUser, reason = 'user-updated') {
  const previous = await getUserById(user.id);
  const nextUser: StoredUser = {
    ...user,
    sessionTokens: Array.from(new Set(user.sessionTokens)),
    sessionToken: user.sessionTokens[0] ?? user.sessionToken,
    isAdmin: computeIsAdmin(user.emailLower),
    updatedAt: nowMs(),
    lastActiveAt: nowMs(),
  };

  await writeJson(userKey(nextUser.id), nextUser);

  if (previous?.emailLower && previous.emailLower !== nextUser.emailLower) {
    await store.delete(emailIndexKey(previous.emailLower));
  }

  if (nextUser.emailLower) {
    await store.set(emailIndexKey(nextUser.emailLower), nextUser.id);
  }

  await Promise.all(
    nextUser.sessionTokens.map((token) =>
      writeJson(sessionKey(token), {
        userId: nextUser.id,
        createdAt: nextUser.createdAt,
        lastActiveAt: nextUser.lastActiveAt,
      } satisfies StoredSession)
    )
  );
  await bumpUsersSync([nextUser.id], reason);
  return nextUser;
}

async function saveThread(thread: StoredThread, reason = 'thread-updated') {
  pruneThreadTypingState(thread);
  pruneThreadMessages(thread);
  const nextThread: StoredThread = {
    ...thread,
    updatedAt: nowMs(),
  };
  await writeJson(threadKey(nextThread.id), nextThread);
  await bumpUsersSync(nextThread.memberIds, reason);
  return nextThread;
}

async function saveReport(report: StoredReport) {
  const nextReport: StoredReport = {
    ...report,
    updatedAt: nowMs(),
  };
  await writeJson(reportKey(nextReport.id), nextReport);
  return nextReport;
}

async function getAllUsers() {
  const keys = await listJsonKeys('users/');
  const users = await Promise.all(keys.map((key) => readJson(key)));
  return users
    .map((entry) => normalizeStoredUser(entry))
    .filter((entry): entry is StoredUser => Boolean(entry));
}

async function getAllReports() {
  const keys = await listJsonKeys('reports/');
  const reports = await Promise.all(keys.map((key) => readJson(key)));
  return reports
    .map((entry) => normalizeStoredReport(entry))
    .filter((entry): entry is StoredReport => Boolean(entry));
}

async function getUserByEmail(emailLower: string) {
  const indexedUserId = await store.get(emailIndexKey(emailLower), { type: 'text' });
  if (indexedUserId && typeof indexedUserId === 'string') {
    const indexedUser = await getUserById(indexedUserId);
    if (indexedUser?.emailLower === emailLower) {
      return indexedUser;
    }
  }

  const users = await getAllUsers();
  const fallback = users.find((user) => user.emailLower === emailLower) ?? null;
  if (fallback?.emailLower) {
    await store.set(emailIndexKey(fallback.emailLower), fallback.id);
  }
  return fallback;
}

function getVisibleMessages(thread: StoredThread) {
  const now = nowMs();
  return thread.messages.filter((message) => !message.hiddenAt && (!message.expiresAt || message.expiresAt > now));
}

function getLatestVisibleMessage(thread: StoredThread) {
  const visibleMessages = getVisibleMessages(thread);
  return visibleMessages[visibleMessages.length - 1] ?? null;
}

function getAnsweredScenarioIds(user: StoredUser) {
  return Object.values(user.answers)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((answer) => answer.scenarioId);
}

function toRemoteUser(user: StoredUser): RemoteUserSnapshot {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    birthYear: user.birthYear,
    gender: user.gender,
    seeking: user.seeking,
    hasCompletedOnboarding: user.hasCompletedOnboarding,
    selectedLevel: user.selectedLevel,
    userVector: user.userVector,
    profileCompletion: user.profileCompletion,
    answeredScenarioIds: getAnsweredScenarioIds(user),
    email: user.emailLower,
    isAdmin: user.isAdmin,
    isSuspended: Boolean(user.suspendedAt),
    suspensionReason: user.suspensionReason,
  };
}

function toMatchProfile(contact: StoredUser, thread: StoredThread): MatchProfile {
  const isPrivate = (contact as any).profileVisibility === 'private';
  return {
    id: contact.id,
    name: contact.name,
    avatar: contact.avatar,
    compatibilityScore: isPrivate ? 0 : thread.compatibilityScore,
    compatibilityReasons: isPrivate ? [] : thread.compatibilityReasons,
    traits: isPrivate ? { sociability: 0, humor: 0, risk: 0, emotion: 0, conflict: 0, stability: 0 } : contact.userVector,
    profilePhotos: isPrivate ? [] : (contact.profilePhotos ?? []),
    favoriteScenarioIds: isPrivate ? [] : (contact.favoriteScenarioIds ?? []),
    profileVisibility: (contact as any).profileVisibility ?? 'public',
  };
}

function toClientMessage(
  message: StoredMessage,
  userId: string,
  contactId: string,
  recipientLastReadAt: number
): ChatMessage {
  const senderId = message.senderKind === 'system'
    ? 'system'
    : message.senderId === userId
      ? 'me'
      : contactId;

  return {
    id: message.id,
    text: message.text,
    senderId,
    timestamp: message.timestamp,
    type: message.type,
    mediaUri: message.mediaUri,
    durationMs: message.durationMs,
    dilemma: message.dilemma,
    ephemeral: message.ephemeral,
    secure: message.secure,
    secureKind: message.secureKind,
    secureDurationSec: message.secureDurationSec,
    expiresAt: message.expiresAt,
    seenByRecipient: senderId === 'me' ? message.timestamp <= recipientLastReadAt : undefined,
  };
}

function isUserOnline(user: StoredUser) {
  return nowMs() - user.lastActiveAt <= ONLINE_WINDOW_MS;
}

function isUserTyping(thread: StoredThread, userId: string) {
  const typingAt = thread.typingByUserId?.[userId] ?? 0;
  return typingAt > 0 && nowMs() - typingAt <= TYPING_WINDOW_MS;
}

async function getUserPresence(user: StoredUser) {
  const sessionEntries = await Promise.all(
    user.sessionTokens.map((token) => readJson<StoredSession>(sessionKey(token)))
  );

  const activeLastSeenAt = sessionEntries.reduce((latest, entry) => {
    if (!entry?.lastActiveAt) return latest;
    return Math.max(latest, entry.lastActiveAt);
  }, user.lastActiveAt ?? 0);

  return {
    isOnline: nowMs() - activeLastSeenAt <= ONLINE_WINDOW_MS,
    lastSeenAt: activeLastSeenAt || user.lastActiveAt,
  };
}

function getUnreadState(thread: StoredThread, userId: string) {
  const lastMessage = getLatestVisibleMessage(thread);
  if (!lastMessage || lastMessage.senderKind === 'system' || lastMessage.senderId === userId) {
    return false;
  }

  const lastReadAt = thread.lastReadAt[userId] ?? 0;
  return lastMessage.timestamp > lastReadAt;
}

function assertActiveUser(user: StoredUser, fallbackMessage = 'Ce compte est suspendu.') {
  if (user.suspendedAt) {
    throw new HttpError(403, user.suspensionReason || fallbackMessage);
  }
}

function assertAdminUser(user: StoredUser) {
  if (!user.isAdmin) {
    throw new HttpError(403, 'Acces admin refuse.');
  }
}

function getProfileSignalReliability(answerCount: number) {
  return Math.max(0.55, Math.min(1, answerCount / PROFILE_COMPLETION_TARGET));
}

function getSeekingAlignmentBonus(user: StoredUser, candidate: StoredUser) {
  return user.seeking && candidate.seeking && user.seeking === candidate.seeking
    ? MATCH_SEEKING_ALIGNMENT_BONUS
    : 0;
}

function getLevelAlignmentBonus(user: StoredUser, candidate: StoredUser) {
  return user.selectedLevel === candidate.selectedLevel ? MATCH_LEVEL_ALIGNMENT_BONUS : 0;
}

function getRecentActivityBonus(candidate: StoredUser) {
  const hoursSinceActive = (nowMs() - candidate.lastActiveAt) / 3_600_000;

  if (hoursSinceActive <= 24) return MATCH_ACTIVITY_RECENCY_BONUS;
  if (hoursSinceActive <= 72) return MATCH_ACTIVITY_RECENCY_BONUS * 0.5;
  if (hoursSinceActive <= 168) return 1;

  return 0;
}

function scoreMatchCandidate(
  user: StoredUser,
  candidate: StoredUser,
  similarity: number,
  nextAnswerCount: number
) {
  const baseScore = similarityToPercent(similarity);
  const reliability = (
    getProfileSignalReliability(nextAnswerCount) + getProfileSignalReliability(candidate.answersCount)
  ) / 2;
  const answerGapPenalty = Math.min(8, Math.abs(nextAnswerCount - candidate.answersCount) * MATCH_ANSWER_GAP_PENALTY);

  return clampMatchScore(
    baseScore * reliability +
      getSeekingAlignmentBonus(user, candidate) +
      getLevelAlignmentBonus(user, candidate) +
      getRecentActivityBonus(candidate) -
      answerGapPenalty
  );
}

function buildMatchReasons(user: StoredUser, nextVector: UserVector, candidate: StoredUser) {
  const reasons = generateCompatibilityReasons(nextVector, candidate.userVector);

  if (user.seeking && candidate.seeking && user.seeking === candidate.seeking) {
    reasons.unshift('Même intention relationnelle');
  }

  if (user.selectedLevel === candidate.selectedLevel && user.selectedLevel !== 'standard') {
    reasons.unshift('Même intensité d’échange');
  }

  return Array.from(new Set(reasons)).slice(0, 3);
}

async function getAdminUsers() {
  const users = await getAllUsers();
  return users.filter((user) => user.isAdmin);
}

async function notifyAdmins(reason: string, reportId?: string) {
  const admins = await getAdminUsers();
  await bumpUsersSync(admins.map((admin) => admin.id), reason, reportId);
}

async function issueSession(user: StoredUser) {
  const sessionToken = randomToken();
  const nextUser: StoredUser = {
    ...user,
    sessionTokens: [...user.sessionTokens, sessionToken],
  };
  await saveUser(nextUser, 'session-issued');
  return {
    sessionToken,
    user: nextUser,
  };
}

async function waitForSyncChange(userId: string, lastVersion: number) {
  const deadline = nowMs() + SYNC_WAIT_TIMEOUT_MS;
  let current = await getSyncState(userId);

  while (current.version <= lastVersion && nowMs() < deadline) {
    await sleep(SYNC_WAIT_INTERVAL_MS);
    current = await getSyncState(userId);
  }

  return {
    changed: current.version > lastVersion,
    syncVersion: current.version,
    reason: current.reason,
    reportId: current.reportId,
  };
}

export async function getUserBySessionToken(sessionToken: string) {
  const session = await readJson<StoredSession>(sessionKey(sessionToken));
  if (!session?.userId) {
    return null;
  }

  const user = await getUserById(session.userId);
  if (!user) {
    return null;
  }

  await writeJson(sessionKey(sessionToken), {
    ...session,
    lastActiveAt: nowMs(),
  } satisfies StoredSession);

  return user;
}

export async function buildSnapshot(userId: string): Promise<RemoteSnapshot> {
  const user = await getUserById(userId);
  if (!user) {
    throw new HttpError(404, 'Utilisateur introuvable.');
  }

  const [threadIds, syncState] = await Promise.all([
    getThreadIdsForUser(userId),
    getSyncState(userId),
  ]);
  const threads = (
    await Promise.all(threadIds.map((threadId) => getThreadById(threadId)))
  ).filter((thread): thread is StoredThread => Boolean(thread));

  const sortedThreads = [...threads].sort((a, b) => {
    const aLast = getLatestVisibleMessage(a)?.timestamp ?? a.createdAt;
    const bLast = getLatestVisibleMessage(b)?.timestamp ?? b.createdAt;
    return bLast - aLast;
  });

  const contacts = await Promise.all(
    sortedThreads.map(async (thread) => {
      const contactId = thread.memberIds.find((memberId) => memberId !== userId);
      if (!contactId) {
        return null;
      }

      const contact = await getUserById(contactId);
      if (!contact) {
        return null;
      }

      const presence = await getUserPresence(contact);

      return { contact, thread, presence };
    })
  );

  const validContacts = contacts.filter(
    (entry): entry is { contact: StoredUser; thread: StoredThread; presence: { isOnline: boolean; lastSeenAt: number } } => Boolean(entry)
  );

  return {
    user: toRemoteUser(user),
    matches: validContacts.map(({ contact, thread }) => toMatchProfile(contact, thread)),
    chats: validContacts.map(({ contact, thread, presence }) => {
      const lastMessage = getLatestVisibleMessage(thread);
      const recipientLastReadAt = thread.lastReadAt[contact.id] ?? 0;
      return {
        contactId: contact.id,
        contactName: contact.name,
        contactAvatar: contact.avatar,
        messages: lastMessage ? [toClientMessage(lastMessage, userId, contact.id, recipientLastReadAt)] : [],
        unread: getUnreadState(thread, userId),
        isContactOnline: presence.isOnline,
        contactLastSeenAt: presence.lastSeenAt,
        isContactTyping: isUserTyping(thread, contact.id),
        ephemeralMode24h: Boolean(thread.ephemeralMode24h),
      };
    }),
    syncVersion: syncState.version,
  };
}

export async function upsertSessionProfile(input: {
  sessionToken?: string;
  name: string;
  avatar: string;
  birthYear: string;
  gender: string;
  seeking: string;
  email?: string;
  password?: string;
}) {
  const sessionToken = input.sessionToken?.trim() || randomToken();
  const emailLower = normalizeEmail(input.email);
  const password = input.password?.trim() ?? '';
  const existingBySession = await getUserBySessionToken(sessionToken);
  const existingByEmail = emailLower ? await getUserByEmail(emailLower) : null;
  const isGuestCreation = !existingBySession && !emailLower && !password;

  if (emailLower && !isValidEmail(emailLower)) {
    throw new HttpError(400, 'Email invalide.');
  }

  if (!existingBySession && !isGuestCreation && (!emailLower || !password)) {
    throw new HttpError(400, 'Email et mot de passe requis pour creer un compte.');
  }

  if (password) {
    ensurePassword(password);
  }

  if (existingByEmail && (!existingBySession || existingByEmail.id !== existingBySession.id)) {
    throw new HttpError(409, 'Cet email est deja utilise.');
  }

  const now = nowMs();
  let passwordSalt = existingBySession?.passwordSalt ?? null;
  let passwordHash = existingBySession?.passwordHash ?? null;

  if (password) {
    passwordSalt = randomToken();
    passwordHash = await hashPassword(password, passwordSalt);
  }

  const user: StoredUser = existingBySession
    ? {
        ...existingBySession,
        sessionTokens: existingBySession.sessionTokens.includes(sessionToken)
          ? existingBySession.sessionTokens
          : [...existingBySession.sessionTokens, sessionToken],
        name: input.name,
        avatar: input.avatar,
        birthYear: input.birthYear,
        gender: input.gender,
        seeking: input.seeking,
        emailLower: emailLower ?? existingBySession.emailLower,
        passwordSalt: passwordSalt ?? existingBySession.passwordSalt,
        passwordHash: passwordHash ?? existingBySession.passwordHash,
        hasCompletedOnboarding: true,
        updatedAt: now,
        lastActiveAt: now,
      }
    : {
        id: randomId(),
        sessionTokens: [sessionToken],
        sessionToken,
        name: input.name,
        avatar: input.avatar,
        birthYear: input.birthYear,
        gender: input.gender,
        seeking: input.seeking,
        hasCompletedOnboarding: !isGuestCreation,
        selectedLevel: 'standard',
        userVector: { ...INITIAL_VECTOR },
        answers: {},
        answersCount: 0,
        profileCompletion: 0,
        emailLower: emailLower ?? null,
        passwordHash: passwordHash ?? null,
        passwordSalt: passwordSalt ?? null,
        isAdmin: computeIsAdmin(emailLower ?? null),
        suspendedAt: null,
        suspensionReason: null,
        createdAt: now,
        updatedAt: now,
        lastActiveAt: now,
      };

  const savedUser = await saveUser(user, 'profile-updated');
  await setThreadIdsForUser(savedUser.id, await getThreadIdsForUser(savedUser.id));

  const snapshot = await buildSnapshot(savedUser.id);

  return {
    sessionToken,
    ...snapshot,
  } satisfies SessionPayload;
}

export async function loginWithPassword(email: string, password: string) {
  const emailLower = normalizeEmail(email);
  if (!emailLower || !isValidEmail(emailLower)) {
    throw new HttpError(400, 'Email invalide.');
  }

  const user = await getUserByEmail(emailLower);
  if (!user || !user.passwordHash || !user.passwordSalt) {
    throw new HttpError(401, 'Identifiants invalides.');
  }

  const passwordOk = await verifyPassword(password, user.passwordSalt, user.passwordHash);
  if (!passwordOk) {
    throw new HttpError(401, 'Identifiants invalides.');
  }

  assertActiveUser(user, 'Compte suspendu. Contacte le support.');

  const issued = await issueSession(user);
  const snapshot = await buildSnapshot(issued.user.id);

  return {
    sessionToken: issued.sessionToken,
    ...snapshot,
  } satisfies SessionPayload;
}

export async function logoutSession(user: StoredUser, sessionToken: string) {
  const nextTokens = user.sessionTokens.filter((token) => token !== sessionToken);
  await saveUser({
    ...user,
    sessionTokens: nextTokens,
    sessionToken: nextTokens[0] ?? undefined,
  }, 'session-removed');
  await store.delete(sessionKey(sessionToken));
}

export async function waitForUserRealtimeChange(user: StoredUser, lastVersion: number) {
  return waitForSyncChange(user.id, lastVersion);
}

export async function loadChatThread(userId: string, contactId: string) {
  const [thread, contact] = await Promise.all([
    getThreadById(threadIdForUsers(userId, contactId)),
    getUserById(contactId),
  ]);

  if (!thread) {
    throw new HttpError(404, 'Discussion introuvable.');
  }

  if (!contact) {
    throw new HttpError(404, 'Contact introuvable.');
  }

  const presence = await getUserPresence(contact);

  pruneThreadMessages(thread);

  const visibleMessages = getVisibleMessages(thread)
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp);
  const trimmedMessages = visibleMessages.slice(Math.max(0, visibleMessages.length - THREAD_VISIBLE_HISTORY_LIMIT));

  return {
    contactId: contact.id,
    contactName: contact.name,
    contactAvatar: contact.avatar,
    messages: trimmedMessages
      .map((message) => toClientMessage(message, userId, contact.id, thread.lastReadAt[contact.id] ?? 0)),
    unread: false,
    isContactOnline: presence.isOnline,
    contactLastSeenAt: presence.lastSeenAt,
    isContactTyping: isUserTyping(thread, contact.id),
    ephemeralMode24h: Boolean(thread.ephemeralMode24h),
  } as ChatThread;
}

export async function markThreadRead(userId: string, contactId: string) {
  const thread = await getThreadById(threadIdForUsers(userId, contactId));
  if (!thread) {
    throw new HttpError(404, 'Discussion introuvable.');
  }

  thread.lastReadAt[userId] = nowMs();
  await saveThread(thread, 'thread-read');
}

export async function setThreadTypingState(userId: string, contactId: string, isTyping: boolean) {
  const thread = await getThreadById(threadIdForUsers(userId, contactId));
  if (!thread) {
    throw new HttpError(404, 'Discussion introuvable.');
  }

  pruneThreadTypingState(thread);
  const typingByUserId = { ...(thread.typingByUserId ?? {}) };
  if (isTyping) {
    typingByUserId[userId] = nowMs();
  } else {
    delete typingByUserId[userId];
  }

  thread.typingByUserId = typingByUserId;
  await saveThread(thread, isTyping ? 'typing-started' : 'typing-stopped');
}

export async function setThreadEphemeralMode(userId: string, contactId: string, enabled: boolean) {
  const thread = await getThreadById(threadIdForUsers(userId, contactId));
  if (!thread) {
    throw new HttpError(404, 'Discussion introuvable.');
  }

  thread.ephemeralMode24h = enabled;
  await saveThread(thread, enabled ? 'ephemeral-mode-enabled' : 'ephemeral-mode-disabled');
  return loadChatThread(userId, contactId);
}

export async function sendMessageToContact(userId: string, contactId: string, message: ChatMessageInput) {
  const [thread, user, contact] = await Promise.all([
    getThreadById(threadIdForUsers(userId, contactId)),
    getUserById(userId),
    getUserById(contactId),
  ]);

  if (!thread) {
    throw new HttpError(404, 'Match introuvable pour cette discussion.');
  }

  if (!user || !contact) {
    throw new HttpError(404, 'Discussion introuvable.');
  }

  assertActiveUser(user);
  assertActiveUser(contact, 'Ce compte ne peut plus recevoir de messages.');

  const safeMessage = sanitizeChatMessageInput(message);
  pruneThreadMessages(thread);
  assertMessageRateLimit(thread, userId);

  const timestamp = nowMs();
  const expiresAt = thread.ephemeralMode24h ? timestamp + THREAD_EPHEMERAL_DURATION_MS : safeMessage.expiresAt;
  thread.messages.push({
    id: randomId(),
    text: safeMessage.text,
    type: safeMessage.type ?? 'text',
    mediaUri: safeMessage.mediaUri,
    durationMs: safeMessage.durationMs,
    dilemma: safeMessage.dilemma,
    ephemeral: safeMessage.ephemeral,
    secure: safeMessage.secure,
    secureKind: safeMessage.secureKind,
    secureDurationSec: safeMessage.secureDurationSec,
    expiresAt,
    timestamp,
    senderId: userId,
    senderKind: 'user',
  });
  pruneThreadMessages(thread);
  thread.lastReadAt[userId] = timestamp;
  if (thread.typingByUserId?.[userId]) {
    delete thread.typingByUserId[userId];
  }
  await saveThread(thread, 'message-sent');

  return loadChatThread(userId, contactId);
}

async function createMatchIfNeeded(user: StoredUser, nextVector: UserVector, nextAnswerCount: number) {
  const shouldAttemptMatch =
    nextAnswerCount >= MATCH_DISCOVERY_START &&
    (nextAnswerCount === MATCH_DISCOVERY_START ||
      (nextAnswerCount - MATCH_DISCOVERY_START) % MATCH_DISCOVERY_INTERVAL === 0);

  if (!shouldAttemptMatch) {
    return null;
  }

  const existingThreadIds = await getThreadIdsForUser(user.id);
  const existingContacts = new Set(
    await Promise.all(
      existingThreadIds.map(async (threadId) => {
        const thread = await getThreadById(threadId);
        return thread?.memberIds.find((memberId) => memberId !== user.id) ?? null;
      })
    )
  );

  const candidates = await getAllUsers();

  let bestCandidates: Array<{ candidate: StoredUser; score: number; similarity: number }> = [];
  let fallbackCandidates: Array<{ candidate: StoredUser; score: number; similarity: number }> = [];

  for (const candidate of candidates) {
    if (
      candidate.id === user.id ||
      candidate.suspendedAt ||
      !candidate.hasCompletedOnboarding ||
      candidate.answersCount < MATCH_DISCOVERY_START ||
      existingContacts.has(candidate.id)
    ) {
      continue;
    }

    const similarity = cosineSimilarity(nextVector, candidate.userVector);
    const score = scoreMatchCandidate(user, candidate, similarity, nextAnswerCount);
    fallbackCandidates.push({ candidate, score, similarity });

    // Exclude profiles that are too identical (boring match) or below threshold
    if (similarity < MATCH_SIMILARITY_THRESHOLD || similarity > MATCH_SIMILARITY_MAX) {
      continue;
    }

    bestCandidates.push({ candidate, score, similarity });
  }

  if (bestCandidates.length === 0) {
    if (fallbackCandidates.length === 0) {
      return null;
    }

    fallbackCandidates.sort((a, b) => b.score - a.score);
    bestCandidates = [fallbackCandidates[0]];
  }

  // Sort by score descending, then pick randomly among top 3 to add diversity
  bestCandidates.sort((a, b) => b.score - a.score);
  const pool = bestCandidates.slice(0, 3);
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  const bestCandidate = chosen.candidate;
  const highestScore = chosen.score;

  const compatibilityReasons = buildMatchReasons(user, nextVector, bestCandidate);
  const threadId = threadIdForUsers(user.id, bestCandidate.id);
  const now = nowMs();
  const { modified } = await writeJson(
    threadKey(threadId),
    {
      id: threadId,
      memberIds: normalizePair(user.id, bestCandidate.id),
      compatibilityScore: highestScore,
      compatibilityReasons: compatibilityReasons.length > 0 ? compatibilityReasons : ['Profils compatibles'],
      createdAt: now,
      updatedAt: now,
      lastReadAt: {
        [user.id]: now,
        [bestCandidate.id]: 0,
      },
      typingByUserId: {},
      ephemeralMode24h: false,
      messages: [
        {
          id: randomId(),
          text: SYSTEM_MATCH_MESSAGE,
          type: 'text',
          timestamp: now,
          senderId: null,
          senderKind: 'system',
        },
      ],
    } satisfies StoredThread,
    { onlyIfNew: true }
  );

  await addThreadToUser(user.id, threadId);
  await addThreadToUser(bestCandidate.id, threadId);

  if (!modified) {
    return null;
  }

  await bumpUsersSync([user.id, bestCandidate.id], 'match-created');

  return {
    id: bestCandidate.id,
    name: bestCandidate.name,
    avatar: bestCandidate.avatar,
    compatibilityScore: highestScore,
    compatibilityReasons: compatibilityReasons.length > 0 ? compatibilityReasons : ['Profils compatibles'],
    traits: bestCandidate.userVector,
  } satisfies MatchProfile;
}

export async function submitAnswerForUser(
  user: StoredUser,
  scenarioId: string,
  choiceIndex: number,
  reactionTimeMs: number
) {
  assertActiveUser(user);

  const scenario = SCENARIOS.find((entry) => entry.id === scenarioId);
  if (!scenario) {
    throw new HttpError(404, 'Dilemme introuvable.');
  }

  const choice = scenario.choices[choiceIndex];
  if (!choice) {
    throw new HttpError(400, 'Choix de reponse invalide.');
  }

  if (user.answers[scenarioId]) {
    const snapshot = await buildSnapshot(user.id);
    return {
      ...snapshot,
      pendingMatch: null,
    } satisfies AnswerPayload;
  }

  const nextVector = calculateProfile(user.userVector, choice.traitDeltas);
  const nextAnswerCount = user.answersCount + 1;
  const nextUser: StoredUser = {
    ...user,
    userVector: nextVector,
    answers: {
      ...user.answers,
      [scenarioId]: {
        scenarioId,
        choiceIndex,
        reactionTimeMs: Math.max(0, Math.round(reactionTimeMs)),
        timestamp: nowMs(),
      },
    },
    answersCount: nextAnswerCount,
    profileCompletion: Math.min(
      100,
      Math.round((nextAnswerCount / PROFILE_COMPLETION_TARGET) * 100)
    ),
  };

  const savedUser = await saveUser(nextUser, 'answer-submitted');
  const pendingMatch = await createMatchIfNeeded(savedUser, nextVector, nextAnswerCount);
  const snapshot = await buildSnapshot(savedUser.id);

  return {
    ...snapshot,
    pendingMatch,
  } satisfies AnswerPayload;
}

export async function createMessageReportForUser(input: {
  user: StoredUser;
  contactId: string;
  messageId: string;
  reason: string;
}) {
  assertActiveUser(input.user);

  const threadId = threadIdForUsers(input.user.id, input.contactId);
  const thread = await getThreadById(threadId);
  if (!thread) {
    throw new HttpError(404, 'Discussion introuvable.');
  }

  const message = thread.messages.find((entry) => entry.id === input.messageId);
  if (!message || message.senderKind !== 'user' || !message.senderId || message.senderId === input.user.id) {
    throw new HttpError(400, 'Message impossible a signaler.');
  }

  const report: StoredReport = {
    id: randomId(),
    type: 'message',
    status: 'open',
    reporterUserId: input.user.id,
    reportedUserId: message.senderId,
    threadId,
    messageId: message.id,
    messagePreview: message.text.slice(0, 180),
    reason: input.reason.trim() || 'Signalement utilisateur',
    createdAt: nowMs(),
    updatedAt: nowMs(),
    resolvedAt: null,
    resolvedBy: null,
    resolution: null,
    resolutionNote: null,
  };

  await saveReport(report);
  await bumpUsersSync([input.user.id], 'report-created', report.id);
  await notifyAdmins('report-created', report.id);

  return { ok: true, reportId: report.id };
}

async function toModerationSummary(report: StoredReport): Promise<ModerationReportSummary> {
  const [reporter, reported] = await Promise.all([
    getUserById(report.reporterUserId),
    getUserById(report.reportedUserId),
  ]);

  return {
    id: report.id,
    type: report.type,
    status: report.status,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    reason: report.reason,
    messageId: report.messageId,
    messagePreview: report.messagePreview,
    threadId: report.threadId,
    reporterUserId: report.reporterUserId,
    reporterName: reporter?.name ?? 'Utilisateur inconnu',
    reportedUserId: report.reportedUserId,
    reportedName: reported?.name ?? 'Utilisateur inconnu',
    resolution: report.resolution,
    resolutionNote: report.resolutionNote,
  };
}

export async function listModerationReports(user: StoredUser) {
  assertAdminUser(user);

  const reports = await getAllReports();
  const sorted = reports.sort((a, b) => {
    if (a.status === 'open' && b.status !== 'open') return -1;
    if (a.status !== 'open' && b.status === 'open') return 1;
    return b.createdAt - a.createdAt;
  });

  return Promise.all(sorted.map((report) => toModerationSummary(report)));
}

export async function moderateReport(input: {
  user: StoredUser;
  reportId: string;
  action: ModerationAction;
  note?: string;
}) {
  assertAdminUser(input.user);

  const report = await getReportById(input.reportId);
  if (!report) {
    throw new HttpError(404, 'Signalement introuvable.');
  }

  const note = input.note?.trim() || null;
  let impactedUserIds = [report.reporterUserId, report.reportedUserId, input.user.id];

  if (input.action === 'hide-message') {
    const thread = await getThreadById(report.threadId);
    if (!thread) {
      throw new HttpError(404, 'Conversation introuvable.');
    }

    const message = thread.messages.find((entry) => entry.id === report.messageId);
    if (!message) {
      throw new HttpError(404, 'Message introuvable.');
    }

    message.hiddenAt = nowMs();
    message.hiddenBy = input.user.id;
    message.hiddenReason = note ?? report.reason;
    await saveThread(thread, 'message-hidden');
    impactedUserIds = [...impactedUserIds, ...thread.memberIds];
  }

  if (input.action === 'suspend-user') {
    const reportedUser = await getUserById(report.reportedUserId);
    if (!reportedUser) {
      throw new HttpError(404, 'Utilisateur introuvable.');
    }

    await saveUser({
      ...reportedUser,
      suspendedAt: nowMs(),
      suspensionReason: note ?? report.reason,
    }, 'user-suspended');
  }

  const nextStatus = input.action === 'dismiss' ? 'dismissed' : 'resolved';
  await saveReport({
    ...report,
    status: nextStatus,
    resolvedAt: nowMs(),
    resolvedBy: input.user.id,
    resolution: input.action,
    resolutionNote: note,
  });

  await bumpUsersSync(impactedUserIds, 'report-moderated', report.id);
  await notifyAdmins('report-moderated', report.id);

  return {
    ok: true,
    report: await toModerationSummary((await getReportById(report.id))!),
  };
}

export async function deleteUserSession(userId: string) {
  const user = await getUserById(userId);
  if (!user) {
    return;
  }

  const threadIds = await getThreadIdsForUser(userId);

  for (const threadId of threadIds) {
    const thread = await getThreadById(threadId);
    if (!thread) {
      continue;
    }

    const otherMemberIds = thread.memberIds.filter((memberId) => memberId !== userId);
    await Promise.all(otherMemberIds.map((memberId) => removeThreadFromUser(memberId, threadId)));
    await store.delete(threadKey(threadId));
    await bumpUsersSync(otherMemberIds, 'thread-deleted');
  }

  await Promise.all(user.sessionTokens.map((token) => store.delete(sessionKey(token))));
  await Promise.all([
    store.delete(userThreadsKey(userId)),
    store.delete(userKey(userId)),
    store.delete(syncKey(userId)),
  ]);
}

function sanitizeChatMessageInput(message: ChatMessageInput): ChatMessageInput {
  const text = (message.text ?? '').trim();
  if (!text) {
    throw new HttpError(400, 'Message vide.');
  }

  if (text.length > MAX_MESSAGE_TEXT_LENGTH) {
    throw new HttpError(400, `Message trop long (max ${MAX_MESSAGE_TEXT_LENGTH} caracteres).`);
  }

  const mediaUri = message.mediaUri?.trim();
  if (mediaUri && mediaUri.length > MAX_MEDIA_URI_LENGTH) {
    throw new HttpError(400, 'Media trop volumineux pour etre envoye.');
  }

  const normalizedDilemma = message.dilemma
    ? {
        scenarioId: message.dilemma.scenarioId,
        question: (message.dilemma.question ?? '').slice(0, MAX_MESSAGE_TEXT_LENGTH),
        choices: (message.dilemma.choices ?? []).slice(0, MAX_DILEMMA_CHOICES),
        sourceMessageId: message.dilemma.sourceMessageId,
        selectedChoiceIndex: message.dilemma.selectedChoiceIndex,
        selectedChoiceLabel: message.dilemma.selectedChoiceLabel,
      }
    : undefined;

  return {
    ...message,
    text,
    mediaUri,
    dilemma: normalizedDilemma,
  };
}

function pruneThreadMessages(thread: StoredThread) {
  const now = nowMs();
  const filtered = thread.messages.filter((entry) => !entry.expiresAt || entry.expiresAt > now);
  if (filtered.length > THREAD_MAX_MESSAGES) {
    thread.messages = filtered.slice(filtered.length - THREAD_MAX_MESSAGES);
    return;
  }

  thread.messages = filtered;
}

function pruneThreadTypingState(thread: StoredThread) {
  if (!thread.typingByUserId) {
    return;
  }

  const now = nowMs();
  const nextTypingByUserId = Object.entries(thread.typingByUserId).reduce<Record<string, number>>((acc, [id, typingAt]) => {
    if (typeof typingAt === 'number' && now - typingAt <= TYPING_WINDOW_MS) {
      acc[id] = typingAt;
    }
    return acc;
  }, {});

  thread.typingByUserId = nextTypingByUserId;
}

function assertMessageRateLimit(thread: StoredThread, senderId: string) {
  const now = nowMs();
  const recentCount = thread.messages.reduce((count, entry) => {
    if (entry.senderKind !== 'user' || entry.senderId !== senderId) {
      return count;
    }

    if (now - entry.timestamp > MESSAGE_BURST_WINDOW_MS) {
      return count;
    }

    return count + 1;
  }, 0);

  if (recentCount >= MESSAGE_BURST_MAX) {
    throw new HttpError(429, 'Tu envoies trop vite. Reessaie dans quelques secondes.');
  }
}