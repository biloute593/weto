import { errorResponse, jsonResponse, parseJsonBody, HttpError } from './_lib/http';
import { loginWithPassword } from './_lib/service';

interface LoginRequest {
  email?: string;
  password?: string;
}

export default async (request: Request) => {
  try {
    if (request.method !== 'POST') {
      throw new HttpError(405, 'Methode non autorisee.');
    }

    const body = await parseJsonBody<LoginRequest>(request);
    const email = body.email?.trim() ?? '';
    const password = body.password?.trim() ?? '';

    if (!email || !password) {
      throw new HttpError(400, 'Identifiants incomplets.');
    }

    return jsonResponse(await loginWithPassword(email, password));
  } catch (error) {
    return errorResponse(error);
  }
};