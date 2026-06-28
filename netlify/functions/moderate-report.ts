import { errorResponse, jsonResponse, parseJsonBody, HttpError } from './_lib/http';
import { getUserBySessionToken, moderateReport } from './_lib/service';
import { ModerationAction } from '../../src/types';

interface ModerateReportRequest {
  reportId?: string;
  action?: ModerationAction;
  note?: string;
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

    const body = await parseJsonBody<ModerateReportRequest>(request);
    const reportId = body.reportId?.trim() ?? '';
    const action = body.action;

    if (!reportId || !action) {
      throw new HttpError(400, 'Action de moderation incomplete.');
    }

    return jsonResponse(await moderateReport({ user, reportId, action, note: body.note }));
  } catch (error) {
    return errorResponse(error);
  }
};