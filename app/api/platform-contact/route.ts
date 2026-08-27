import { NextRequest, NextResponse } from 'next/server';
import { platformContactSchema } from '@/entities/tenant';
import { assertCsrf } from '@/shared/lib/bff-csrf';
import { fetchInternal } from '@/shared/lib/internal-api';

export async function POST(request: NextRequest) {
  const csrfError = assertCsrf(request);
  if (csrfError) return csrfError;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION', message: 'Invalid JSON' } },
      { status: 400 },
    );
  }

  const parsed = platformContactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'VALIDATION', message: 'Invalid contact payload' },
      },
      { status: 400 },
    );
  }

  const upstream = await fetchInternal('/public/platform/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(parsed.data),
  });
  const text = await upstream.text();
  if (text.trim()) {
    return new NextResponse(text, {
      status: upstream.status,
      headers: { 'content-type': 'application/json' },
    });
  }
  if (upstream.ok) {
    return NextResponse.json({ success: true, data: { ok: true } });
  }
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'UPSTREAM',
        message: 'Could not send the message.',
      },
    },
    { status: upstream.status || 502 },
  );
}
