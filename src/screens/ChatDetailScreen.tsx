import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Modal,
  ScrollView,
  Keyboard,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, getThemeColors } from '../theme/colors';
import { useWetoStore } from '../store/useWetoStore';
import { SCENARIOS } from '../data/scenarios';
import { ChatMessage, Scenario } from '../types';
import { getAvatarMonogram } from '../utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SECURE_DEFAULT_DURATION_SEC = 30;
const DILEMMA_PICKER_LIMIT = 48;

function formatVoiceDuration(durationMs?: number) {
  const totalSeconds = Math.max(1, Math.round((durationMs ?? 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function formatMessageTime(timestamp: number) {
  try {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const Reader = (globalThis as any).FileReader;
    if (!Reader) {
      reject(new Error('FileReader indisponible'));
      return;
    }

    const reader = new Reader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function resolveAssetMediaUri(asset: ImagePicker.ImagePickerAsset) {
  if (asset.base64) {
    const defaultMime = asset.type === 'video' ? 'video/mp4' : 'image/jpeg';
    return `data:${asset.mimeType ?? defaultMime};base64,${asset.base64}`;
  }

  const webFile = (asset as ImagePicker.ImagePickerAsset & { file?: Blob }).file;
  if (webFile) {
    return blobToDataUrl(webFile);
  }

  if (asset.uri.startsWith('data:')) {
    return asset.uri;
  }

  const response = await fetch(asset.uri);
  return blobToDataUrl(await response.blob());
}

function getMediaLabel(type: ChatMessage['type']) {
  if (type === 'video') return 'Vidéo';
  if (type === 'file') return 'Fichier';
  return 'Photo';
}

function getDefaultMediaText(type: ChatMessage['type']) {
  if (type === 'video') return 'Video';
  if (type === 'file') return 'Document';
  return 'Photo';
}

function extractFirstUrl(text?: string) {
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s]+/i);
  return match?.[0] ?? null;
}

type CallKind = 'voice' | 'video';

function buildCallLink(contactId: string, callKind: CallKind) {
  const roomSlug = ['weto', callKind, contactId, Date.now().toString(36)]
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-');
  const configFragment = callKind === 'voice'
    ? '#config.prejoinPageEnabled=false&config.startWithVideoMuted=true&config.startAudioOnly=true'
    : '#config.prejoinPageEnabled=false';

  return `https://meet.jit.si/${roomSlug}${configFragment}`;
}

function getCallInviteMeta(message: ChatMessage) {
  if (message.type !== 'call') {
    return null;
  }

  const callLink = extractFirstUrl(message.text);
  if (!callLink) {
    return null;
  }

  const firstLine = message.text.split('\n')[0]?.toLowerCase() ?? '';
  const isVideo = firstLine.includes('visio') || firstLine.includes('video');

  return {
    callLink,
    title: isVideo ? 'Appel visio' : 'Appel vocal',
    subtitle: isVideo ? 'Salon pret a rejoindre.' : 'Salon audio pret a rejoindre.',
    actionLabel: isVideo ? 'Rejoindre la visio' : "Rejoindre l'appel",
    iconName: (isVideo ? 'videocam-outline' : 'call-outline') as keyof typeof Ionicons.glyphMap,
  };
}

type PendingMedia = {
  uri: string;
  type: 'image' | 'video';
} | null;

function buildSharedDilemmaPayload(scenario: Scenario) {
  return {
    scenarioId: scenario.id,
    question: scenario.question,
    choices: scenario.choices.map((choice) => choice.label),
  };
}

async function pickWebFileAsDataUrl(accept: string, capture?: 'environment' | 'user') {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return null;
  }

  return new Promise<{ dataUrl: string; mimeType: string } | null>((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    if (capture) {
      input.setAttribute('capture', capture);
    }

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      try {
        const dataUrl = await blobToDataUrl(file);
        resolve({ dataUrl, mimeType: file.type || 'application/octet-stream' });
      } catch {
        resolve(null);
      }
    };

    input.click();
  });
}

function VideoMessage({ uri, secure = false }: { uri: string; secure?: boolean }) {
  if (Platform.OS !== 'web') {
    return (
      <View style={{ width: 210, height: 210, borderRadius: Radius.md, marginBottom: 6, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Ionicons name="videocam-outline" size={30} color="#E2E8F0" style={{ opacity: 0.92 }} />
        <Text style={{ ...Typography.caption, color: '#FFFFFF' }}>Vidéo reçue</Text>
      </View>
    );
  }

  return React.createElement('video', {
    src: uri,
    controls: true,
    playsInline: true,
    preload: 'metadata',
    controlsList: secure ? 'nodownload noremoteplayback' : undefined,
    disablePictureInPicture: secure ? true : undefined,
    onContextMenu: secure ? (event: any) => event.preventDefault() : undefined,
    style: {
      width: 210,
      height: 280,
      display: 'block',
      borderRadius: 16,
      backgroundColor: '#3a3e49',
      marginBottom: 6,
    },
  });
}

export function ChatDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const contactId = route.params?.contactId;
  const {
    chats,
    matches,
    sendMessage,
    markChatRead,
    loadChatThread,
    setActiveChatContact,
    reportMessage,
    viewedEphemeralIds,
    markEphemeralViewed,
    sessionToken,
    themeMode,
    setTypingState,
    setChatEphemeralMode,
  } = useWetoStore();
  const p = getThemeColors(themeMode);
  const styles = useMemo(() => createStyles(p, themeMode), [p, themeMode]);
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const [isSendingMedia, setIsSendingMedia] = useState(false);
  const [isSendingText, setIsSendingText] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [ephemeralViewId, setEphemeralViewId] = useState<string | null>(null);
  const [secureViewId, setSecureViewId] = useState<string | null>(null);
  const [secureCountdown, setSecureCountdown] = useState(SECURE_DEFAULT_DURATION_SEC);
  const [showGhostModal, setShowGhostModal] = useState(false);
  const [ghostLoading, setGhostLoading] = useState(false);
  const [ghostResult, setGhostResult] = useState<{ insight: string; tone: string } | null>(null);
  const [ghostError, setGhostError] = useState('');
  const [activeQuickMenu, setActiveQuickMenu] = useState<'attachment' | 'call' | null>(null);
  const [pendingMedia, setPendingMedia] = useState<PendingMedia>(null);
  const [isEphemeral30SecEnabled, setIsEphemeral30SecEnabled] = useState(false);
  const [showDilemmaPicker, setShowDilemmaPicker] = useState(false);
  const [dilemmaQuery, setDilemmaQuery] = useState('');
  const [isTogglingEphemeralMode, setIsTogglingEphemeralMode] = useState(false);
  // Track when user entered the chat to compute new incoming messages
  const [enteredAt] = useState(() => Date.now());

  const handleGhostAnalysis = async () => {
    if (ghostLoading) return;
    setGhostError('');
    setGhostResult(null);
    setGhostLoading(true);
    try {
      const messages = (thread?.messages ?? [])
        .slice(-10)
        .map((m) => ({ senderId: m.senderId, text: m.text }));
      const res = await fetch('/.netlify/functions/ghost-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-weto-session': sessionToken ?? '',
        },
        body: JSON.stringify({ messages }),
      });
      const data = await res.json() as { insight?: string; tone?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Erreur serveur.');
      setGhostResult({ insight: data.insight ?? '', tone: data.tone ?? 'soft' });
    } catch (err) {
      setGhostError(err instanceof Error ? err.message : 'Erreur inconnue.');
    } finally {
      setGhostLoading(false);
    }
  };
  const flatListRef = useRef<FlatList>(null);
  const mediaRecorderRef = useRef<any>(null);
  const mediaChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<any>(null);
  const recordStartedAtRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<any>(null);
  const secureCountdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secureAutoHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingDebounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const thread = chats[contactId];
  const contactStatusLabel = useMemo(() => {
    if (!thread) return '';
    if (thread.isContactOnline) {
      return thread.isContactTyping ? 'en train de répondre...' : 'en ligne';
    }

    if (!thread.contactLastSeenAt) {
      return 'hors ligne';
    }

    try {
      const formatted = new Date(thread.contactLastSeenAt).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `vu à ${formatted}`;
    } catch {
      return 'hors ligne';
    }
  }, [thread]);
  const matchedProfile = useMemo(
    () => matches.find((entry) => entry.id === contactId) ?? null,
    [contactId, matches]
  );
  const newIncomingCount = useMemo(() => {
    if (!thread) return 0;
    return thread.messages.filter(
      (m) => m.timestamp > enteredAt && m.senderId !== 'me' && m.senderId !== 'system'
    ).length;
  }, [thread, enteredAt]);
  const normalizedDilemmaQuery = dilemmaQuery.trim().toLowerCase();
  const dilemmaCandidates = useMemo(() => {
    const baseList = SCENARIOS.filter((scenario) => (scenario.choices?.length ?? 0) >= 2);

    if (!normalizedDilemmaQuery) {
      return baseList.slice(0, DILEMMA_PICKER_LIMIT);
    }

    return baseList
      .filter((scenario) => {
        if (scenario.question.toLowerCase().includes(normalizedDilemmaQuery)) return true;
        return scenario.choices.some((choice) => choice.label.toLowerCase().includes(normalizedDilemmaQuery));
      })
      .slice(0, DILEMMA_PICKER_LIMIT);
  }, [normalizedDilemmaQuery]);

  useEffect(() => {
    if (!contactId) return;

    setActiveChatContact(contactId);
    void loadChatThread(contactId).catch(() => undefined);

    return () => {
      setActiveChatContact(null);
    };
  }, [contactId, loadChatThread, setActiveChatContact]);

  useEffect(() => {
    if (!contactId || !thread?.unread) return;
    void markChatRead(contactId);
  }, [contactId, markChatRead, thread?.messages.length, thread?.unread]);

  useEffect(() => {
    if (!contactId) return;

    const pollInterval = setInterval(() => {
      void loadChatThread(contactId).catch(() => undefined);
    }, 5000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [contactId, loadChatThread]);

  useEffect(() => {
    if (!contactId) return;

    const hasText = inputText.trim().length > 0;

    if (typingDebounceTimeoutRef.current) {
      clearTimeout(typingDebounceTimeoutRef.current);
      typingDebounceTimeoutRef.current = null;
    }

    typingDebounceTimeoutRef.current = setTimeout(() => {
      void setTypingState(contactId, hasText);
    }, 180);

    if (typingStopTimeoutRef.current) {
      clearTimeout(typingStopTimeoutRef.current);
      typingStopTimeoutRef.current = null;
    }

    if (hasText) {
      typingStopTimeoutRef.current = setTimeout(() => {
        void setTypingState(contactId, false);
      }, 2600);
    }
  }, [contactId, inputText, setTypingState]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (secureCountdownIntervalRef.current) {
        clearInterval(secureCountdownIntervalRef.current);
        secureCountdownIntervalRef.current = null;
      }

      if (secureAutoHideTimeoutRef.current) {
        clearTimeout(secureAutoHideTimeoutRef.current);

  useEffect(() => {
    if (!thread?.messages.length) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [thread?.messages.length]);
        secureAutoHideTimeoutRef.current = null;
      }

      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause?.();
        audioPlayerRef.current = null;
      }

      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }

      if (typingDebounceTimeoutRef.current) {
        clearTimeout(typingDebounceTimeoutRef.current);
      }

      if (typingStopTimeoutRef.current) {
        clearTimeout(typingStopTimeoutRef.current);
      }

      if (contactId) {
        void setTypingState(contactId, false);
      }

      mediaStreamRef.current?.getTracks?.().forEach((track: any) => track.stop());
      mediaStreamRef.current = null;
    };
  }, [contactId, setTypingState]);

  if (!thread) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Chargement de la discussion...</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isSendingText) return;

    setInputText('');
    setIsSendingText(true);

    try {
      void setTypingState(contactId, false);
      await sendMessage(contactId, { text, type: 'text' });
    } catch {
      setInputText(text);
      Alert.alert('Message', "Impossible d'envoyer le message pour l'instant.");
    } finally {
      setIsSendingText(false);
    }
  };

  const handlePickMedia = async (source: 'camera' | 'library' = 'library') => {
    if (!contactId || isSendingMedia) return;

    setIsSendingMedia(true);
    try {
      if (Platform.OS === 'web') {
        const picked = await pickWebFileAsDataUrl(
          'image/*,video/*',
          source === 'camera' ? 'environment' : undefined
        );

        if (!picked?.dataUrl) return;

        const isVideo = picked.mimeType.includes('video');
        setPendingMedia({
          uri: picked.dataUrl,
          type: isVideo ? 'video' : 'image',
        });
        setIsEphemeral30SecEnabled(false);
        return;
      }

      if (source === 'camera') {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPermission.granted) {
          Alert.alert('Caméra', 'Autorise la caméra pour prendre des photos ou vidéos.');
          return;
        }
      } else {
        const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!libraryPermission.granted) {
          Alert.alert('Galerie', 'Autorise la galerie pour envoyer des photos ou vidéos.');
          return;
        }
      }

      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images', 'videos'],
        allowsEditing: false,
        quality: 0.55,
        base64: false,
      };

      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const mediaUri = await resolveAssetMediaUri(asset);

      setPendingMedia({
        uri: mediaUri,
        type: asset.type === 'video' ? 'video' : 'image',
      });
      setIsEphemeral30SecEnabled(false);
    } catch {
      Alert.alert('Media', "Impossible d'ouvrir la sélection pour l'instant.");
    } finally {
      setIsSendingMedia(false);
    }
  };

  const closePendingMedia = () => {
    setPendingMedia(null);
    setIsEphemeral30SecEnabled(false);
  };

  const handleSendPendingMedia = async () => {
    if (!contactId || !pendingMedia) return;

    const label = getMediaLabel(pendingMedia.type);
    setIsSendingMedia(true);
    try {
      void setTypingState(contactId, false);
      await sendMessage(contactId, {
        text: getDefaultMediaText(pendingMedia.type),
        type: pendingMedia.type,
        mediaUri: pendingMedia.uri,
        secure: isEphemeral30SecEnabled,
        secureKind: pendingMedia.type === 'video' ? 'video' : 'image',
        secureDurationSec: isEphemeral30SecEnabled ? SECURE_DEFAULT_DURATION_SEC : undefined,
      });
      closePendingMedia();
    } catch {
      Alert.alert(label, `Impossible d'envoyer le ${label.toLowerCase()} pour l'instant.`);
    } finally {
      setIsSendingMedia(false);
    }
  };

  const closeQuickMenu = () => {
    setActiveQuickMenu(null);
  };

  const dismissQuickMenu = () => {
    setTimeout(() => {
      setActiveQuickMenu(null);
    }, 120);
  };

  const runQuickMenuAction = (action: () => Promise<void> | void) => {
    closeQuickMenu();
    setTimeout(() => {
      void action();
    }, 0);
  };

  const handlePickFile = async () => {
    if (!contactId || isSendingMedia) return;

    if (Platform.OS === 'web') {
      const picked = await pickWebFileAsDataUrl('*/*');
      if (!picked?.dataUrl) return;

      const isVideo = picked.mimeType.includes('video');
      const isPdf = picked.mimeType.includes('pdf');

      if (isPdf) {
        await sendMessage(contactId, {
          text: 'Fichier',
          type: 'file',
          mediaUri: picked.dataUrl,
        });
        return;
      }

      setPendingMedia({
        uri: picked.dataUrl,
        type: isVideo ? 'video' : 'image',
      });
      setIsEphemeral30SecEnabled(false);
      return;
    }

    await handlePickMedia('library');
  };

  const handleSendLocation = async () => {
    if (!contactId) return;

    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 12000,
            maximumAge: 25000,
            enableHighAccuracy: true,
          });
        });

        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
        await sendMessage(contactId, {
          text: `📍 Ma localisation en direct\n${mapsUrl}`,
          type: 'text',
        });
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Localisation', 'Autorise la localisation pour partager ta position réelle.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lat = position.coords.latitude.toFixed(6);
      const lng = position.coords.longitude.toFixed(6);
      const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;

      await sendMessage(contactId, {
        text: `📍 Ma localisation en direct\n${mapsUrl}`,
        type: 'text',
      });
    } catch {
      Alert.alert('Localisation', 'Impossible de récupérer ta position pour le moment.');
    }
  };

  const handleOpenAttachmentMenu = () => {
    if (isSendingMedia || isRecordingVoice) {
      return;
    }
    setActiveQuickMenu('attachment');
  };

  const handleOpenCameraMenu = () => {
    if (isSendingMedia || isRecordingVoice) {
      return;
    }
    void handlePickMedia('camera');
  };

  const handleOpenDilemmaPicker = () => {
    setDilemmaQuery('');
    setShowDilemmaPicker(true);
  };

  const handleShareDilemma = async (scenario: Scenario) => {
    if (!contactId) return;

    const payload = buildSharedDilemmaPayload(scenario);
    try {
      await sendMessage(contactId, {
        text: payload.question,
        type: 'dilemma',
        dilemma: payload,
      });
      setShowDilemmaPicker(false);
    } catch {
      Alert.alert('Dilemme', "Impossible de partager ce dilemme pour l'instant.");
    }
  };

  const handleAnswerDilemma = async (message: ChatMessage, choiceIndex: number) => {
    if (!contactId || !message.dilemma) return;

    const selectedChoiceLabel = message.dilemma.choices[choiceIndex];
    if (!selectedChoiceLabel) return;

    try {
      await sendMessage(contactId, {
        text: `Réponse au dilemme: ${selectedChoiceLabel}`,
        type: 'dilemma-response',
        dilemma: {
          scenarioId: message.dilemma.scenarioId,
          question: message.dilemma.question,
          choices: message.dilemma.choices,
          sourceMessageId: message.id,
          selectedChoiceIndex: choiceIndex,
          selectedChoiceLabel,
        },
      });
    } catch {
      Alert.alert('Dilemme', "Impossible d'envoyer la réponse pour l'instant.");
    }
  };

  const handleStartCall = async (callKind: CallKind) => {
    if (!contactId || !thread) return;

    const callLink = buildCallLink(contactId, callKind);
    const callTitle = callKind === 'video' ? '🎥 Appel visio Weto' : '📞 Appel vocal Weto';
    const callDescription = callKind === 'video'
      ? 'Rejoins-moi pour une visio securisee.'
      : 'Rejoins-moi pour un appel audio securise.';

    try {
      await sendMessage(contactId, {
        text: `${callTitle}\n${callDescription}\n${callLink}`,
        type: 'call',
      });
    } catch {
      Alert.alert('Appel', "Impossible d'envoyer l'invitation d'appel pour le moment.");
      return;
    }

    Linking.openURL(callLink).catch(() => {
      Alert.alert('Appel', "Invitation envoyee, mais impossible d'ouvrir le salon pour le moment.");
    });
  };

  const handleCallPress = () => {
    if (!contactId || !thread) return;
    setActiveQuickMenu('call');
  };

  const handleToggleEphemeralMode24h = async () => {
    if (!contactId || isTogglingEphemeralMode || !thread) {
      return;
    }

    setIsTogglingEphemeralMode(true);
    try {
      await setChatEphemeralMode(contactId, !thread.ephemeralMode24h);
      const nextMode = !thread.ephemeralMode24h;
      await sendMessage(contactId, {
        text: nextMode
          ? '👁️ Mode éphémère 24h activé : chaque nouveau message disparaît après 24 heures.'
          : '👁️ Mode éphémère 24h désactivé.',
        type: 'text',
      });
    } catch {
      Alert.alert('Éphémère', 'Impossible de modifier le mode éphémère pour le moment.');
    } finally {
      setIsTogglingEphemeralMode(false);
    }
  };

  const stopActiveStream = () => {
    mediaStreamRef.current?.getTracks?.().forEach((track: any) => track.stop());
    mediaStreamRef.current = null;
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      return;
    }

    stopActiveStream();
    mediaRecorderRef.current = null;
    setIsRecordingVoice(false);
  };

  const startVoiceRecording = async () => {
    if (!contactId) return;

    if (Platform.OS !== 'web') {
      Alert.alert('Vocal', 'Les vocaux sont disponibles sur le web pour cette version.');
      return;
    }

    const mediaDevices = (globalThis as any).navigator?.mediaDevices;
    const MediaRecorderCtor = (globalThis as any).MediaRecorder;

    if (!mediaDevices?.getUserMedia || !MediaRecorderCtor) {
      Alert.alert('Vocal', 'Ton navigateur ne permet pas encore les vocaux ici.');
      return;
    }

    try {
      const stream = await mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorderCtor(stream);

      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      mediaChunksRef.current = [];
      recordStartedAtRef.current = Date.now();

      recorder.ondataavailable = (event: any) => {
        if (event.data?.size) {
          mediaChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const startedAt = recordStartedAtRef.current ?? Date.now();
        const durationMs = Math.max(1000, Date.now() - startedAt);
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(mediaChunksRef.current, { type: mimeType });

        mediaChunksRef.current = [];
        recordStartedAtRef.current = null;
        mediaRecorderRef.current = null;
        stopActiveStream();
        setIsRecordingVoice(false);

        try {
          const mediaUri = await blobToDataUrl(blob);
          await sendMessage(contactId, {
            text: 'Vocal',
            type: 'voice',
            mediaUri,
            durationMs,
          });
        } catch {
          Alert.alert('Vocal', "Le vocal a été capté, mais n'a pas pu être envoyé.");
        }
      };

      recorder.start();
      setIsRecordingVoice(true);
    } catch {
      stopActiveStream();
      mediaRecorderRef.current = null;
      setIsRecordingVoice(false);
      Alert.alert('Vocal', 'Impossible de démarrer le micro sans autorisation.');
    }
  };

  const handleVoiceLongPress = async () => {
    if (isRecordingVoice || isSendingMedia) return;
    await startVoiceRecording();
  };

  const handleVoicePressOut = () => {
    if (!isRecordingVoice) return;
    stopVoiceRecording();
  };

  const handleToggleVoicePlayback = async (message: ChatMessage) => {
    if (!message.mediaUri) return;

    if (Platform.OS !== 'web') {
      Alert.alert('Lecture', 'La lecture des vocaux est disponible sur le web pour cette version.');
      return;
    }

    const AudioCtor = (globalThis as any).Audio;
    if (!AudioCtor) {
      Alert.alert('Lecture', 'Impossible de lire ce vocal ici.');
      return;
    }

    if (audioPlayerRef.current && playingVoiceId === message.id) {
      audioPlayerRef.current.pause?.();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
      setPlayingVoiceId(null);
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause?.();
      audioPlayerRef.current.currentTime = 0;
    }

    try {
      const audio = new AudioCtor(message.mediaUri);
      audioPlayerRef.current = audio;
      setPlayingVoiceId(message.id);
      audio.onended = () => {
        setPlayingVoiceId(null);
        if (audioPlayerRef.current === audio) {
          audioPlayerRef.current = null;
        }
      };
      audio.onerror = () => {
        setPlayingVoiceId(null);
        if (audioPlayerRef.current === audio) {
          audioPlayerRef.current = null;
        }
      };
      await audio.play();
    } catch {
      setPlayingVoiceId(null);
      audioPlayerRef.current = null;
      Alert.alert('Lecture', 'Le vocal n a pas pu être lu.');
    }
  };

  const submitReport = async (message: ChatMessage, reason: string) => {
    try {
      await reportMessage(contactId, message.id, reason);
      Alert.alert('Signalement', 'Le message a bien été signalé.');
    } catch (error) {
      Alert.alert('Signalement', error instanceof Error ? error.message : 'Le signalement a échoué.');
    }
  };

  const handleReportMessage = (message: ChatMessage) => {
    if (message.senderId === 'me' || message.senderId === 'system') {
      return;
    }

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const reason = window.prompt('Pourquoi signaler ce message ?', 'Contenu inapproprié');
      if (reason && reason.trim()) {
        void submitReport(message, reason.trim());
      }
      return;
    }

    Alert.alert(
      'Signaler ce message',
      'Choisis le motif principal.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Spam', onPress: () => { void submitReport(message, 'Spam'); } },
        { text: 'Harcèlement', onPress: () => { void submitReport(message, 'Harcèlement'); } },
        { text: 'Inapproprié', onPress: () => { void submitReport(message, 'Contenu inapproprié'); } },
      ]
    );
  };

  const clearSecureViewTimers = () => {
    if (secureCountdownIntervalRef.current) {
      clearInterval(secureCountdownIntervalRef.current);
      secureCountdownIntervalRef.current = null;
    }

    if (secureAutoHideTimeoutRef.current) {
      clearTimeout(secureAutoHideTimeoutRef.current);
      secureAutoHideTimeoutRef.current = null;
    }
  };

  const openSecureMessage = (message: ChatMessage) => {
    if (message.senderId === 'me' || !message.mediaUri || viewedEphemeralIds.has(message.id)) {
      return;
    }

    const durationSec = Math.max(5, message.secureDurationSec ?? SECURE_DEFAULT_DURATION_SEC);
    clearSecureViewTimers();
    markEphemeralViewed(message.id);
    setSecureViewId(message.id);
    setSecureCountdown(durationSec);

    secureCountdownIntervalRef.current = setInterval(() => {
      setSecureCountdown((value) => Math.max(0, value - 1));
    }, 1000);

    secureAutoHideTimeoutRef.current = setTimeout(() => {
      clearSecureViewTimers();
      setSecureViewId(null);
      setSecureCountdown(SECURE_DEFAULT_DURATION_SEC);
    }, durationSec * 1000);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === 'me';
    const isSystem = item.senderId === 'system';
    const messageTime = formatMessageTime(item.timestamp);
    const sourceResponses = item.type === 'dilemma'
      ? thread.messages.filter(
          (message) =>
            message.type === 'dilemma-response' && message.dilemma?.sourceMessageId === item.id
        )
      : [];
    const myDilemmaResponse = sourceResponses.find((message) => message.senderId === 'me');
    const theirDilemmaResponse = sourceResponses.find((message) => message.senderId !== 'me' && message.senderId !== 'system');

    if (isSystem) {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      );
    }

    // Ephemeral mode activation/deactivation notices — render as centered floating notification
    const isEphemeralNotice = item.type === 'text' && item.text.startsWith('👁️ Mode éphémère');
    if (isEphemeralNotice) {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.ephemeralNoticeText}>{item.text}</Text>
        </View>
      );
    }

    const isViewed = viewedEphemeralIds.has(item.id);
  const isSecureMessage = Boolean(item.secure);
  const secureKind = item.secureKind ?? (item.type === 'video' ? 'video' : item.type === 'file' ? 'pdf' : 'image');
  const isSecureRenderable = isSecureMessage && Boolean(item.mediaUri);
  const showingSecure = secureViewId === item.id;
    const isEphemeralMedia = (item.type === 'image' || item.type === 'video') && item.ephemeral;
    const showingEphemeral = ephemeralViewId === item.id;
    const mediaLabel = getMediaLabel(item.type);
    const defaultMediaText = getDefaultMediaText(item.type);
    const callInvite = getCallInviteMeta(item);
    const locationUrl = item.type === 'text' ? extractFirstUrl(item.text) : null;
    const isLocationMessage = Boolean(locationUrl) && /maps\.google\.com|google\.com\/maps|maps\.apple\.com/i.test(locationUrl ?? '');

    const handleEphemeralTap = () => {
      if (isViewed) return;
      markEphemeralViewed(item.id);
      setEphemeralViewId(item.id);
      // Auto-close after 5 seconds
      setTimeout(() => setEphemeralViewId(null), 5000);
    };

    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowThem]}>
        {!isMe && (
          <View style={styles.avatarCircleSmall}>
            <Text style={styles.avatarEmojiSmall}>{getAvatarMonogram(thread.contactName, thread.contactAvatar)}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.messageBubble,
            isMe ? styles.messageBubbleMe : styles.messageBubbleThem,
            (item.type === 'image' || item.type === 'video') && styles.messageBubbleImage,
            item.type === 'flame' && styles.messageBubbleFlame,
          ]}
          activeOpacity={0.92}
          onLongPress={!isMe ? () => handleReportMessage(item) : undefined}
          onPress={
            isSecureRenderable && !isMe && !isViewed
              ? () => openSecureMessage(item)
              : isEphemeralMedia && !isMe && !isViewed
                ? handleEphemeralTap
                : undefined
          }
        >
          {isSecureRenderable ? (
            isViewed && !showingSecure ? (
              <View style={[styles.ephemeralViewed]}>
                <Ionicons name="eye-outline" size={18} color="rgba(15,23,42,0.46)" style={styles.ephemeralViewedIcon} />
                <Text style={[styles.ephemeralViewedText, isMe && styles.ephemeralViewedTextMe]}>
                  Contenu temporaire expiré
                </Text>
              </View>
            ) : showingSecure && item.mediaUri ? (
              <>
                {secureKind === 'video' ? (
                  <VideoMessage uri={item.mediaUri} secure />
                ) : secureKind === 'pdf' ? (
                  Platform.OS === 'web' ? (
                    React.createElement('iframe', {
                      src: item.mediaUri,
                      style: {
                        width: 220,
                        height: 280,
                        borderRadius: 16,
                        border: '1px solid rgba(15,23,42,0.12)',
                        marginBottom: 6,
                        backgroundColor: '#fff',
                      },
                    })
                  ) : (
                    <View style={styles.videoFallback}>
                      <Ionicons name="document-text-outline" size={30} color="#E2E8F0" style={styles.videoFallbackIcon} />
                      <Text style={styles.videoFallbackText}>Document sécurisé ouvert</Text>
                    </View>
                  )
                ) : (
                  <Image source={{ uri: item.mediaUri }} style={styles.photoMessage} resizeMode="cover" />
                )}
                <View style={styles.secureTimer}>
                  <Text style={styles.secureTimerText}>Destruction dans {secureCountdown}s</Text>
                </View>
              </>
            ) : isMe ? (
              <View style={styles.ephemeralSentBox}>
                <Ionicons name="eye-outline" size={18} color="#3D5F84" style={styles.ephemeralSentIcon} />
                <Text style={[styles.ephemeralViewedText, styles.ephemeralViewedTextMe]}>
                  Contenu temporaire envoyé (30s)
                </Text>
              </View>
            ) : (
              <View style={styles.ephemeralTapBox}>
                <Ionicons name="eye-outline" size={24} color="#3D5F84" style={styles.ephemeralTapIcon} />
                <Text style={styles.ephemeralTapText}>Appuie pour ouvrir</Text>
                <Text style={styles.ephemeralTapSub}>Effacement en 30s</Text>
              </View>
            )
          ) : isEphemeralMedia ? (
            isViewed && !showingEphemeral ? (
              <View style={[styles.ephemeralViewed]}>
                <Ionicons name="eye-outline" size={18} color="rgba(15,23,42,0.46)" style={styles.ephemeralViewedIcon} />
                <Text style={[styles.ephemeralViewedText, isMe && styles.ephemeralViewedTextMe]}>
                  {mediaLabel} vue
                </Text>
              </View>
            ) : showingEphemeral && item.mediaUri ? (
              <>
                {item.type === 'video' ? (
                  <VideoMessage uri={item.mediaUri} />
                ) : (
                  <Image source={{ uri: item.mediaUri }} style={styles.photoMessage} resizeMode="cover" />
                )}
                <View style={styles.ephemeralTimer}>
                  <Text style={styles.ephemeralTimerText}>Disparait dans 5s</Text>
                </View>
              </>
            ) : isMe ? (
              <View style={styles.ephemeralSentBox}>
                <Ionicons name="eye-outline" size={18} color="#3D5F84" style={styles.ephemeralSentIcon} />
                <Text style={[styles.ephemeralViewedText, styles.ephemeralViewedTextMe]}>
                  {mediaLabel} éphémère envoyée
                </Text>
              </View>
            ) : (
              <View style={styles.ephemeralTapBox}>
                <Ionicons name="eye-outline" size={24} color="#3D5F84" style={styles.ephemeralTapIcon} />
                <Text style={styles.ephemeralTapText}>Appuie pour voir</Text>
                <Text style={styles.ephemeralTapSub}>1 seul visionnage</Text>
              </View>
            )
          ) : (item.type === 'image' || item.type === 'video') && item.mediaUri ? (
            <>
              {item.type === 'video' ? (
                <VideoMessage uri={item.mediaUri} />
              ) : (
                <Image source={{ uri: item.mediaUri }} style={styles.photoMessage} resizeMode="cover" />
              )}
              {item.text && item.text !== defaultMediaText ? (
                <Text style={[styles.messageText, isMe && styles.messageTextMe]}>{item.text}</Text>
              ) : null}
            </>
          ) : item.type === 'voice' ? (
            <TouchableOpacity
              style={styles.voiceMessageRow}
              activeOpacity={0.82}
              onPress={() => handleToggleVoicePlayback(item)}
            >
              <View style={[styles.voicePlayButton, isMe && styles.voicePlayButtonMe]}>
                <Ionicons
                  name={playingVoiceId === item.id ? 'pause' : 'play'}
                  size={13}
                  color={isMe ? '#0F172A' : '#1E293B'}
                  style={[styles.voicePlayIcon, isMe && styles.voicePlayIconMe]}
                />
              </View>
              <View style={styles.voiceMeta}>
                <View style={[styles.voiceWave, isMe && styles.voiceWaveMe]}>
                  <View style={[styles.voiceWaveFill, isMe && styles.voiceWaveFillMe]} />
                </View>
                <Text style={[styles.voiceDuration, isMe && styles.voiceDurationMe]}>
                  {formatVoiceDuration(item.durationMs)}
                </Text>
              </View>
            </TouchableOpacity>
          ) : item.type === 'flame' ? (
            <View style={styles.flameMessage}>
              <Ionicons name="flame-outline" size={24} color="#4E6E92" />
            </View>
          ) : item.type === 'dilemma' && item.dilemma ? (
            <View style={styles.dilemmaCard}>
              <Text style={[styles.dilemmaEyebrow, isMe && styles.dilemmaEyebrowMe]}>Dilemme partagé</Text>
              <Text style={[styles.dilemmaQuestion, isMe && styles.dilemmaQuestionMe]}>{item.dilemma.question}</Text>
              <View style={styles.dilemmaChoicesWrap}>
                {item.dilemma.choices.map((choiceLabel, choiceIndex) => {
                  const isSelected = myDilemmaResponse?.dilemma?.selectedChoiceIndex === choiceIndex;
                  const disabled = isMe || Boolean(myDilemmaResponse);

                  return (
                    <TouchableOpacity
                      key={`${item.id}-${choiceIndex}`}
                      style={[
                        styles.dilemmaChoiceButton,
                        isSelected && styles.dilemmaChoiceButtonSelected,
                        disabled && styles.dilemmaChoiceButtonDisabled,
                      ]}
                      activeOpacity={disabled ? 1 : 0.85}
                      disabled={disabled}
                      onPress={() => { void handleAnswerDilemma(item, choiceIndex); }}
                    >
                      <Text style={[
                        styles.dilemmaChoiceText,
                        isSelected && styles.dilemmaChoiceTextSelected,
                      ]}>
                        {choiceLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {isMe && !theirDilemmaResponse ? (
                <Text style={styles.dilemmaFootnote}>En attente de sa réponse.</Text>
              ) : null}
              {!isMe && myDilemmaResponse ? (
                <Text style={styles.dilemmaFootnote}>Réponse envoyée.</Text>
              ) : null}
            </View>
          ) : item.type === 'dilemma-response' && item.dilemma ? (
            <View style={styles.dilemmaResponseCard}>
              <Text style={[styles.dilemmaResponseLabel, isMe && styles.dilemmaResponseLabelMe]}>Réponse au dilemme</Text>
              <Text style={[styles.dilemmaResponseChoice, isMe && styles.dilemmaResponseChoiceMe]}>
                {item.dilemma.selectedChoiceLabel ?? item.text}
              </Text>
            </View>
          ) : item.type === 'call' && callInvite ? (
            <View style={styles.callInviteCard}>
              <View style={styles.callInviteHeader}>
                <View style={[styles.callInviteIconWrap, isMe && styles.callInviteIconWrapMe]}>
                  <Ionicons
                    name={callInvite.iconName}
                    size={18}
                    color={isMe ? '#1D4ED8' : '#3D5F84'}
                  />
                </View>
                <View style={styles.callInviteTextWrap}>
                  <Text style={[styles.callInviteTitle, isMe && styles.callInviteTitleMe]}>
                    {callInvite.title}
                  </Text>
                  <Text style={[styles.callInviteSubtitle, isMe && styles.callInviteSubtitleMe]}>
                    {isMe
                      ? 'Invitation envoyee. Ouvre le salon et attends sa connexion.'
                      : callInvite.subtitle}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.callInviteAction, isMe && styles.callInviteActionMe]}
                activeOpacity={0.84}
                onPress={() => {
                  Linking.openURL(callInvite.callLink).catch(() => {
                    Alert.alert('Appel', "Impossible d'ouvrir le salon d'appel.");
                  });
                }}
              >
                <Text style={[styles.callInviteActionText, isMe && styles.callInviteActionTextMe]}>
                  {isMe ? 'Ouvrir le salon' : callInvite.actionLabel}
                </Text>
              </TouchableOpacity>
            </View>
          ) : isLocationMessage ? (
            <View style={styles.locationMessageWrap}>
              <View style={styles.locationMessageRow}>
                <Ionicons name="location" size={16} color={isMe ? '#1D4ED8' : '#3D5F84'} />
                <Text style={[styles.locationMessageTitle, isMe && styles.locationMessageTitleMe]}>Localisation partagée</Text>
              </View>
              <Text style={[styles.locationMessageUrl, isMe && styles.locationMessageUrlMe]} numberOfLines={1}>
                {locationUrl}
              </Text>
              <TouchableOpacity
                style={[styles.locationOpenBtn, isMe && styles.locationOpenBtnMe]}
                activeOpacity={0.82}
                onPress={() => {
                  if (!locationUrl) return;
                  Linking.openURL(locationUrl).catch(() => {
                    Alert.alert('Carte', 'Impossible d’ouvrir la localisation.');
                  });
                }}
              >
                <Text style={[styles.locationOpenBtnText, isMe && styles.locationOpenBtnTextMe]}>Ouvrir la carte</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
              {item.text}
            </Text>
          )}
          <Text style={[styles.messageTime, isMe ? styles.messageTimeMe : styles.messageTimeThem]}>
            {messageTime}
          </Text>
          {isMe ? (
            <Ionicons
              name="checkmark"
              size={14}
              color={item.seenByRecipient ? '#1D4ED8' : '#94A3B8'}
              style={styles.readReceiptIcon}
            />
          ) : null}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#64748B" style={styles.backButtonIcon} />
          {newIncomingCount > 0 && (
            <View style={styles.newMsgBadge}>
              <Text style={styles.newMsgBadgeText}>{newIncomingCount > 9 ? '9+' : newIncomingCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerInfo}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ContactProfile', { contactId })}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{getAvatarMonogram(thread.contactName, thread.contactAvatar)}</Text>
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerName}>{thread.contactName}</Text>
            <View style={styles.headerStatusRow}>
              {thread.isContactTyping ? <View style={styles.liveDot} /> : null}
              <Text style={styles.headerStatus}>{contactStatusLabel}</Text>
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.ghostBtn}
            onPress={() => { void handleToggleEphemeralMode24h(); }}
            activeOpacity={0.75}
            disabled={isTogglingEphemeralMode}
          >
            <Ionicons
              name={thread.ephemeralMode24h ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={thread.ephemeralMode24h ? '#1D4ED8' : '#3D5F84'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={handleCallPress}
            activeOpacity={0.75}
          >
            <Ionicons name="call-outline" size={20} color="#3D5F84" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={Boolean(activeQuickMenu)}
        transparent
        animationType="fade"
        onRequestClose={closeQuickMenu}
      >
        <View style={styles.quickMenuOverlay}>
          <TouchableOpacity
            style={styles.quickMenuBackdrop}
            activeOpacity={1}
            onPress={dismissQuickMenu}
          />
          <View style={styles.quickMenuSheet}>
            <Text style={styles.quickMenuTitle}>
              {activeQuickMenu === 'call' ? `Appeler ${thread.contactName}` : 'Ajouter'}
            </Text>

            {activeQuickMenu === 'call' ? (
              <>
                <TouchableOpacity
                  style={styles.quickMenuOption}
                  activeOpacity={0.84}
                  onPress={() => runQuickMenuAction(() => handleStartCall('voice'))}
                >
                  <View style={styles.quickMenuOptionInner}>
                    <Ionicons name="call-outline" size={18} color="#3D5F84" />
                    <Text style={styles.quickMenuOptionText}>Appel vocal</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickMenuOption}
                  activeOpacity={0.84}
                  onPress={() => runQuickMenuAction(() => handleStartCall('video'))}
                >
                  <View style={styles.quickMenuOptionInner}>
                    <Ionicons name="videocam-outline" size={18} color="#3D5F84" />
                    <Text style={styles.quickMenuOptionText}>Appel visio</Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.quickMenuOption}
                  activeOpacity={0.84}
                  onPress={() => runQuickMenuAction(() => handlePickMedia('camera'))}
                >
                  <View style={styles.quickMenuOptionInner}>
                    <Ionicons name="camera-outline" size={18} color="#3D5F84" />
                    <Text style={styles.quickMenuOptionText}>Appareil photo</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickMenuOption}
                  activeOpacity={0.84}
                  onPress={() => runQuickMenuAction(() => handlePickMedia('library'))}
                >
                  <View style={styles.quickMenuOptionInner}>
                    <Ionicons name="images-outline" size={18} color="#3D5F84" />
                    <Text style={styles.quickMenuOptionText}>Photothèque</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickMenuOption}
                  activeOpacity={0.84}
                  onPress={() => runQuickMenuAction(handlePickFile)}
                >
                  <View style={styles.quickMenuOptionInner}>
                    <Ionicons name="folder-open-outline" size={18} color="#3D5F84" />
                    <Text style={styles.quickMenuOptionText}>Fichiers</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickMenuOption}
                  activeOpacity={0.84}
                  onPress={() => runQuickMenuAction(handleSendLocation)}
                >
                  <View style={styles.quickMenuOptionInner}>
                    <Ionicons name="location-outline" size={18} color="#3D5F84" />
                    <Text style={styles.quickMenuOptionText}>Localisation</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickMenuOption}
                  activeOpacity={0.84}
                  onPress={() => runQuickMenuAction(handleOpenDilemmaPicker)}
                >
                  <View style={styles.quickMenuOptionInner}>
                    <Ionicons name="help-circle-outline" size={18} color="#3D5F84" />
                    <Text style={styles.quickMenuOptionText}>Partager un dilemme</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickMenuOption}
                  activeOpacity={0.84}
                  onPress={() => runQuickMenuAction(() => { setShowGhostModal(true); setGhostResult(null); setGhostError(''); })}
                >
                  <View style={styles.quickMenuOptionInner}>
                    <Ionicons name="analytics-outline" size={18} color="#3D5F84" />
                    <Text style={styles.quickMenuOptionText}>Analyse opt in</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[styles.quickMenuOption, styles.quickMenuCancel]}
              activeOpacity={0.84}
              onPress={dismissQuickMenu}
            >
              <Text style={styles.quickMenuCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDilemmaPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDilemmaPicker(false)}
      >
        <View style={styles.ghostOverlay}>
          <View style={styles.dilemmaPickerSheet}>
            <Text style={styles.previewTitle}>Partager un dilemme</Text>
            <TextInput
              style={styles.dilemmaSearchInput}
              placeholder="Rechercher un dilemme..."
              placeholderTextColor={p.textMuted}
              value={dilemmaQuery}
              onChangeText={setDilemmaQuery}
            />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.dilemmaPickerList}>
              {dilemmaCandidates.map((scenario) => (
                <TouchableOpacity
                  key={scenario.id}
                  style={styles.dilemmaPickerCard}
                  activeOpacity={0.84}
                  onPress={() => { void handleShareDilemma(scenario); }}
                >
                  <Text style={styles.dilemmaPickerQuestion}>{scenario.question}</Text>
                  <Text style={styles.dilemmaPickerMeta}>{scenario.choices.length} réponses possibles</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.ghostCloseBtn} onPress={() => setShowDilemmaPicker(false)} activeOpacity={0.8}>
              <Text style={styles.ghostCloseBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showGhostModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGhostModal(false)}
      >
        <View style={styles.ghostOverlay}>
          <View style={styles.ghostSheet}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.ghostHeadingRow}>
                <Ionicons name="eye-outline" size={18} color="#3D5F84" />
                <Text style={styles.ghostTitle}>Pourquoi ça s'est arrêté ?</Text>
              </View>

              {ghostResult ? (
                <View style={styles.ghostResultBox}>
                  <Text style={styles.ghostResultText}>{ghostResult.insight}</Text>
                </View>
              ) : ghostError ? (
                <View style={styles.ghostErrorBox}>
                  <Text style={styles.ghostErrorText}>{ghostError}</Text>
                </View>
              ) : null}

              {!ghostResult && (
                <TouchableOpacity
                  style={[styles.ghostAnalyzeBtn, ghostLoading && styles.ghostAnalyzeBtnDisabled]}
                  onPress={() => { void handleGhostAnalysis(); }}
                  activeOpacity={0.85}
                  disabled={ghostLoading}
                >
                  <Text style={styles.ghostAnalyzeBtnText}>
                    {ghostLoading ? 'Analyse en cours...' : "Lancer l'analyse (opt-in)"}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.ghostCloseBtn}
                onPress={() => setShowGhostModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.ghostCloseBtnText}>Fermer</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(pendingMedia)}
        transparent
        animationType="fade"
        onRequestClose={closePendingMedia}
      >
        <View style={styles.previewOverlay}>
          <View style={styles.previewSheet}>
            <Text style={styles.previewTitle}>Préparer l'envoi</Text>

            {pendingMedia?.type === 'video' ? (
              <VideoMessage uri={pendingMedia.uri} />
            ) : pendingMedia?.uri ? (
              <Image source={{ uri: pendingMedia.uri }} style={styles.previewImage} resizeMode="cover" />
            ) : null}

            <View style={styles.previewDiscreetRow}>
              <TouchableOpacity
                style={[styles.discreetToggle, isEphemeral30SecEnabled && styles.discreetToggleActive]}
                onPress={() => setIsEphemeral30SecEnabled((current) => !current)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="eye-off-outline"
                  size={18}
                  color={isEphemeral30SecEnabled ? '#3D5F84' : '#6B7280'}
                />
              </TouchableOpacity>
              <Text style={styles.discreetToggleLabel}>Éphémère 30 secondes</Text>
            </View>

            <View style={styles.previewButtonsRow}>
              <TouchableOpacity
                style={[styles.previewActionBtn, styles.previewCancelBtn]}
                onPress={closePendingMedia}
                activeOpacity={0.85}
              >
                <Text style={styles.previewCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.previewActionBtn, styles.previewSendBtn]}
                onPress={() => { void handleSendPendingMedia(); }}
                activeOpacity={0.85}
              >
                <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Chat Area */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <FlatList
          ref={flatListRef}
          data={thread.messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.messageList, { paddingBottom: isKeyboardVisible ? 8 : 18 }]}
        />

        {/* Input Area */}
        <View style={[styles.composerContainer, { paddingBottom: Math.max(8, insets.bottom) }]}>
          <View style={styles.composerRow}>
            <TouchableOpacity
              style={styles.actionCircle}
              onPress={handleOpenAttachmentMenu}
              disabled={isSendingMedia || isRecordingVoice}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={24} color="#3D5F84" />
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={isRecordingVoice ? 'Enregistrement du vocal...' : 'Écrivez un message...'}
                placeholderTextColor={p.textMuted}
                value={inputText}
                onChangeText={setInputText}
                multiline={false}
                maxLength={300}
                editable={!isRecordingVoice}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
            </View>

            <TouchableOpacity
              style={styles.actionCircle}
              onPress={handleOpenCameraMenu}
              disabled={isSendingMedia || isRecordingVoice}
              activeOpacity={0.8}
            >
              {isSendingMedia ? (
                <Text style={styles.iconBusyText}>…</Text>
              ) : (
                <Ionicons name="camera-outline" size={22} color="#3D5F84" />
              )}
            </TouchableOpacity>

            {inputText.trim() ? (
              <TouchableOpacity
                style={[styles.sendButton, isSendingText && styles.sendButtonDisabled]}
                onPress={handleSend}
                activeOpacity={0.84}
                disabled={isSendingText}
              >
                {isSendingText ? (
                  <Text style={styles.iconBusyText}>…</Text>
                ) : (
                  <Ionicons name="arrow-up" size={18} color="#F8FBFF" />
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionCircle, isRecordingVoice && styles.recordingButton]}
                onLongPress={() => { void handleVoiceLongPress(); }}
                onPressOut={handleVoicePressOut}
                delayLongPress={150}
                activeOpacity={0.84}
              >
                <Ionicons
                  name="mic-outline"
                  size={22}
                  color="#3D5F84"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {isRecordingVoice ? (
          <Text style={styles.recordingHint}>Relâche pour envoyer ton vocal.</Text>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(p: ReturnType<typeof getThemeColors>, themeMode: 'light' | 'dark') {
  const isDark = themeMode === 'dark';
  const panel = isDark ? '#081426' : '#FFFFFF';
  const panelSoft = isDark ? '#060D1E' : '#F4F8FC';
  const border = isDark ? 'rgba(19,32,64,0.9)' : 'rgba(61,95,132,0.15)';
  const borderSoft = isDark ? 'rgba(19,32,64,0.55)' : 'rgba(61,95,132,0.12)';
  const incomingBubble = isDark ? '#0A1628' : '#FFFFFF';
  const outgoingBubble = isDark ? 'rgba(124,203,255,0.18)' : '#DCEEFF';
  const overlay = isDark ? 'rgba(0,0,0,0.62)' : 'rgba(15,23,42,0.28)';
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: p.background },
  keyboardView: { flex: 1 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  errorText: { ...Typography.body, color: p.textSecondary },
  backBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  backBtnText: { ...Typography.bodyBold, color: p.accent },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: panelSoft,
    borderBottomWidth: 1,
    borderBottomColor: border,
    ...Platform.select({
      web: { boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.32)' : '0 2px 8px rgba(34,64,99,0.08)' },
    }),
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newMsgBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#1D4ED8',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  newMsgBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 11,
  },
  backButtonIcon: { marginTop: -1 },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerTextWrap: { gap: 1 },
  headerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: p.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 16, fontWeight: '700', color: p.text, letterSpacing: 0.4 },
  headerName: { ...Typography.bodyBold, color: p.text },
  headerStatus: {
    ...Typography.caption,
    color: p.textSecondary,
    fontSize: 11,
    lineHeight: 14,
  },
  messageList: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  systemMessage: { alignItems: 'center', marginVertical: Spacing.md },
  systemMessageText: {
    ...Typography.caption,
    color: p.textSecondary,
    backgroundColor: panel,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  ephemeralNoticeText: {
    fontSize: 11,
    color: p.textSecondary,
    backgroundColor: panel,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 },
  messageRowMe: { justifyContent: 'flex-end' },
  messageRowThem: { justifyContent: 'flex-start', gap: Spacing.xs },
  avatarCircleSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: p.accentLight,
    borderWidth: 1,
    borderColor: borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmojiSmall: { fontSize: 13, fontWeight: '700', color: p.text, letterSpacing: 0.3 },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 18,
  },
  messageBubbleMe: {
    backgroundColor: outgoingBubble,
    borderBottomRightRadius: 6,
  },
  messageBubbleThem: {
    backgroundColor: incomingBubble,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: borderSoft,
    ...Platform.select({
      web: { boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.35)' : '0 1px 4px rgba(15,23,42,0.08)' },
    }),
  },
  messageBubbleImage: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  messageBubbleFlame: {
    minWidth: 64,
    alignItems: 'center',
  },
  dilemmaCard: {
    minWidth: 220,
    gap: 10,
  },
  dilemmaEyebrow: {
    ...Typography.captionBold,
    color: p.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dilemmaEyebrowMe: {
    color: p.accent,
  },
  dilemmaQuestion: {
    ...Typography.bodyBold,
    color: p.text,
    lineHeight: 21,
  },
  dilemmaQuestionMe: {
    color: p.text,
  },
  dilemmaChoicesWrap: {
    gap: 8,
  },
  dilemmaChoiceButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: borderSoft,
    backgroundColor: panel,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dilemmaChoiceButtonSelected: {
    backgroundColor: p.accentLight,
    borderColor: p.accent,
  },
  dilemmaChoiceButtonDisabled: {
    opacity: 0.88,
  },
  dilemmaChoiceText: {
    ...Typography.captionBold,
    color: p.text,
    lineHeight: 18,
  },
  dilemmaChoiceTextSelected: {
    color: p.accent,
  },
  dilemmaFootnote: {
    ...Typography.caption,
    color: p.textSecondary,
  },
  dilemmaResponseCard: {
    gap: 6,
    minWidth: 180,
  },
  dilemmaResponseLabel: {
    ...Typography.caption,
    color: p.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dilemmaResponseLabelMe: {
    color: p.accent,
  },
  dilemmaResponseChoice: {
    ...Typography.bodyBold,
    color: p.text,
  },
  dilemmaResponseChoiceMe: {
    color: p.text,
  },
  callInviteCard: {
    minWidth: 220,
    gap: 10,
  },
  callInviteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  callInviteIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: p.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callInviteIconWrapMe: {
    backgroundColor: p.accentLight,
  },
  callInviteTextWrap: {
    flex: 1,
    gap: 2,
  },
  callInviteTitle: {
    ...Typography.bodyBold,
    color: p.text,
  },
  callInviteTitleMe: {
    color: p.text,
  },
  callInviteSubtitle: {
    ...Typography.caption,
    color: p.textSecondary,
    lineHeight: 17,
  },
  callInviteSubtitleMe: {
    color: '#4B6B95',
  },
  callInviteAction: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: p.accentLight,
  },
  callInviteActionMe: {
    backgroundColor: p.accentLight,
  },
  callInviteActionText: {
    ...Typography.captionBold,
    color: p.accent,
  },
  callInviteActionTextMe: {
    color: p.accent,
  },
  messageText: { ...Typography.body, color: p.text, lineHeight: 21 },
  messageTextMe: { color: p.text },
  locationMessageWrap: {
    minWidth: 190,
    gap: 6,
  },
  locationMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationMessageTitle: {
    ...Typography.captionBold,
    color: p.text,
  },
  locationMessageTitleMe: {
    color: p.accent,
  },
  locationMessageUrl: {
    ...Typography.caption,
    color: p.textSecondary,
  },
  locationMessageUrlMe: {
    color: p.textSecondary,
  },
  locationOpenBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: p.accentLight,
  },
  locationOpenBtnMe: {
    backgroundColor: p.accentLight,
  },
  locationOpenBtnText: {
    ...Typography.captionBold,
    color: p.accent,
  },
  locationOpenBtnTextMe: {
    color: p.accent,
  },
  messageTime: {
    ...Typography.caption,
    marginTop: 5,
    alignSelf: 'flex-end',
    fontSize: 10,
    lineHeight: 12,
  },
  messageTimeMe: {
    color: p.textMuted,
  },
  messageTimeThem: {
    color: p.textMuted,
  },
  readReceiptIcon: {
    alignSelf: 'flex-end',
    marginTop: 3,
  },
  photoMessage: {
    width: 212,
    height: 212,
    borderRadius: Radius.md,
    marginBottom: 6,
    backgroundColor: p.card,
  },
  videoFallback: {
    width: 210,
    height: 210,
    borderRadius: Radius.md,
    marginBottom: 6,
    backgroundColor: panel,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  videoFallbackIcon: {
    opacity: 0.92,
  },
  videoFallbackText: {
    ...Typography.caption,
    color: p.white,
  },
  voiceMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minWidth: 180,
  },
  voicePlayButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: p.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voicePlayButtonMe: {
    backgroundColor: p.accentLight,
  },
  voicePlayIcon: {
    opacity: 0.95,
  },
  voicePlayIconMe: {
    opacity: 1,
  },
  voiceMeta: {
    flex: 1,
    gap: 6,
  },
  voiceWave: {
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: borderSoft,
    overflow: 'hidden',
  },
  voiceWaveMe: {
    backgroundColor: borderSoft,
  },
  voiceWaveFill: {
    width: '42%',
    height: '100%',
    backgroundColor: '#7CB6E9',
    borderRadius: Radius.full,
  },
  voiceWaveFillMe: {
    backgroundColor: '#5D9BD2',
  },
  voiceDuration: {
    ...Typography.caption,
    color: p.textSecondary,
  },
  voiceDurationMe: {
    color: p.textSecondary,
  },
  flameMessage: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,203,255,0.22)',
  },
  composerContainer: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: panelSoft,
    borderTopWidth: 1,
    borderTopColor: border,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inputContainer: {
    flex: 1,
  },
  actionCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBusyText: {
    fontSize: 20,
    color: p.accent,
    lineHeight: 22,
  },
  input: {
    flex: 1,
    backgroundColor: panel,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: borderSoft,
    paddingHorizontal: 16,
    paddingVertical: 0,
    height: 38,
    ...Typography.body,
    color: p.text,
    fontSize: 14,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: p.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  recordingButton: {
    backgroundColor: p.accentLight,
  },
  recordingHint: {
    ...Typography.caption,
    color: p.textSecondary,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  quickMenuOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: overlay,
  },
  quickMenuBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  quickMenuSheet: {
    backgroundColor: panelSoft,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderColor: 'rgba(61,95,132,0.15)',
    gap: 8,
  },
  quickMenuTitle: {
    ...Typography.bodyBold,
    color: p.text,
    marginBottom: 4,
  },
  quickMenuOption: {
    minHeight: 44,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: 'rgba(61,95,132,0.14)',
  },
  quickMenuOptionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quickMenuOptionText: {
    ...Typography.body,
    color: p.text,
  },
  quickMenuCancel: {
    marginTop: 4,
    backgroundColor: panel,
  },
  quickMenuCancelText: {
    ...Typography.bodyBold,
    color: p.textSecondary,
  },
  // Ephemeral media styles
  ephemeralTapBox: {
    alignItems: 'center',
    padding: Spacing.md,
    gap: 4,
    minWidth: 160,
  },
  ephemeralTapIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  ephemeralTapText: {
    ...Typography.bodyBold,
    color: p.text,
  },
  ephemeralTapSub: {
    ...Typography.caption,
    color: p.textMuted,
  },
  ephemeralViewed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    minWidth: 120,
  },
  ephemeralViewedIcon: {
    fontSize: 18,
    opacity: 0.5,
  },
  ephemeralViewedText: {
    ...Typography.caption,
    color: p.textMuted,
  },
  ephemeralViewedTextMe: {
    color: '#64748B',
  },
  ephemeralSentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    minWidth: 160,
  },
  ephemeralSentIcon: {
    fontSize: 18,
    opacity: 0.8,
  },
  ephemeralTimer: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    alignSelf: 'center',
    marginTop: 6,
  },
  ephemeralTimerText: {
    ...Typography.caption,
    color: p.white,
  },
  secureTimer: {
    backgroundColor: 'rgba(15,23,42,0.78)',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    alignSelf: 'center',
    marginTop: 6,
  },
  secureTimerText: {
    ...Typography.caption,
    color: p.white,
  },
  // Ghost Analysis
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  ghostSheet: {
    backgroundColor: p.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    maxHeight: '75%',
  },
  ghostTitle: {
    ...Typography.title,
    color: p.text,
    marginBottom: Spacing.sm,
  },
  ghostHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ghostSub: {
    ...Typography.body,
    color: p.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  ghostPrivacy: {
    ...Typography.caption,
    color: p.textMuted,
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },
  ghostResultBox: {
    backgroundColor: panel,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  ghostResultText: {
    color: p.text,
    fontSize: 14,
    lineHeight: 22,
  },
  ghostErrorBox: {
    backgroundColor: isDark ? 'rgba(192,57,43,0.18)' : '#FFF1F0',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  ghostErrorText: {
    color: '#C0392B',
    fontSize: 13,
    lineHeight: 20,
  },
  ghostAnalyzeBtn: {
    backgroundColor: p.accent,
    borderRadius: Radius.md,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  ghostAnalyzeBtnDisabled: {
    opacity: 0.6,
  },
  ghostAnalyzeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  ghostCloseBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostCloseBtnText: {
    ...Typography.body,
    color: p.textSecondary,
  },
  dilemmaPickerSheet: {
    backgroundColor: panelSoft,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    maxHeight: '78%',
    gap: 12,
  },
  dilemmaSearchInput: {
    backgroundColor: panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: borderSoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...Typography.body,
    color: p.text,
  },
  dilemmaPickerList: {
    gap: 10,
    paddingBottom: 8,
  },
  dilemmaPickerCard: {
    backgroundColor: panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: borderSoft,
    padding: 14,
    gap: 6,
  },
  dilemmaPickerQuestion: {
    ...Typography.bodyBold,
    color: p.text,
    lineHeight: 22,
  },
  dilemmaPickerMeta: {
    ...Typography.caption,
    color: p.textSecondary,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: overlay,
    justifyContent: 'center',
    padding: 18,
  },
  previewSheet: {
    backgroundColor: panelSoft,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: border,
    gap: 12,
  },
  previewTitle: {
    ...Typography.bodyBold,
    color: p.text,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 14,
    backgroundColor: p.background,
  },
  previewDiscreetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  discreetToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: panel,
    borderWidth: 1,
    borderColor: borderSoft,
  },
  discreetToggleActive: {
    backgroundColor: p.accentLight,
    borderColor: p.accent,
  },
  discreetToggleLabel: {
    ...Typography.caption,
    color: p.textSecondary,
  },
  previewButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  previewActionBtn: {
    minWidth: 44,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  previewCancelBtn: {
    backgroundColor: panel,
    borderWidth: 1,
    borderColor: borderSoft,
  },
  previewCancelText: {
    ...Typography.captionBold,
    color: p.textSecondary,
  },
  previewSendBtn: {
    backgroundColor: p.accent,
  },
  });
}
