import AsyncStorage from '@react-native-async-storage/async-storage';
import { PROFILE_COMPLETION_TARGET, SCENARIOS } from '../data/scenarios';
import {
  UserVector,
  TraitKey,
  Answer,
  MatchProfile,
  ChatMessage,
  ChatThread,
} from '../types';
import {
  calculateProfile,
  cosineSimilarity,
  similarityToPercent,
  generateCompatibilityReasons,
  getNextScenario,
} from '../utils';

const { create } = require('zustand/react') as typeof import('zustand/react');
const { persist, createJSONStorage } = require('zustand/middleware') as typeof import('zustand/middleware');

// ─── Initial State ──────────────────────────────────────────────────

const INITIAL_VECTOR: UserVector = {
  sociability: 50,
  humor: 50,
  risk: 50,
  emotion: 50,
  conflict: 50,
  stability: 50,
};

// ─── Mock Users Database (12 users) ─────────────────────────────────

const MOCK_USERS: Omit<MatchProfile, 'compatibilityScore' | 'compatibilityReasons'>[] = [
  { id: 'm1', name: 'Léa', avatar: '👩‍🦰', traits: { sociability: 80, humor: 70, risk: 60, emotion: 40, conflict: 30, stability: 80 } },
  { id: 'm2', name: 'Thomas', avatar: '👨‍💼', traits: { sociability: 40, humor: 60, risk: 40, emotion: 60, conflict: 70, stability: 50 } },
  { id: 'm3', name: 'Emma', avatar: '👩‍🎨', traits: { sociability: 90, humor: 90, risk: 70, emotion: 80, conflict: 40, stability: 40 } },
  { id: 'm4', name: 'Julien', avatar: '👨‍🎤', traits: { sociability: 30, humor: 40, risk: 90, emotion: 30, conflict: 80, stability: 70 } },
  { id: 'm5', name: 'Chloé', avatar: '👩‍💻', traits: { sociability: 60, humor: 80, risk: 50, emotion: 50, conflict: 50, stability: 90 } },
  { id: 'm6', name: 'Hugo', avatar: '👨‍🚀', traits: { sociability: 75, humor: 75, risk: 85, emotion: 20, conflict: 45, stability: 85 } },
  { id: 'm7', name: 'Sofia', avatar: '👩‍🔬', traits: { sociability: 45, humor: 50, risk: 30, emotion: 70, conflict: 20, stability: 60 } },
  { id: 'm8', name: 'Lucas', avatar: '👨‍🍳', traits: { sociability: 70, humor: 85, risk: 55, emotion: 45, conflict: 35, stability: 75 } },
  { id: 'm9', name: 'Inès', avatar: '👩‍🎓', traits: { sociability: 55, humor: 65, risk: 45, emotion: 55, conflict: 55, stability: 65 } },
  { id: 'm10', name: 'Raphaël', avatar: '👨‍🔧', traits: { sociability: 65, humor: 45, risk: 75, emotion: 35, conflict: 65, stability: 55 } },
  { id: 'm11', name: 'Camille', avatar: '👩‍⚕️', traits: { sociability: 85, humor: 55, risk: 35, emotion: 65, conflict: 25, stability: 85 } },
  { id: 'm12', name: 'Axel', avatar: '👨‍🎨', traits: { sociability: 50, humor: 90, risk: 80, emotion: 40, conflict: 60, stability: 45 } },
];

const MATCH_SIMILARITY_THRESHOLD = 0.75;
const MAX_SKIPPED_SCENARIOS = 5;
const MATCH_DISCOVERY_START = 10;
const MATCH_DISCOVERY_INTERVAL = 2;

// ─── Matching Engine ────────────────────────────────────────────────

