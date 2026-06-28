import { errorResponse, jsonResponse, HttpError } from './_lib/http';
import { getUserBySessionToken, waitForUserRealtimeChange } from './_lib/service';

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
    const lastVersionRaw = url.searchParams.get('lastVersion')?.trim() ?? '0';
    const lastVersion = Number.parseInt(lastVersionRaw, 10);

    return jsonResponse(await waitForUserRealtimeChange(user, Number.isFinite(lastVersion) ? lastVersion : 0));
  } catch (error) {
    return errorResponse(error);
  }
};