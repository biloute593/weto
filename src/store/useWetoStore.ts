import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  traits: UserTraits;
  compatibilityScore: number;
  compatibilityReasons: string[];
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: 'me' | string;
  timestamp: number;
}

export interface ChatThread {
  contactId: string;
  contactName: string;
  contactAvatar: string;
  messages: ChatMessage[];
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

// Database of mock users for the dynamic matching engine
const MOCK_DB: MatchProfile[] = [
  { id: 'm1', name: 'Léa', avatar: '👩‍🦰', compatibilityScore: 0, compatibilityReasons: [], traits: { sociability: 80, emotionalReactivity: 40, riskTolerance: 60, humorStyle: 70, conflictStyle: 30, stability: 80 } },
  { id: 'm2', name: 'Thomas', avatar: '👨‍💼', compatibilityScore: 0, compatibilityReasons: [], traits: { sociability: 40, emotionalReactivity: 60, riskTolerance: 40, humorStyle: 60, conflictStyle: 70, stability: 50 } },
  { id: 'm3', name: 'Emma', avatar: '👩‍🎨', compatibilityScore: 0, compatibilityReasons: [], traits: { sociability: 90, emotionalReactivity: 80, riskTolerance: 70, humorStyle: 90, conflictStyle: 40, stability: 40 } },
  { id: 'm4', name: 'Julien', avatar: '👨‍🎤', compatibilityScore: 0, compatibilityReasons: [], traits: { sociability: 30, emotionalReactivity: 30, riskTolerance: 90, humorStyle: 40, conflictStyle: 80, stability: 70 } },
  { id: 'm5', name: 'Chloé', avatar: '👩‍💻', compatibilityScore: 0, compatibilityReasons: [], traits: { sociability: 60, emotionalReactivity: 50, riskTolerance: 50, humorStyle: 80, conflictStyle: 50, stability: 90 } },
  { id: 'm6', name: 'Hugo', avatar: '👨‍🚀', compatibilityScore: 0, compatibilityReasons: [], traits: { sociability: 75, emotionalReactivity: 20, riskTolerance: 85, humorStyle: 75, conflictStyle: 45, stability: 85 } },
  { id: 'm7', name: 'Sofia', avatar: '👩‍🔬', compatibilityScore: 0, compatibilityReasons: [], traits: { sociability: 45, emotionalReactivity: 70, riskTolerance: 30, humorStyle: 50, conflictStyle: 20, stability: 60 } },
];

const TRAIT_LABELS: Record<TraitKey, string> = {
  sociability: 'Approche sociale',
  emotionalReactivity: 'Réactivité émotionnelle',
  riskTolerance: 'Vision du risque',
  humorStyle: 'Humour',
  conflictStyle: 'Gestion de conflit',
  stability: 'Stabilité'
};

interface WetoState {
  // User Profile
  userName: string;
  userAvatar: string;
  userTraits: UserTraits;
  // Progress
  currentIndex: number;
  answers: Answer[];
  answeredIds: Set<string>;
  startTime: number | null;
  profileCompletion: number;
  // Match & Social
  matches: MatchProfile[];
  pendingMatch: MatchProfile | null;
  chats: Record<string, ChatThread>; // contactId -> thread

