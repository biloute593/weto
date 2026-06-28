import { errorResponse, jsonResponse, HttpError } from './_lib/http';
import { getUserBySessionToken, loadChatThread } from './_lib/service';

function getSessionToken(request: Request) {
  return request.headers.get('x-weto-session')?.trim() ?? '';
}

export default async (request: Request) => {
  try {
    if (request.method !== 'GET') {
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

    const url = new URL(request.url);
    const contactId = url.searchParams.get('contactId')?.trim();
    if (!contactId) {
      throw new HttpError(400, 'Contact manquant.');
    }

    return jsonResponse({ thread: await loadChatThread(user.id, contactId) });
  } catch (error) {
    return errorResponse(error);
  }
};