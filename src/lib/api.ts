import { auth } from './firebase';

export class ApiClientError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function apiPost<TResponse>(url: string, body: unknown): Promise<TResponse> {
  const user = auth.currentUser;
  if (!user) {
    throw new ApiClientError('Please sign in with Google to use AI Tutor features.', 401, 'UNAUTHORIZED');
  }

  const token = await user.getIdToken();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
  if (!res.ok) {
    throw new ApiClientError(
      data.error || `Request failed with status ${res.status}`,
      res.status,
      data.code || 'API_ERROR'
    );
  }

  return data as TResponse;
}

export async function getApiHealth(): Promise<{ ok: boolean; geminiConfigured: boolean; model: string }> {
  const res = await fetch('/api/health');
  if (!res.ok) {
    throw new Error('Server health check failed');
  }
  return (await res.json()) as { ok: boolean; geminiConfigured: boolean; model: string };
}
