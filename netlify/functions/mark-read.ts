import { errorResponse, jsonResponse, parseJsonBody, HttpError } from './_lib/http';
import { getUserBySessionToken, markThreadRead } from './_lib/service';

interface MarkReadRequest {
  contactId?: string;
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

    const body = await parseJsonBody<MarkReadRequest>(request);
    const contactId = body.contactId?.trim();
    if (!contactId) {
      throw new HttpError(400, 'Contact manquant.');
    }

    await markThreadRead(user.id, contactId);
    return jsonResponse({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
};