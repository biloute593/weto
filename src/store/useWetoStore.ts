import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllowedScenarioLevels, getScenariosForLevel, PROFILE_COMPLETION_TARGET, SCENARIOS } from '../data/scenarios';
import {
  Answer,
  ChatMessage,
  ChatMessageInput,
  ChatThread,
  MatchProfile,
  ModerationAction,
  ModerationReportSummary,
  ProfileVisibility,
  ScenarioLevel,
  ThemeMode,
  UserVector,
} from '../types';
import { calculateProfile, getNextScenario } from '../utils';
import {
  bootstrapSession as fetchBootstrapSession,
  createOrUpdateSession,
  fetchChatThread,
  fetchModerationReports,
  loginAccount,
  logoutAccount,
  markChatAsRead,
  moderateModerationReport,
  RemoteSnapshot,
  reportChatMessage,
  resetRemoteSession,
  setChatEphemeralMode as setRemoteChatEphemeralMode,
  setChatTypingState,
  sendChatMessage,
  submitAnswer as sendAnswer,
  ApiError,
} from '../services/wetoApi';

const { create } = require('zustand/react') as typeof import('zustand/react');
const { persist, createJSONStorage } = require('zustand/middleware') as typeof import('zustand/middleware');

const INITIAL_VECTOR: UserVector = {
  sociability: 50,
  humor: 50,
  risk: 50,
  emotion: 50,
  conflict: 50,
  stability: 50,
};

const MAX_SKIPPED_SCENARIOS = 5;
const MIN_AGE = 13;
const MAX_AGE = 99;

function normalizeBirthYearInput(input: string) {
  const raw = input.trim();
  const now = new Date().getFullYear();
  const parsed = Number.parseInt(raw, 10);

  if (!Number.isFinite(parsed)) {
    return '';
  }

  if (raw.length === 4) {
    return parsed >= now - MAX_AGE && parsed <= now - MIN_AGE ? String(parsed) : '';
  }

  return parsed >= MIN_AGE && parsed <= MAX_AGE ? String(now - parsed) : '';
}

function getScenarioPool(level: ScenarioLevel, birthYear: string) {
  const allowedLevels = getAllowedScenarioLevels(birthYear);
  const safeLevel = allowedLevels.includes(level) ? level : 'standard';

  return {
    safeLevel,
    scenarioPool: getScenariosForLevel(safeLevel),
  };
}

function resolveCurrentIndex(
  level: ScenarioLevel,
  birthYear: string,
  userVector: UserVector,
  answeredIds: Set<string>,
  skippedScenarioIds: string[]
) {
  const { safeLevel, scenarioPool } = getScenarioPool(level, birthYear);
  const next = getNextScenario(userVector, answeredIds, scenarioPool, new Set(skippedScenarioIds));

  if (!next) {
    return {
      safeLevel,
      currentIndex: scenarioPool.length,
    };
  }

  const nextIdx = scenarioPool.findIndex((scenario) => scenario.id === next.id);

  return {
    safeLevel,
    currentIndex: nextIdx >= 0 ? nextIdx : 0,
  };
}

function createPlaceholderAnswers(answeredScenarioIds: string[]): Answer[] {
  return answeredScenarioIds.map((scenarioId, index) => ({
    scenarioId,
    choiceIndex: 0,
    reactionTimeMs: 0,
    timestamp: index,
  }));
}

function mergeAnswerHistory(localAnswers: Answer[], answeredScenarioIds: string[]): Answer[] {
  if (answeredScenarioIds.length === 0) {
    return [];
  }

  const localById = new Map(localAnswers.map((answer) => [answer.scenarioId, answer]));

  return answeredScenarioIds
    .map((scenarioId, index) => localById.get(scenarioId) ?? {
      scenarioId,
      choiceIndex: 0,
      reactionTimeMs: 0,
      timestamp: index,
    })
    .sort((first, second) => first.timestamp - second.timestamp);
}

