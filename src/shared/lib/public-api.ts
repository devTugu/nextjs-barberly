import type { ApiEnvelope, ApiErrorEnvelope } from '@/shared/api/types';
import { mutatingFetchHeaders } from '@/shared/lib/csrf-client';
import { PublicApiError } from '@/shared/lib/public-api-error';

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text.trim()) {
    throw new PublicApiError(`Request failed (${response.status})`, 'UNKNOWN');
  }
  let body: ApiEnvelope<T> | ApiErrorEnvelope;
  try {
    body = JSON.parse(text) as ApiEnvelope<T> | ApiErrorEnvelope;
  } catch {
    throw new PublicApiError(`Request failed (${response.status})`, 'UNKNOWN');
  }
  if (!response.ok || !body.success) {
    const code =
      !body.success && body.error && typeof body.error.code === 'string'
        ? body.error.code
        : 'UNKNOWN';
    const message =
      !body.success && body.error
        ? typeof body.error.message === 'string'
          ? body.error.message
          : 'Request failed'
        : `Request failed (${response.status})`;
    throw new PublicApiError(message, code);
  }
  return body.data;
}

function buildUrl(path: string, tenant: string, search?: Record<string, string>) {
  const url = new URL(`/api/public${path}`, window.location.origin);
  url.searchParams.set('tenant', tenant);
  if (search) {
    for (const [key, value] of Object.entries(search)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

export async function publicGet<T>(
  path: string,
  tenant: string,
  search?: Record<string, string>,
): Promise<T> {
  const response = await fetch(buildUrl(path, tenant, search), {
    credentials: 'include',
  });
  return parseJson<T>(response);
}

export async function publicPost<T>(
  path: string,
  tenant: string,
  body?: unknown,
): Promise<T> {
  const csrf = await mutatingFetchHeaders();
  const response = await fetch(buildUrl(path, tenant), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...csrf },
    body: body ? JSON.stringify(body) : undefined,
  });
  return parseJson<T>(response);
}

/** Platform-host POST — no tenant query param. */
export async function publicPostAnonymous<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  const csrf = await mutatingFetchHeaders();
  const url = new URL(`/api/public${path}`, window.location.origin);
  const response = await fetch(url.toString(), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...csrf },
    body: body ? JSON.stringify(body) : undefined,
  });
  return parseJson<T>(response);
}
