// ─── Core Types ─────────────────────────────────────────────────────
// Central type definitions for Weto app

export type TraitKey =
  | 'sociability'
  | 'humor'
  | 'risk'
  | 'emotion'
  | 'conflict'
  | 'stability';

export type TraitDelta = Partial<Record<TraitKey, number>>;

export interface UserVector {
  sociability: number;
  humor: number;
  risk: number;
  emotion: number;
  conflict: number;
  stability: number;
}

export type ScenarioCategory = 'Social' | 'Absurd' | 'Values' | 'Relationship';

export type ScenarioLevel = 'standard' | 'intense' | 'fire';
export type ThemeMode = 'light' | 'dark';
export type ProfileVisibility = 'public' | 'matches' | 'private';

export interface Choice {
  label: string;
  traitDeltas: TraitDelta;
}

export interface Scenario {
  id: string;
  category: ScenarioCategory;
  level?: ScenarioLevel;
  question: string;
  choices: Choice[];
}

export interface Answer {
  scenarioId: string;
  choiceIndex: number;
  reactionTimeMs: number;
  timestamp: number;
}

export interface MatchProfile {
  id: string;
  name: string;
  avatar: string;
  traits: UserVector;
  compatibilityScore: number;
  compatibilityReasons: string[];
  profilePhotos?: string[];
  favoriteScenarioIds?: string[];
  profileVisibility?: ProfileVisibility;
}

export interface ChatDilemmaPayload {
  scenarioId: string;
  question: string;
  choices: string[];
  sourceMessageId?: string;
  selectedChoiceIndex?: number;
  selectedChoiceLabel?: string;
}

export type ChatMessageType =
  | 'text'
  | 'call'
  | 'image'
  | 'video'
  | 'voice'
  | 'flame'
  | 'file'
  | 'dilemma'
  | 'dilemma-response';

export interface ChatMessageInput {
  text: string;
  type?: ChatMessageType;
  mediaUri?: string;
  durationMs?: number;
  dilemma?: ChatDilemmaPayload;
  ephemeral?: boolean;
  secure?: boolean;
  secureKind?: 'pdf' | 'video' | 'image';
  secureDurationSec?: number;
  expiresAt?: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: 'me' | 'system' | string;
  timestamp: number;
  type?: ChatMessageType;
  mediaUri?: string;
  durationMs?: number;
  dilemma?: ChatDilemmaPayload;
  ephemeral?: boolean;
  secure?: boolean;
  secureKind?: 'pdf' | 'video' | 'image';
  secureDurationSec?: number;
  expiresAt?: number;
  seenByRecipient?: boolean;
}

export interface ChatThread {
  contactId: string;
  contactName: string;
  contactAvatar: string;
  messages: ChatMessage[];
  unread: boolean;
  isContactOnline?: boolean;
  contactLastSeenAt?: number;
  isContactTyping?: boolean;
  ephemeralMode24h?: boolean;
}

export type ModerationAction = 'hide-message' | 'suspend-user' | 'resolve' | 'dismiss';

export interface ModerationReportSummary {
  id: string;
  type: 'message';
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: number;
  updatedAt: number;
  reason: string;
  messageId: string;
  messagePreview: string;
  threadId: string;
  reporterUserId: string;
  reporterName: string;
  reportedUserId: string;
  reportedName: string;
  resolution: ModerationAction | null;
  resolutionNote: string | null;
}

export interface AnalyticsEventSummary {
  eventName: string;
  total: number;
  today: number;
  lastSeenAt: number | null;
}

export interface AnalyticsRecentEvent {
  id: string;
  eventName: string;
  timestamp: number;
  pathname: string | null;
  surface: 'web' | 'native';
  sessionId: string;
}

export interface AnalyticsSummary {
  generatedAt: number;
  windowDays: number;
  totalEvents: number;
  uniqueSessions: number;
  byEvent: AnalyticsEventSummary[];
  recentEvents: AnalyticsRecentEvent[];
}