function applyLocalAnswerState(state: WetoState, scenarioId: string, choiceIndex: number, reactionTimeMs: number) {
  if (state.answeredIds.has(scenarioId)) {
    return state;
  }

  const scenario = SCENARIOS.find((entry) => entry.id === scenarioId);
  const choice = scenario?.choices[choiceIndex];

  if (!scenario || !choice) {
    return state;
  }

  const answeredIds = new Set(state.answeredIds);
  answeredIds.add(scenarioId);

  return {
    ...state,
    userVector: calculateProfile(state.userVector, choice.traitDeltas),
    answers: [
      ...state.answers,
      {
        scenarioId,
        choiceIndex,
        reactionTimeMs: Math.max(0, Math.round(reactionTimeMs)),
        timestamp: Date.now(),
      },
    ],
    answeredIds,
    profileCompletion: Math.min(
      100,
      Math.round(((state.answers.length + 1) / PROFILE_COMPLETION_TARGET) * 100)
    ),
    isLocalOnly: true,
    guestMatchTeaser: false,
    softRegisterNudge: !state.hasQuickRegistered && (state.answers.length + 1) === 10
      ? true
      : state.softRegisterNudge,
    startTime: null,
  };
}

function getUnsyncedLocalAnswers(localAnswers: Answer[], remoteAnsweredScenarioIds: string[]) {
  const remoteAnsweredIds = new Set(remoteAnsweredScenarioIds);

  return localAnswers
    .filter((answer) => !remoteAnsweredIds.has(answer.scenarioId))
    .sort((first, second) => first.timestamp - second.timestamp);
}

function mergeChatRecords(existingChats: Record<string, ChatThread>, incomingChats: ChatThread[]) {
  const nextChats: Record<string, ChatThread> = {};

  for (const thread of incomingChats) {
    const previous = existingChats[thread.contactId];
    nextChats[thread.contactId] = previous && previous.messages.length > thread.messages.length
      ? { ...thread, messages: previous.messages }
      : thread;
  }

  return nextChats;
}

function createOptimisticChatMessage(message: ChatMessageInput): ChatMessage {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: message.text,
    senderId: 'me',
    timestamp: Date.now(),
    type: message.type,
    mediaUri: message.mediaUri,
    durationMs: message.durationMs,
    dilemma: message.dilemma,
    ephemeral: message.ephemeral,
    secure: message.secure,
    secureKind: message.secureKind,
    secureDurationSec: message.secureDurationSec,
    expiresAt: message.expiresAt,
    seenByRecipient: false,
  };
}

function buildBaseState() {
  return {
    userId: '',
    sessionToken: '',
    authEmail: '',
    isAdmin: false,
    isSuspended: false,
    suspensionReason: null as string | null,
    userName: 'Moi',
    userAvatar: 'U',
    birthYear: '',
    gender: '',
    seeking: '',
    selectedLevel: 'standard' as ScenarioLevel,
    userVector: { ...INITIAL_VECTOR },
    hasCompletedOnboarding: false,
    currentIndex: 0,
    answers: [] as Answer[],
    answeredIds: new Set<string>(),
    skippedScenarioIds: [] as string[],
    startTime: null as number | null,
    profileCompletion: 0,
    matches: [] as MatchProfile[],
    pendingMatch: null as MatchProfile | null,
    chats: {} as Record<string, ChatThread>,
    isSyncing: false,
    syncVersion: 0,
    activeChatContactId: null as string | null,
    adminReports: [] as ModerationReportSummary[],
    viewedEphemeralIds: new Set<string>(),
    hasQuickRegistered: false,
    isLocalOnly: false,
    guestMatchTeaser: false,
    softRegisterNudge: false,
    themeMode: 'light' as ThemeMode,
    profileVisibility: 'matches' as ProfileVisibility,
  };
}

