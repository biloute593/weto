import { errorResponse, jsonResponse, HttpError } from './_lib/http';
import { getUserBySessionToken, logoutSession } from './_lib/service';

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

    await logoutSession(user, sessionToken);
    return jsonResponse({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
};