import { errorResponse, jsonResponse, parseJsonBody, HttpError } from './_lib/http';
import { getUserBySessionToken, setThreadTypingState } from './_lib/service';

interface TypingRequest {
  contactId?: string;
  isTyping?: boolean;
}

function getSessionToken(request: Request) {
  return request.headers.get('x-weto-session')?.trim() ?? '';
}

export default async (request: Request) => {
  try {
    if (request.method !== 'POST') {
      throw new HttpError(405, 'Methode non autorisee.');
    }

    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      throw new HttpError(401, 'Session absente.');
    }

    const user = await getUserBySessionToken(sessionToken);
    if (!user) {
      throw new HttpError(401, 'Session invalide.');
    }

    const body = await parseJsonBody<TypingRequest>(request);
    const contactId = body.contactId?.trim() ?? '';
    const isTyping = Boolean(body.isTyping);

    if (!contactId) {
      throw new HttpError(400, 'Contact manquant.');
    }

    await setThreadTypingState(user.id, contactId, isTyping);
    return jsonResponse({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
};