function applyRemoteSnapshot(
  state: WetoState,
  snapshot: RemoteSnapshot,
  nextSessionToken?: string
) {
  const answeredIds = new Set(snapshot.user.answeredScenarioIds);
  const preferredLevel = getAllowedScenarioLevels(snapshot.user.birthYear).includes(state.selectedLevel)
    ? state.selectedLevel
    : snapshot.user.selectedLevel;
  const { safeLevel, currentIndex } = resolveCurrentIndex(
    preferredLevel,
    snapshot.user.birthYear,
    snapshot.user.userVector,
    answeredIds,
    state.skippedScenarioIds
  );

  return {
    sessionToken: nextSessionToken ?? state.sessionToken,
    userId: snapshot.user.id,
    authEmail: snapshot.user.email ?? '',
    isAdmin: snapshot.user.isAdmin,
    isSuspended: snapshot.user.isSuspended,
    suspensionReason: snapshot.user.suspensionReason,
    userName: snapshot.user.name,
    userAvatar: snapshot.user.avatar,
    birthYear: snapshot.user.birthYear,
    gender: snapshot.user.gender,
    seeking: snapshot.user.seeking,
    hasCompletedOnboarding: snapshot.user.hasCompletedOnboarding,
    selectedLevel: safeLevel,
    userVector: snapshot.user.userVector,
    answers: mergeAnswerHistory(state.answers, snapshot.user.answeredScenarioIds),
    answeredIds,
    currentIndex: answeredIds.size > 0 ? currentIndex : 0,
    profileCompletion: snapshot.user.profileCompletion,
    matches: snapshot.matches,
    chats: mergeChatRecords(state.chats, snapshot.chats),
    syncVersion: snapshot.syncVersion,
  };
}

interface WetoState {
  userId: string;
  sessionToken: string;
  authEmail: string;
  isAdmin: boolean;
  isSuspended: boolean;
  suspensionReason: string | null;
  userName: string;
  userAvatar: string;
  userVector: UserVector;
  hasCompletedOnboarding: boolean;
  currentIndex: number;
  answers: Answer[];
  answeredIds: Set<string>;
  skippedScenarioIds: string[];
  startTime: number | null;
  profileCompletion: number;
  matches: MatchProfile[];
  pendingMatch: MatchProfile | null;
  chats: Record<string, ChatThread>;
  birthYear: string;
  gender: string;
  seeking: string;
  selectedLevel: ScenarioLevel;
  isSyncing: boolean;
  syncVersion: number;
  activeChatContactId: string | null;
  adminReports: ModerationReportSummary[];
  viewedEphemeralIds: Set<string>;
  hasQuickRegistered: boolean;
  isLocalOnly: boolean;
  guestMatchTeaser: boolean;
  softRegisterNudge: boolean;
  themeMode: ThemeMode;
  profileVisibility: ProfileVisibility;

