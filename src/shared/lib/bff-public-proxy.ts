import { NextRequest, NextResponse } from 'next/server';
import { fetchInternal } from '@/shared/lib/internal-api';
import { assertCsrf } from '@/shared/lib/bff-csrf';
import { CUSTOMER_AUTH_COOKIE_NAMES } from '@/shared/lib/customer-auth-cookies';
import {
  BffPathError,
  normalizeBffPath,
} from '@/shared/config/bff-allowlist';
import { PUBLIC_BFF_ROUTE_DEFINITIONS } from '@/shared/config/public-bff-allowlist';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

function pathToPattern(path: string): RegExp {
  const escaped = path
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) return '[^/]+';
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  return new RegExp(`^${escaped}$`);
}

const PUBLIC_PATTERNS = PUBLIC_BFF_ROUTE_DEFINITIONS.map(({ path, methods }) => ({
  pattern: pathToPattern(path),
  methods: new Set<HttpMethod>(methods),
}));

const MUTATING = new Set(['POST', 'PATCH', 'DELETE']);

function isPublicPathAllowed(path: string, method: string): boolean {
  const httpMethod = method.toUpperCase() as HttpMethod;
  return PUBLIC_PATTERNS.some(
    ({ pattern, methods }) => pattern.test(path) && methods.has(httpMethod),
  );
}

export async function proxyToPublicBackend(
  request: NextRequest,
  pathSegments: string[],
): Promise<NextResponse> {
  if (MUTATING.has(request.method)) {
    const csrfError = assertCsrf(request);
    if (csrfError) return csrfError;
  }

  let upstreamPath: string;
  try {
    upstreamPath = normalizeBffPath(pathSegments);
  } catch (error) {
    if (error instanceof BffPathError) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: error.message } },
        { status: 403 },
      );
    }
    throw error;
  }

  const fullPath = `/public${upstreamPath}`;
  if (!isPublicPathAllowed(fullPath, request.method)) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Public API path not allowed.' },
      },
      { status: 403 },
    );
  }

  const headers = new Headers();
  const customerToken = request.cookies.get(
    CUSTOMER_AUTH_COOKIE_NAMES.ACCESS_TOKEN,
  )?.value;
  if (customerToken) {
    headers.set('Authorization', `Bearer ${customerToken}`);
  }

  const tenant =
    request.nextUrl.searchParams.get('tenant') ??
    request.headers.get('x-tenant-subdomain');
  if (tenant) {
    headers.set('X-Tenant-Subdomain', tenant);
  }

  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);
  headers.set('Accept', 'application/json');

  const body = MUTATING.has(request.method)
    ? await request.arrayBuffer()
    : undefined;

  const upstream = await fetchInternal(
    `${fullPath}${request.nextUrl.search}`,
    { method: request.method, headers, body },
  );

  const responseHeaders = new Headers();
  const upstreamType = upstream.headers.get('content-type');
  if (upstreamType) responseHeaders.set('content-type', upstreamType);

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
