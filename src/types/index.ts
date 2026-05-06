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

export interface Choice {
  label: string;
  traitDeltas: TraitDelta;
}

export interface Scenario {
  id: string;
  category: ScenarioCategory;
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
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: 'me' | 'system' | string;
  timestamp: number;
}

export interface ChatThread {
  contactId: string;
  contactName: string;
  contactAvatar: string;
  messages: ChatMessage[];
  unread: boolean;
}
