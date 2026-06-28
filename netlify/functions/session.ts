import { errorResponse, jsonResponse, parseJsonBody, HttpError } from './_lib/http';
import { upsertSessionProfile } from './_lib/service';

interface SessionRequest {
  sessionToken?: string;
  name?: string;
  avatar?: string;
  birthYear?: string;
  gender?: string;
  seeking?: string;
  email?: string;
  password?: string;
}

export default async (request: Request) => {
  try {
    if (request.method !== 'POST') {
      throw new HttpError(405, 'Methode non autorisee.');
    }

    const body = await parseJsonBody<SessionRequest>(request);
    const name = body.name?.trim() ?? '';
    const avatar = body.avatar?.trim() ?? '';
    const birthYear = body.birthYear?.trim() ?? '';
    const gender = body.gender?.trim() ?? '';
    const seeking = body.seeking?.trim() ?? '';
    const email = body.email?.trim() ?? '';
    const password = body.password?.trim() ?? '';

    if (name.length < 2 || !avatar) {
      throw new HttpError(400, 'Profil utilisateur incomplet.');
    }

    const payload = await upsertSessionProfile({
      sessionToken: body.sessionToken,
      name,
      avatar,
      birthYear,
      gender,
      seeking,
      email,
      password,
    });

    return jsonResponse(payload);
  } catch (error) {
    return errorResponse(error);
  }
};