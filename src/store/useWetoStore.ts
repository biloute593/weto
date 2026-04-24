import { create } from 'zustand';
import { SCENARIOS, Scenario, TraitKey } from '../data/scenarios';

export interface UserTraits {
  sociability: number;
  emotionalReactivity: number;
  riskTolerance: number;
  humorStyle: number;
  conflictStyle: number;
  stability: number;
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
  compatibilityScore: number;
  compatibilityReasons: string[];
}

export interface ChatMessage {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

const INITIAL_TRAITS: UserTraits = {
  sociability: 50,
  emotionalReactivity: 50,
  riskTolerance: 50,
  humorStyle: 50,
  conflictStyle: 50,
  stability: 50,
};

const MOCK_MATCHES: MatchProfile[] = [
  {
    id: 'm1',
    name: 'Léa',
    avatar: '👩‍🦰',
    compatibilityScore: 89,
    compatibilityReasons: ['Humour similaire', 'Valeurs alignées', 'Style relationnel compatible'],
  },
  {
    id: 'm2',
    name: 'Thomas',
    avatar: '👨‍💼',
    compatibilityScore: 76,
    compatibilityReasons: ['Vision du risque proche', 'Style de conflit complémentaire'],
  },
  {
    id: 'm3',
    name: 'Emma',
    avatar: '👩‍🎨',
    compatibilityScore: 91,
    compatibilityReasons: ['Réactivité émotionnelle similaire', 'Humor Style +++', 'Même approche sociale'],
  },
];

const MOCK_CHATS: ChatMessage[] = [
  { id: 'c1', contactId: 'm3', contactName: 'Emma', contactAvatar: '👩‍🎨', lastMessage: 'On est grave sync sur ça !', timestamp: 'Hier', unread: true },
  { id: 'c2', contactId: 'm1', contactName: 'Léa', contactAvatar: '👩‍🦰', lastMessage: 'Haha j\'aurais jamais pensé répondre pareil 😄', timestamp: '09:41', unread: false },
  { id: 'c3', contactId: 'm2', contactName: 'Thomas', contactAvatar: '👨‍💼', lastMessage: 'Ce dilemme était crazy 😂', timestamp: 'Hier', unread: false },
  { id: 'c4', contactId: 'm4', contactName: 'Julien', contactAvatar: '👨‍🎤', lastMessage: 'Tu veux qu\'on en parle ?', timestamp: '2j', unread: false },
  { id: 'c5', contactId: 'm5', contactName: 'Chloé', contactAvatar: '👩‍💻', lastMessage: 'Trop hâte d\'en découvrir plus sur toi 😊', timestamp: '2j', unread: true },
];

interface WetoState {
  // Feed
  currentIndex: number;
  answers: Answer[];
  userTraits: UserTraits;
  answeredIds: Set<string>;
  startTime: number | null;
  scenarios: Scenario[];
  // Match
  matches: MatchProfile[];
  pendingMatch: MatchProfile | null;
  // Chat
  chats: ChatMessage[];
  // Profile
  profileCompletion: number;

  // Actions
  startAnswer: () => void;
  submitAnswer: (scenarioId: string, choiceIndex: number) => void;
  nextScenario: () => void;
  dismissMatch: () => void;
  sendScenario: (scenarioId: string, contactId: string) => void;
}

function clamp(v: number) {
  return Math.max(0, Math.min(100, v));
}

function calculateProfile(traits: UserTraits, deltas: Partial<Record<TraitKey, number>>): UserTraits {
  const updated = { ...traits };
  for (const key of Object.keys(deltas) as TraitKey[]) {
    updated[key] = clamp(updated[key] + (deltas[key] ?? 0));
  }
  return updated;
}

function getCompatibility(userTraits: UserTraits, answeredCount: number): MatchProfile | null {
  // Trigger a match every 5 answers during early game
  if (answeredCount > 0 && answeredCount % 5 === 0 && answeredCount <= 15) {
    const idx = (answeredCount / 5) - 1;
    return MOCK_MATCHES[idx] ?? null;
  }
  return null;
}

export const useWetoStore = create<WetoState>((set, get) => ({
  currentIndex: 0,
  answers: [],
  userTraits: { ...INITIAL_TRAITS },
  answeredIds: new Set(),
  startTime: null,
  scenarios: SCENARIOS,
  matches: [],
  pendingMatch: null,
  chats: MOCK_CHATS,
  profileCompletion: 0,

  startAnswer: () => set({ startTime: Date.now() }),

  submitAnswer: (scenarioId, choiceIndex) => {
    const { startTime, answers, userTraits, answeredIds, scenarios } = get();
    const reactionTimeMs = startTime ? Date.now() - startTime : 0;
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;

    const choice = scenario.choices[choiceIndex];
    const newTraits = calculateProfile(userTraits, choice.traitDeltas);
    const newAnswers = [
      ...answers,
      { scenarioId, choiceIndex, reactionTimeMs, timestamp: Date.now() },
    ];
    const newAnsweredIds = new Set(answeredIds);
    newAnsweredIds.add(scenarioId);

    const profileCompletion = Math.min(100, Math.round((newAnsweredIds.size / scenarios.length) * 100));
    const pendingMatch = getCompatibility(newTraits, newAnswers.length);
    const newMatches = pendingMatch
      ? [...get().matches, pendingMatch].filter(
          (m, i, arr) => arr.findIndex((x) => x.id === m.id) === i
        )
      : get().matches;

    set({
      answers: newAnswers,
      userTraits: newTraits,
      answeredIds: newAnsweredIds,
      startTime: null,
      pendingMatch,
      matches: newMatches,
      profileCompletion,
    });
  },

  nextScenario: () => {
    const { currentIndex, scenarios } = get();
    if (currentIndex < scenarios.length - 1) {
      set({ currentIndex: currentIndex + 1, startTime: Date.now() });
    }
  },

  dismissMatch: () => set({ pendingMatch: null }),

  sendScenario: (scenarioId, contactId) => {
    // Simulate sending a scenario as DM
    console.log(`Scenario ${scenarioId} sent to contact ${contactId}`);
  },
}));