function findBestMatch(
  userVector: UserVector,
  existingMatchIds: Set<string>
): MatchProfile | null {
  let bestMatch: MatchProfile | null = null;
  let highestScore = 0;

  for (const candidate of MOCK_USERS) {
    if (existingMatchIds.has(candidate.id)) continue;

    const similarity = cosineSimilarity(userVector, candidate.traits);
    const score = similarityToPercent(similarity);

    // Match threshold: cosine similarity > 0.75 (which maps to ~87.5% on our scale)
    if (similarity >= MATCH_SIMILARITY_THRESHOLD && score > highestScore) {
      highestScore = score;
      const reasons = generateCompatibilityReasons(userVector, candidate.traits);
      bestMatch = {
        ...candidate,
        compatibilityScore: score,
        compatibilityReasons: reasons.length > 0 ? reasons : ['Profils compatibles'],
      };
    }
  }

  return bestMatch;
}

// ─── Store Interface ────────────────────────────────────────────────

interface WetoState {
  // User Profile
  userName: string;
  userAvatar: string;
  userVector: UserVector;
  hasCompletedOnboarding: boolean;

  // Progress
  currentIndex: number;
  answers: Answer[];
  answeredIds: Set<string>;
  skippedScenarioIds: string[];
  startTime: number | null;
  profileCompletion: number;

  // Match & Social
  matches: MatchProfile[];
  pendingMatch: MatchProfile | null;
  chats: Record<string, ChatThread>;

  // Actions
  updateProfile: (name: string, avatar: string) => void;
  completeOnboarding: (name: string, avatar: string) => void;
  startAnswer: () => void;
  submitAnswer: (scenarioId: string, choiceIndex: number) => void;
  nextScenario: (skippedScenarioId?: string) => void;
  dismissMatch: () => void;
  sendMessage: (contactId: string, text: string) => void;
  markChatRead: (contactId: string) => void;
  resetProgress: () => void;
}

// ─── Store Implementation ───────────────────────────────────────────