  // Actions
  updateProfile: (name: string, avatar: string) => void;
  startAnswer: () => void;
  submitAnswer: (scenarioId: string, choiceIndex: number) => void;
  nextScenario: () => void;
  dismissMatch: () => void;
  sendMessage: (contactId: string, text: string) => void;
  markChatRead: (contactId: string) => void;
  resetProgress: () => void; // for testing/demo
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

// Math logic: Calculate compatibility score based on distance between traits
function findMatches(userTraits: UserTraits, existingMatches: MatchProfile[]): MatchProfile | null {
  const existingIds = new Set(existingMatches.map(m => m.id));
  let bestMatch: MatchProfile | null = null;
  let highestScore = 0;

  for (const candidate of MOCK_DB) {
    if (existingIds.has(candidate.id)) continue;

    // Euclidean-like distance
    let diffSum = 0;
    const reasons: string[] = [];
    const keys = Object.keys(userTraits) as TraitKey[];
    
    for (const key of keys) {
      const diff = Math.abs(userTraits[key] - candidate.traits[key]);
      diffSum += diff;
      
      // If trait is very close, it's a reason for compatibility
      if (diff < 15) {
        reasons.push(`${TRAIT_LABELS[key]} similaire`);
      } else if (Math.abs(userTraits[key] + candidate.traits[key] - 100) < 20) {
        // Complementary logic (e.g. one is 80, one is 20)
        reasons.push(`${TRAIT_LABELS[key]} complémentaire`);
      }
    }

    // Max diff per trait is 100, so max total diff is 600.
    const maxDiff = 600;
    const rawScore = 100 - (diffSum / maxDiff) * 100;
    const score = Math.round(rawScore);

    // Dynamic threshold: match if score > 75%
    if (score > 75 && score > highestScore) {
      highestScore = score;
      bestMatch = {
        ...candidate,
        compatibilityScore: score,
        compatibilityReasons: reasons.slice(0, 3), // max 3 reasons
      };
    }
  }

  return bestMatch;
}

export const useWetoStore = create<WetoState>()(
  persist(
    (set, get) => ({
      userName: 'Moi',
      userAvatar: '👤',
      userTraits: { ...INITIAL_TRAITS },
      currentIndex: 0,
      answers: [],
      answeredIds: new Set(),
      startTime: null,
      profileCompletion: 0,
      matches: [],
      pendingMatch: null,
      chats: {},

      updateProfile: (name, avatar) => set({ userName: name, userAvatar: avatar }),

      startAnswer: () => set({ startTime: Date.now() }),

      submitAnswer: (scenarioId, choiceIndex) => {
        const { startTime, answers, userTraits, answeredIds } = get();
        const reactionTimeMs = startTime ? Date.now() - startTime : 0;
        const scenario = SCENARIOS.find((s) => s.id === scenarioId);
        if (!scenario) return;

        const choice = scenario.choices[choiceIndex];
        const newTraits = calculateProfile(userTraits, choice.traitDeltas);
        const newAnswers = [
          ...answers,
          { scenarioId, choiceIndex, reactionTimeMs, timestamp: Date.now() },
        ];
        const newAnsweredIds = new Set(answeredIds);
        newAnsweredIds.add(scenarioId);

        const profileCompletion = Math.min(100, Math.round((newAnsweredIds.size / SCENARIOS.length) * 100));
        
        let pendingMatch = null;
        let newMatches = get().matches;
        
        // Every 3 answers, try to find a new match
        if (newAnswers.length > 0 && newAnswers.length % 3 === 0) {
          const match = findMatches(newTraits, newMatches);
          if (match) {
            pendingMatch = match;
            newMatches = [...newMatches, match];
            // Initialize chat thread
            set((state) => ({
              chats: {
                ...state.chats,
                [match.id]: {
                  contactId: match.id,
                  contactName: match.name,
                  contactAvatar: match.avatar,
                  messages: [{
                    id: Date.now().toString(),
                    text: 'Vous avez matché ! Envoyez le premier message.',
                    senderId: 'system',
                    timestamp: Date.now()
                  }],
                  unread: true,
                }
              }
            }));
          }
        }

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
        const { currentIndex } = get();
        if (currentIndex < SCENARIOS.length - 1) {
          set({ currentIndex: currentIndex + 1, startTime: Date.now() });
        }
      },

      dismissMatch: () => set({ pendingMatch: null }),

      sendMessage: (contactId, text) => {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          text,
          senderId: 'me',
          timestamp: Date.now(),
        };

        set((state) => {
          const thread = state.chats[contactId];
          if (!thread) return state;
          return {
            chats: {
              ...state.chats,
              [contactId]: {
                ...thread,
                messages: [...thread.messages, newMessage],
                unread: false,
              }
            }
          };
        });

        // Simulate reply from the mock user
        setTimeout(() => {
          set((state) => {
            const thread = state.chats[contactId];
            if (!thread) return state;
            const replyMsg: ChatMessage = {
              id: Date.now().toString(),
              text: `Oh, intéressant ! J'aurais sûrement réagi de la même façon.`,
              senderId: contactId,
              timestamp: Date.now(),
            };
            return {
              chats: {
                ...state.chats,
                [contactId]: {
                  ...thread,
                  messages: [...thread.messages, replyMsg],
                  unread: true,
                }
              }
            };
          });
        }, 2000);
      },

      markChatRead: (contactId) => {
        set((state) => {
          const thread = state.chats[contactId];
          if (!thread || !thread.unread) return state;
          return {
            chats: {
              ...state.chats,
              [contactId]: { ...thread, unread: false }
            }
          };
        });
      },
      
      resetProgress: () => {
        set({
          currentIndex: 0,
          answers: [],
          answeredIds: new Set(),
          userTraits: { ...INITIAL_TRAITS },
          matches: [],
          chats: {},
          profileCompletion: 0
        });
      }
    }),
    {
      name: 'weto-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Set isn't natively serializable, so we define custom serialize/deserialize logic if needed,
      // but simpler to just convert it in partialize/merge or use Array.
      partialize: (state) => ({
        ...state,
        answeredIds: Array.from(state.answeredIds), // serialize Set to Array
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        answeredIds: new Set(persistedState?.answeredIds || []), // deserialize Array to Set
      }),
    }
  )
);
