export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getDefaultHeaders() {
  return {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  } as const;
}

export function jsonResponse(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: getDefaultHeaders(),
  });
}

export function errorResponse(error: unknown) {
  if (error instanceof HttpError) {
    return jsonResponse({ error: error.message }, error.status);
  }

  const message = error instanceof Error ? error.message : 'Une erreur serveur est survenue.';
  return jsonResponse({ error: message }, 500);
}

export async function parseJsonBody<T>(request: Request): Promise<T> {
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';
  if (!contentType.includes('application/json')) {
    throw new HttpError(415, 'Content-Type JSON requis.');
  }

  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError(400, 'Corps JSON invalide.');
  }
}