  updateProfile: (name: string, avatar: string) => void;
  markEphemeralViewed: (messageId: string) => void;
  completeOnboarding: (
    name: string,
    avatar: string,
    birthYear: string,
    gender: string,
    seeking: string,
    email: string,
    password: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  bootstrapSession: () => Promise<void>;
  refreshRemoteState: () => Promise<void>;
  loadChatThread: (contactId: string) => Promise<void>;
  setActiveChatContact: (contactId: string | null) => void;
  loadModerationReports: () => Promise<void>;
  applyModerationAction: (reportId: string, action: ModerationAction, note?: string) => Promise<void>;
  reportMessage: (contactId: string, messageId: string, reason: string) => Promise<void>;
  quickRegister: (pseudo: string, birthYearOrAge: string, avatar?: string, gender?: string) => Promise<void>;
  createGuestSession: () => Promise<void>;
  setIsLocalOnly: (local: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setProfileVisibility: (visibility: ProfileVisibility) => void;
  dismissSoftNudge: () => void;
  setSelectedLevel: (level: ScenarioLevel) => void;
  startAnswer: () => void;
  optimisticMarkAnswered: (scenarioId: string) => void;
  submitAnswer: (scenarioId: string, choiceIndex: number) => Promise<void>;
  nextScenario: (skippedScenarioId?: string) => void;
  prevScenario: () => void;
  dismissMatch: () => void;
  sendMessage: (contactId: string, message: ChatMessageInput) => Promise<void>;
  setTypingState: (contactId: string, isTyping: boolean) => Promise<void>;
  setChatEphemeralMode: (contactId: string, enabled: boolean) => Promise<void>;
  markChatRead: (contactId: string) => Promise<void>;
  resetProgress: () => Promise<void>;
}

async function loadActiveThread(sessionToken: string, contactId: string | null) {
  if (!contactId) {
    return null;
  }

  try {
    const { thread } = await fetchChatThread(sessionToken, contactId);
    return thread;
  } catch {
    return null;
  }
}

export const useWetoStore = create<WetoState>()(
  persist(
    (set, get) => {
      const syncLocalProgressToSession = async (sessionToken: string, remoteAnsweredScenarioIds: string[]) => {
        const localAnswers = get().answers;
        const pendingAnswers = getUnsyncedLocalAnswers(localAnswers, remoteAnsweredScenarioIds);

        if (pendingAnswers.length === 0) {
          return null;
        }

        let latestPendingMatch: MatchProfile | null = null;

        for (const answer of pendingAnswers) {
          const payload = await sendAnswer(sessionToken, {
            scenarioId: answer.scenarioId,
            choiceIndex: answer.choiceIndex,
            reactionTimeMs: answer.reactionTimeMs,
          });

          latestPendingMatch = payload.pendingMatch ?? latestPendingMatch;
        }

        const snapshot = await fetchBootstrapSession(sessionToken);

        return {
          snapshot,
          pendingMatch: latestPendingMatch,
        };
      };

      return ({
      ...buildBaseState(),

      updateProfile: (name, avatar) => set({ userName: name, userAvatar: avatar }),

      completeOnboarding: async (name, avatar, birthYear, gender, seeking, email, password) => {
        let payload = await createOrUpdateSession({
          sessionToken: get().sessionToken || undefined,
          name,
          avatar,
          birthYear,
          gender,
          seeking,
          email,
          password,
        });

        const synced = await syncLocalProgressToSession(payload.sessionToken, payload.user.answeredScenarioIds);
        if (synced) {
          payload = {
            sessionToken: payload.sessionToken,
            ...synced.snapshot,
          };
        }

        set((state) => ({
          ...state,
          ...applyRemoteSnapshot(state, payload, payload.sessionToken),
          pendingMatch: synced?.pendingMatch ?? null,
          isLocalOnly: false,
          startTime: null,
        }));
      },

      login: async (email, password) => {
        const payload = await loginAccount({ email, password });

        set((state) => ({
          ...state,
          ...applyRemoteSnapshot(state, payload, payload.sessionToken),
          pendingMatch: null,
          startTime: null,
        }));
      },

      logout: async () => {
        const sessionToken = get().sessionToken;
        if (sessionToken) {
          try {
            await logoutAccount(sessionToken);
          } catch (error) {
            console.error('logout failed', error);
          }
        }

        set({
          ...buildBaseState(),
        });
      },

      bootstrapSession: async () => {
        const state = get();
        if (state.isSyncing || !state.sessionToken) {
          return;
        }

        set({ isSyncing: true });

        try {
          const snapshot = await fetchBootstrapSession(state.sessionToken);
          const activeThread = await loadActiveThread(state.sessionToken, state.activeChatContactId);

          set((current) => {
            const nextState = {
              ...current,
              ...applyRemoteSnapshot(current, snapshot),
              isSyncing: false,
            };

            if (activeThread && current.activeChatContactId) {
              nextState.chats = {
                ...nextState.chats,
                [current.activeChatContactId]: activeThread,
              };
            }

            return nextState;
          });
        } catch (error) {
          console.error('bootstrapSession failed', error);
          // Session token expired or invalidated — clear it so the app creates a new one
          if (error instanceof ApiError && error.status === 401) {
            set({ sessionToken: '', isSyncing: false });
          } else {
            set({ isSyncing: false });
          }
        }
      },

      refreshRemoteState: async () => {
        const { sessionToken, activeChatContactId } = get();
        if (!sessionToken) {
          return;
        }

        try {
          const snapshot = await fetchBootstrapSession(sessionToken);
          const activeThread = await loadActiveThread(sessionToken, activeChatContactId);

          set((state) => {
            const nextState = {
              ...state,
              ...applyRemoteSnapshot(state, snapshot),
            };

            if (activeThread && activeChatContactId) {
              nextState.chats = {
                ...nextState.chats,
                [activeChatContactId]: activeThread,
              };
            }

            return nextState;
          });
        } catch (error) {
          console.error('refreshRemoteState failed', error);
          if (error instanceof ApiError && error.status === 401) {
            set({ sessionToken: '' });
          }
        }
      },

      loadChatThread: async (contactId) => {
        const { sessionToken } = get();

        if (!sessionToken) {
          throw new Error('Session indisponible.');
        }

        const { thread } = await fetchChatThread(sessionToken, contactId);

        set((state) => ({
          chats: {
            ...state.chats,
            [contactId]: thread,
          },
        }));
      },

      setActiveChatContact: (contactId) => set({ activeChatContactId: contactId }),

      loadModerationReports: async () => {
        const { sessionToken, isAdmin } = get();
        if (!sessionToken || !isAdmin) {
          return;
        }

        const { reports } = await fetchModerationReports(sessionToken);
        set({ adminReports: reports });
      },

      applyModerationAction: async (reportId, action, note) => {
        const { sessionToken, loadModerationReports, refreshRemoteState } = get();
        if (!sessionToken) {
          throw new Error('Session indisponible.');
        }

        await moderateModerationReport(sessionToken, { reportId, action, note });
        await Promise.all([loadModerationReports(), refreshRemoteState()]);
      },

      reportMessage: async (contactId, messageId, reason) => {
        const { sessionToken } = get();
        if (!sessionToken) {
          throw new Error('Session indisponible.');
        }

        await reportChatMessage(sessionToken, { contactId, messageId, reason });
      },

      setSelectedLevel: (level) =>
        set((state) => {
          const { safeLevel, currentIndex } = resolveCurrentIndex(
            level,
            state.birthYear,
            state.userVector,
            state.answeredIds,
            state.skippedScenarioIds
          );

          return {
            selectedLevel: safeLevel,
            currentIndex,
            startTime: null,
          };
        }),

      startAnswer: () => set({ startTime: Date.now() }),

      optimisticMarkAnswered: (scenarioId) => {
        set((state) => {
          const next = new Set(state.answeredIds);
          next.add(scenarioId);
          return { answeredIds: next };
        });
      },

      submitAnswer: async (scenarioId, choiceIndex) => {
        let { sessionToken, startTime } = get();
        const reactionTimeMs = startTime ? Date.now() - startTime : 0;

        // If no session yet (createGuestSession failed on startup), retry now
        if (!sessionToken) {
          await get().createGuestSession().catch(() => undefined);
          sessionToken = get().sessionToken;
        }

        if (!sessionToken) {
          set((state) => applyLocalAnswerState(state, scenarioId, choiceIndex, reactionTimeMs));
          return;
        }
        let payload;

        try {
          payload = await sendAnswer(sessionToken, {
            scenarioId,
            choiceIndex,
            reactionTimeMs,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : '';

          if (/failed to fetch|network request failed|networkerror/i.test(message)) {
            set((state) => applyLocalAnswerState(state, scenarioId, choiceIndex, reactionTimeMs));
            return;
          }

          throw error;
        }

        set((state) => ({
          ...state,
          ...applyRemoteSnapshot(state, payload),
          // Preserve currentIndex: the exit animation in ScenarioCard
          // hasn't played yet. nextScenario() will advance the index
          // after the animation completes. If we let applyRemoteSnapshot
          // overwrite currentIndex here, the new card mounts immediately
          // and the exit animation runs on the wrong card.
          currentIndex: state.currentIndex,
          pendingMatch: payload.pendingMatch,
          isLocalOnly: false,
          guestMatchTeaser: Boolean(payload.pendingMatch) && !get().hasQuickRegistered,
          softRegisterNudge: !get().hasQuickRegistered && (state.answers.length + 1) === 10
            ? true
            : get().softRegisterNudge,
          startTime: null,
        }));
      },

      prevScenario: () => {
        const { currentIndex } = get();
        if (currentIndex > 0) {
          set({ currentIndex: currentIndex - 1, startTime: Date.now() });
        }
      },

      nextScenario: (skippedScenarioId) => {
        const { answeredIds, skippedScenarioIds, selectedLevel, birthYear, userVector } = get();
        const nextSkippedIds = skippedScenarioId && !answeredIds.has(skippedScenarioId)
          ? [
              skippedScenarioId,
              ...skippedScenarioIds.filter((id) => id !== skippedScenarioId),
            ].slice(0, MAX_SKIPPED_SCENARIOS)
          : skippedScenarioIds;

        const { safeLevel, scenarioPool } = getScenarioPool(selectedLevel, birthYear);

        const next = getNextScenario(
          userVector,
          answeredIds,
          scenarioPool,
          new Set(nextSkippedIds)
        );

        if (!next) {
          set({
            selectedLevel: safeLevel,
            currentIndex: scenarioPool.length,
            skippedScenarioIds: nextSkippedIds,
            startTime: null,
          });
          return;
        }

        const nextIdx = scenarioPool.findIndex((scenario) => scenario.id === next.id);
        set({
          selectedLevel: safeLevel,
          currentIndex: nextIdx >= 0 ? nextIdx : 0,
          skippedScenarioIds: nextSkippedIds,
          startTime: Date.now(),
        });
      },

      dismissMatch: () => set({ pendingMatch: null, guestMatchTeaser: false }),

      dismissSoftNudge: () => set({ softRegisterNudge: false }),

      quickRegister: async (pseudo, birthYearOrAge, avatar = 'A', gender = '') => {
        let { sessionToken } = get();
        const safePseudo = pseudo.trim().length >= 2 ? pseudo.trim() : 'Joueur';
        const safeAvatar = avatar.trim().length > 0 ? avatar.trim() : 'A';
        const safeGender = gender.trim() || get().gender || '';
        const normalizedBirthYear = normalizeBirthYearInput(birthYearOrAge);

        if (!normalizedBirthYear) {
          throw new Error('Age ou annee de naissance invalide (13-99 ans).');
        }

        let payload;
        try {
          payload = await createOrUpdateSession({
            sessionToken: sessionToken || undefined,
            name: safePseudo,
            avatar: safeAvatar,
            birthYear: normalizedBirthYear,
            gender: safeGender,
            seeking: '',
            email: '',
            password: '',
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : '';
          if (!/session invalide|session absente/i.test(message)) {
            throw error;
          }

          await get().createGuestSession();
          sessionToken = get().sessionToken;

          if (!sessionToken) {
            throw new Error('Impossible de creer une session. Verifie ta connexion.');
          }

          payload = await createOrUpdateSession({
            sessionToken,
            name: safePseudo,
            avatar: safeAvatar,
            birthYear: normalizedBirthYear,
            gender: safeGender,
            seeking: '',
            email: '',
            password: '',
          });
        }

        const synced = await syncLocalProgressToSession(payload.sessionToken, payload.user.answeredScenarioIds);
        if (synced) {
          payload = {
            sessionToken: payload.sessionToken,
            ...synced.snapshot,
          };
        }

        set((state) => ({
          ...state,
          ...applyRemoteSnapshot(state, payload, payload.sessionToken),
          hasQuickRegistered: true,
          isLocalOnly: false,
          pendingMatch: synced?.pendingMatch ?? null,
          guestMatchTeaser: false,
          startTime: null,
        }));
      },

      createGuestSession: async () => {
        if (get().sessionToken) return;
        try {
          const guestId = Math.floor(Math.random() * 99999);
          let payload = await createOrUpdateSession({
            name: `Invité${guestId}`,
            avatar: 'U',
            birthYear: '',
            gender: '',
            seeking: '',
            email: '',
            password: '',
          });

          const synced = await syncLocalProgressToSession(payload.sessionToken, payload.user.answeredScenarioIds);
          if (synced) {
            payload = {
              sessionToken: payload.sessionToken,
              ...synced.snapshot,
            };
          }

          set((state) => ({
            ...state,
            ...applyRemoteSnapshot(state, payload, payload.sessionToken),
            pendingMatch: synced?.pendingMatch ?? null,
            isLocalOnly: false,
            startTime: null,
          }));
        } catch {
          // Réseau indisponible — l'app reste fonctionnelle en local
        }
      },

      setIsLocalOnly: (local) => set({ isLocalOnly: local }),

      setThemeMode: (mode) => set({ themeMode: mode }),

      setProfileVisibility: (visibility) => set({ profileVisibility: visibility }),

      sendMessage: async (contactId, message) => {
        const { sessionToken } = get();
        if (!sessionToken) {
          throw new Error('Session indisponible.');
        }

        const optimisticMessage = createOptimisticChatMessage(message);

        set((state) => {
          const previousThread = state.chats[contactId];
          if (!previousThread) {
            return state;
          }

          return {
            chats: {
              ...state.chats,
              [contactId]: {
                ...previousThread,
                unread: false,
                messages: [...previousThread.messages, optimisticMessage],
              },
            },
          };
        });

        try {
          const { thread } = await sendChatMessage(sessionToken, contactId, message);

          set((state) => ({
            chats: {
              ...state.chats,
              [contactId]: {
                ...thread,
                unread: false,
              },
            },
          }));
        } catch (error) {
          set((state) => {
            const previousThread = state.chats[contactId];
            if (!previousThread) {
              return state;
            }

            return {
              chats: {
                ...state.chats,
                [contactId]: {
                  ...previousThread,
                  messages: previousThread.messages.filter((entry) => entry.id !== optimisticMessage.id),
                },
              },
            };
          });

          throw error;
        }
      },

      markChatRead: async (contactId) => {
        const { sessionToken } = get();

        set((state) => {
          const thread = state.chats[contactId];
          if (!thread) {
            return state;
          }

          return {
            chats: {
              ...state.chats,
              [contactId]: {
                ...thread,
                unread: false,
              },
            },
          };
        });

        if (!sessionToken) {
          return;
        }

        try {
          await markChatAsRead(sessionToken, contactId);
        } catch (error) {
          console.error('markChatRead failed', error);
        }
      },

      setTypingState: async (contactId, isTyping) => {
        const { sessionToken } = get();
        if (!sessionToken) {
          return;
        }

        try {
          await setChatTypingState(sessionToken, contactId, isTyping);
        } catch (error) {
          console.error('setTypingState failed', error);
        }
      },

      setChatEphemeralMode: async (contactId, enabled) => {
        const { sessionToken } = get();
        if (!sessionToken) {
          throw new Error('Session indisponible.');
        }

        const { thread } = await setRemoteChatEphemeralMode(sessionToken, contactId, enabled);
        set((state) => ({
          chats: {
            ...state.chats,
            [contactId]: thread,
          },
        }));
      },

      markEphemeralViewed: (messageId) =>
        set((state) => ({
          viewedEphemeralIds: new Set([...state.viewedEphemeralIds, messageId]),
        })),

      resetProgress: async () => {
        const { sessionToken } = get();

        if (sessionToken) {
          try {
            await resetRemoteSession(sessionToken);
          } catch (error) {
            console.error('resetProgress failed', error);
          }
        }

        set({
          ...buildBaseState(),
        });
      },
    });
    },
    {
      name: 'weto-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        ...state,
        answeredIds: Array.from(state.answeredIds),
        viewedEphemeralIds: Array.from(state.viewedEphemeralIds),
        adminReports: [],
        activeChatContactId: null,
        isSyncing: false,
        startTime: null,
      }),
      merge: (persistedState: any, currentState) => {
        const inferredOnboarding =
          persistedState?.hasCompletedOnboarding ??
          Boolean(
            (persistedState?.answers?.length ?? 0) > 0 ||
              (persistedState?.userName && persistedState.userName !== 'Moi') ||
              (persistedState?.userAvatar && persistedState.userAvatar !== 'U')
          );

        const answeredIds = new Set<string>((persistedState?.answeredIds || []) as string[]);
        const viewedEphemeralIds = new Set<string>((persistedState?.viewedEphemeralIds || []) as string[]);
        const birthYear = persistedState?.birthYear ?? currentState.birthYear;
        const requestedLevel = persistedState?.selectedLevel ?? currentState.selectedLevel;
        const userVector = persistedState?.userVector ?? currentState.userVector;
        const skippedScenarioIds = persistedState?.skippedScenarioIds ?? currentState.skippedScenarioIds;
        const { safeLevel, currentIndex } = resolveCurrentIndex(
          requestedLevel,
          birthYear,
          userVector,
          answeredIds,
          skippedScenarioIds
        );

        return {
          ...currentState,
          ...persistedState,
          hasCompletedOnboarding: inferredOnboarding,
          answeredIds,
          selectedLevel: safeLevel,
          currentIndex: answeredIds.size > 0 ? currentIndex : 0,
          startTime: null,
          viewedEphemeralIds,
          adminReports: [],
          activeChatContactId: null,
          isSyncing: false,
          hasQuickRegistered: persistedState?.hasQuickRegistered ?? false,
          isLocalOnly: persistedState?.isLocalOnly ?? false,
          guestMatchTeaser: false,
          softRegisterNudge: false,
          themeMode: persistedState?.themeMode === 'dark' ? 'dark' : 'light',
          profileVisibility: persistedState?.profileVisibility === 'public' || persistedState?.profileVisibility === 'private'
            ? persistedState.profileVisibility
            : 'matches',
        };
      },
    }
  )
);

export type { UserVector, Answer, MatchProfile, ChatMessage, ChatThread };