import { ImageResponse } from 'next/og';
import { headers } from 'next/headers';
import {
  DEFAULT_TENANT_LANDING,
  loadTenantMarketingContext,
  tenantExists,
} from '@/entities/tenant';
import { resolveHostContext } from '@/shared/lib/host-context';

export const alt = 'Barberly';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function OgFrame({
  eyebrow,
  title,
  subtitle,
  dark,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  dark?: boolean;
}) {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 80,
        background: dark ? '#0a0a0a' : '#f6f3ff',
        color: dark ? '#f5f5f5' : '#1b1633',
      }}
    >
      <div
        style={{
          fontSize: 22,
          letterSpacing: 8,
          textTransform: 'uppercase',
          color: dark ? '#d4b896' : '#5b3cc4',
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          marginTop: 24,
          fontSize: 52,
          fontWeight: 600,
          lineHeight: 1.12,
          maxWidth: 920,
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 28,
          fontSize: 24,
          color: dark ? '#b3b3b3' : '#5c5870',
          maxWidth: 760,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

export default async function OpenGraphImage() {
  const host = (await headers()).get('host') ?? 'localhost:3000';
  const ctx = resolveHostContext(host);
  const subdomain = ctx.subdomain;

  if (subdomain && ctx.scope === 'tenant' && (await tenantExists(subdomain))) {
    const data = await loadTenantMarketingContext(subdomain);
    const landing = {
      ...DEFAULT_TENANT_LANDING,
      ...(data.settings?.landingContent ?? {}),
    };
    return new ImageResponse(
      (
        <OgFrame
          dark
          eyebrow="Barberly"
          title={data.name}
          subtitle={landing.heroTagline ?? landing.heroSubtitle ?? 'Book online'}
        />
      ),
      { ...size },
    );
  }

  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Barberly"
        title="A site for every shop. One platform."
        subtitle="Online booking, QPay, staff calendar, and a branded landing."
      />
    ),
    { ...size },
  );
}
