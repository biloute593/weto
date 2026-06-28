import { errorResponse, jsonResponse, parseJsonBody, HttpError } from './_lib/http';
import { getUserBySessionToken, setThreadEphemeralMode } from './_lib/service';

interface ChatModeRequest {
  contactId?: string;
  ephemeralMode24h?: boolean;
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

    const body = await parseJsonBody<ChatModeRequest>(request);
    const contactId = body.contactId?.trim() ?? '';

    if (!contactId) {
      throw new HttpError(400, 'Contact manquant.');
    }

    const thread = await setThreadEphemeralMode(user.id, contactId, Boolean(body.ephemeralMode24h));
    return jsonResponse({ ok: true, thread });
  } catch (error) {
    return errorResponse(error);
  }
};
