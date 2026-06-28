import { errorResponse, jsonResponse, parseJsonBody, HttpError } from './_lib/http';
import { getUserBySessionToken } from './_lib/service';

// Ghost Analysis — opt-in, rate-limited, no message storage.
// Messages are analyzed in-memory and immediately discarded.
// Rate limit: 1 call per 24h per user, enforced server-side via a simple timestamp blob.

const RATE_LIMIT_MS = 24 * 60 * 60 * 1000;

interface GhostAnalysisRequest {
  messages?: Array<{ senderId: string; text: string }>;
}

interface AnalysisResult {
  insight: string;
  tone: 'soft' | 'direct';
}

function anonymize(messages: Array<{ senderId: string; text: string }>) {
  const participants = new Map<string, string>();
  let counter = 0;
  return messages.map((m) => {
    if (!participants.has(m.senderId)) {
      participants.set(m.senderId, `Personne ${++counter}`);
    }
    return { role: participants.get(m.senderId)!, text: m.text };
  });
}

function detectStopTrigger(
  messages: Array<{ role: string; text: string }>
): string | null {
  if (messages.length < 4) return null;

  // Find the last 3 messages sent by "Personne 1" (the user)
  const myMessages = messages.filter((m) => m.role === 'Personne 1');
  if (myMessages.length === 0) return null;

  // Check if the conversation trailed off after the last reply
  const lastReply = [...messages].reverse().find((m) => m.role !== 'Personne 1');
  if (!lastReply) return null;

  const lastReplyIndex = messages.lastIndexOf(lastReply);
  const afterLastReply = messages.slice(lastReplyIndex + 1);
  const myRepliesAfter = afterLastReply.filter((m) => m.role === 'Personne 1').length;

  // Detect topic keywords in the message that preceded the silence
  const triggerMessage = lastReply.text.toLowerCase();
  const triggers: Record<string, string> = {
    'argent|dettes|finances|loyer': 'l\'argent',
    'avenir|projet|engagement|sérieux': 'l\'avenir à deux',
    'famille|parents|enfant': 'la famille',
    'ex|passé|ancienne|ancien': 'le passé amoureux',
    'corps|physique|physiquement|désir': 'l\'attirance physique',
    'confiance|doute|mentir|mensonge': 'la confiance',
  };

  for (const [pattern, topic] of Object.entries(triggers)) {
    if (new RegExp(pattern).test(triggerMessage)) {
      if (myRepliesAfter === 0) {
        return `la conversation s\'est arrêtée juste après un message sur ${topic}`;
      }
    }
  }

  if (myRepliesAfter === 0 && myMessages.length >= 2) {
    return 'tu as arrêté de répondre sans raison apparente dans les messages';
  }

  return null;
}

function generateInsight(
  messages: Array<{ role: string; text: string }>
): AnalysisResult {
  const trigger = detectStopTrigger(messages);

  if (trigger) {
    return {
      insight: `Weto a détecté que ${trigger}. Ce type de sujet peut créer un blocage réflexe, même sans décision consciente.`,
      tone: 'soft',
    };
  }

  const myWordCount = messages
    .filter((m) => m.role === 'Personne 1')
    .reduce((acc, m) => acc + m.text.split(/\s+/).length, 0);

  const theirWordCount = messages
    .filter((m) => m.role !== 'Personne 1')
    .reduce((acc, m) => acc + m.text.split(/\s+/).length, 0);

  if (myWordCount < theirWordCount * 0.4) {
    return {
      insight: 'Tu as répondu beaucoup moins que l\'autre. Weto y voit une réserve ou une fatigue conversationnelle — pas forcément un désintérêt.',
      tone: 'soft',
    };
  }

  if (theirWordCount < myWordCount * 0.4) {
    return {
      insight: 'L\'autre a très peu répondu. Weto ne peut pas déterminer si c\'est un retrait ou juste un style laconique.',
      tone: 'direct',
    };
  }

  return {
    insight: 'Pas de déclencheur évident détecté. Parfois les conversations s\'arrêtent simplement — pas de signal fort à interpréter ici.',
    tone: 'soft',
  };
}

function getSessionToken(request: Request) {
  return request.headers.get('x-weto-session')?.trim() ?? '';
}

export default async (request: Request) => {
  try {
    if (request.method !== 'POST') {
      throw new HttpError(405, 'Méthode non autorisée.');
    }

    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      throw new HttpError(401, 'Session absente.');
    }

    const user = await getUserBySessionToken(sessionToken);
    if (!user) {
      throw new HttpError(401, 'Session invalide.');
    }

    // Rate limit check — stored as a plain timestamp in blobs
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('weto-ghost-rl');
    const rlKey = `rl:${user.id}`;
    const lastCallRaw = await store.get(rlKey, { type: 'text' });
    const lastCall = lastCallRaw ? parseInt(lastCallRaw as string, 10) : 0;
    if (Date.now() - lastCall < RATE_LIMIT_MS) {
      const waitMs = RATE_LIMIT_MS - (Date.now() - lastCall);
      const waitHours = Math.ceil(waitMs / (60 * 60 * 1000));
      throw new HttpError(429, `Ghost Analysis disponible dans ${waitHours}h. Une analyse toutes les 24h.`);
    }

    const body = await parseJsonBody<GhostAnalysisRequest>(request);
    const rawMessages = body.messages;

    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      throw new HttpError(400, 'Messages requis.');
    }

    // Clamp to last 10 messages max, anonymize, never persisted
    const clamped = rawMessages.slice(-10);
    const anonymized = anonymize(clamped);
    const result = generateInsight(anonymized);

    // Record timestamp (not the messages themselves)
    await store.set(rlKey, String(Date.now()));

    return jsonResponse({ ...result });
  } catch (error) {
    return errorResponse(error);
  }
};
