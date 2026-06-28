import { errorResponse, jsonResponse, parseJsonBody, HttpError } from './_lib/http';
import { createMessageReportForUser, getUserBySessionToken } from './_lib/service';

interface ReportMessageRequest {
  contactId?: string;
  messageId?: string;
  reason?: string;
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

    const body = await parseJsonBody<ReportMessageRequest>(request);
    const contactId = body.contactId?.trim() ?? '';
    const messageId = body.messageId?.trim() ?? '';
    const reason = body.reason?.trim() ?? '';

    if (!contactId || !messageId || !reason) {
      throw new HttpError(400, 'Signalement incomplet.');
    }

    return jsonResponse(await createMessageReportForUser({ user, contactId, messageId, reason }));
  } catch (error) {
    return errorResponse(error);
  }
};