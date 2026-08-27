import { mutatingFetchHeaders } from '@/shared/lib/csrf-client';
import { PublicApiError } from '@/shared/lib/public-api-error';
import {
  platformContactSchema,
  type PlatformContactInput,
} from './platform-contact.schema';

export async function submitPlatformContact(
  input: PlatformContactInput,
): Promise<void> {
  const body = platformContactSchema.parse(input);
  const csrf = await mutatingFetchHeaders();
  const response = await fetch('/api/platform-contact', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...csrf },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new PublicApiError(
      parseErrorMessage(text) || `Request failed (${response.status})`,
    );
  }
}

function parseErrorMessage(text: string): string | null {
  if (!text.trim()) return null;
  try {
    const body = JSON.parse(text) as {
      error?: { message?: string };
      success?: boolean;
    };
    return typeof body.error?.message === 'string' ? body.error.message : null;
  } catch {
    return null;
  }
}