export const useWetoStore = create<WetoState>()(
  persist(
    (set, get) => ({
      userName: 'Moi',
      userAvatar: '👤',
      userVector: { ...INITIAL_VECTOR },
      hasCompletedOnboarding: false,
      currentIndex: 0,
      answers: [],
      answeredIds: new Set(),
      skippedScenarioIds: [],
      startTime: null,
      profileCompletion: 0,
      matches: [],
      pendingMatch: null,
      chats: {},

      updateProfile: (name, avatar) => set({ userName: name, userAvatar: avatar }),

      completeOnboarding: (name, avatar) =>
        set({
          userName: name,
          userAvatar: avatar,
          hasCompletedOnboarding: true,
        }),

      startAnswer: () => set({ startTime: Date.now() }),

      submitAnswer: (scenarioId, choiceIndex) => {
        const { startTime, answers, userVector, answeredIds, skippedScenarioIds } = get();
        const reactionTimeMs = startTime ? Date.now() - startTime : 0;
        const scenario = SCENARIOS.find((s) => s.id === scenarioId);
        if (!scenario) return;

        const choice = scenario.choices[choiceIndex];
        const newVector = calculateProfile(userVector, choice.traitDeltas);
        const newAnswers: Answer[] = [
          ...answers,
          { scenarioId, choiceIndex, reactionTimeMs, timestamp: Date.now() },
        ];
        const newAnsweredIds = new Set(answeredIds);
        newAnsweredIds.add(scenarioId);

        const profileCompletion = Math.min(
          100,
          Math.round((newAnsweredIds.size / PROFILE_COMPLETION_TARGET) * 100)
        );

        let pendingMatch: MatchProfile | null = null;
        let newMatches = get().matches;

        const shouldAttemptMatch =
          newAnswers.length >= MATCH_DISCOVERY_START &&
          (newAnswers.length === MATCH_DISCOVERY_START ||
            (newAnswers.length - MATCH_DISCOVERY_START) % MATCH_DISCOVERY_INTERVAL === 0);

        if (shouldAttemptMatch) {
          const existingIds = new Set(newMatches.map((m) => m.id));
          const match = findBestMatch(newVector, existingIds);

          if (match) {
            pendingMatch = match;
            newMatches = [...newMatches, match];

            // Initialize chat thread for the new match
            set((state) => ({
              chats: {
                ...state.chats,
                [match.id]: {
                  contactId: match.id,
                  contactName: match.name,
                  contactAvatar: match.avatar,
                  messages: [
                    {
                      id: Date.now().toString(),
                      text: 'Vous avez matché ! Envoyez le premier message.',
                      senderId: 'system',
                      timestamp: Date.now(),
                    },
                  ],
                  unread: true,
                },
              },
            }));
          }
        }

        set({
          answers: newAnswers,
          userVector: newVector,
          answeredIds: newAnsweredIds,
          skippedScenarioIds: skippedScenarioIds.filter((id) => id !== scenarioId),
          startTime: null,
          pendingMatch,
          matches: newMatches,
          profileCompletion,
        });
      },

      nextScenario: (skippedScenarioId) => {
        const { currentIndex, answeredIds, skippedScenarioIds } = get();
        const nextSkippedIds = skippedScenarioId && !answeredIds.has(skippedScenarioId)
          ? [
              skippedScenarioId,
              ...skippedScenarioIds.filter((id) => id !== skippedScenarioId),
            ].slice(0, MAX_SKIPPED_SCENARIOS)
          : skippedScenarioIds;

        // Use AI hook to determine next scenario
        const next = getNextScenario(
          get().userVector,
          answeredIds,
          SCENARIOS,
          new Set(nextSkippedIds)
        );
        if (!next) {
          set({
            currentIndex: SCENARIOS.length,
            skippedScenarioIds: nextSkippedIds,
            startTime: null,
          });
          return;
        }

        const nextIdx = SCENARIOS.findIndex((s) => s.id === next.id);
        set({
          currentIndex: nextIdx >= 0 ? nextIdx : currentIndex + 1,
          skippedScenarioIds: nextSkippedIds,
          startTime: Date.now(),
        });
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
              },
            },
          };
        });

        // Simulate reply from the mock user
        setTimeout(() => {
          const replies = [
            "Oh, intéressant ! J'aurais sûrement réagi de la même façon.",
            "C'est marrant, on pense pareil sur ce sujet 😄",
            "J'adore ta façon de voir les choses !",
            "Haha, tu me surprends ! En bien 😊",
            "On devrait en discuter autour d'un café ☕",
          ];
          const randomReply = replies[Math.floor(Math.random() * replies.length)];

          set((state) => {
            const thread = state.chats[contactId];
            if (!thread) return state;
            const replyMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              text: randomReply,
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
                },
              },
            };
          });
        }, 1500 + Math.random() * 2000);
      },

      markChatRead: (contactId) => {
        set((state) => {
          const thread = state.chats[contactId];
          if (!thread || !thread.unread) return state;
          return {
            chats: {
              ...state.chats,
              [contactId]: { ...thread, unread: false },
            },
          };
        });
      },

      resetProgress: () => {
        set({
          currentIndex: 0,
          answers: [],
          answeredIds: new Set(),
          skippedScenarioIds: [],
          userVector: { ...INITIAL_VECTOR },
          matches: [],
          chats: {},
          pendingMatch: null,
          profileCompletion: 0,
        });
      },
    }),
    {
      name: 'weto-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        ...state,
        answeredIds: Array.from(state.answeredIds),
      }),
      merge: (persistedState: any, currentState) => {
        const inferredOnboarding =
          persistedState?.hasCompletedOnboarding ??
          Boolean(
            (persistedState?.answers?.length ?? 0) > 0 ||
              (persistedState?.userName && persistedState.userName !== 'Moi') ||
              (persistedState?.userAvatar && persistedState.userAvatar !== '👤')
          );

        return {
          ...currentState,
          ...persistedState,
          hasCompletedOnboarding: inferredOnboarding,
          answeredIds: new Set(persistedState?.answeredIds || []),
        };
      },
    }
  )
);

// Re-export types for convenience
export type { UserVector, Answer, MatchProfile, ChatMessage, ChatThread };
