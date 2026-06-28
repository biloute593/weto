import { errorResponse, jsonResponse, parseJsonBody, HttpError } from './_lib/http';
import { getUserBySessionToken, sendMessageToContact } from './_lib/service';
import { ChatMessageInput } from '../../src/types';

interface SendMessageRequest {
  contactId?: string;
  message?: ChatMessageInput;
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

    const body = await parseJsonBody<SendMessageRequest>(request);
    const contactId = body.contactId?.trim();
    const message = body.message;

    if (!contactId || !message || !message.text?.trim()) {
      throw new HttpError(400, 'Message invalide.');
    }

    return jsonResponse({
      thread: await sendMessageToContact(user.id, contactId, {
        text: message.text.trim(),
        type: message.type,
        mediaUri: message.mediaUri,
        durationMs: message.durationMs,
        dilemma: message.dilemma,
        ephemeral: message.ephemeral,
        secure: message.secure,
        secureKind: message.secureKind,
        secureDurationSec: message.secureDurationSec,
      }),
    });
  } catch (error) {
    return errorResponse(error);
  }
};