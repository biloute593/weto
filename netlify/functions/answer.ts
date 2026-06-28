import { errorResponse, jsonResponse, parseJsonBody, HttpError } from './_lib/http';
import { getUserBySessionToken, submitAnswerForUser } from './_lib/service';

interface AnswerRequest {
  scenarioId?: string;
  choiceIndex?: number;
  reactionTimeMs?: number;
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

    const body = await parseJsonBody<AnswerRequest>(request);
    if (!body.scenarioId || typeof body.choiceIndex !== 'number') {
      throw new HttpError(400, 'Reponse invalide.');
    }

    return jsonResponse(
      await submitAnswerForUser(
        user,
        body.scenarioId,
        body.choiceIndex,
        body.reactionTimeMs ?? 0
      )
    );
  } catch (error) {
    return errorResponse(error);
  }
};