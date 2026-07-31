import type { MetadataRoute } from 'next';

import { headers } from 'next/headers';

import { fetchInternal, parseInternalJson } from '@/shared/lib/internal-api';

import { resolveHostContext } from '@/shared/lib/host-context';



interface PublicTenant {

  name: string;

  settings?: { brandColor?: string | null; logoUrl?: string | null };

}



function buildManifestIcons(

  logoUrl?: string | null,

): NonNullable<MetadataRoute.Manifest['icons']> {

  if (logoUrl) {

    return [

      {

        src: logoUrl,

        sizes: '192x192',

        type: 'image/png',

        purpose: 'any',

      },

      {

        src: logoUrl,

        sizes: '512x512',

        type: 'image/png',

        purpose: 'any',

      },

    ];

  }



  return [

    {

      src: '/icons/customer-192.svg',

      sizes: '192x192',

      type: 'image/svg+xml',

      purpose: 'any',

    },

    {

      src: '/favicon.ico',

      sizes: 'any',

      type: 'image/x-icon',

    },

  ];

}



export default async function manifest(): Promise<MetadataRoute.Manifest> {

  const headerStore = await headers();

  const host = headerStore.get('host') ?? 'localhost:3000';

  const ctx = resolveHostContext(host);

  const tenant = ctx.subdomain ?? 'demo';



  let name = 'Barberly';

  let themeColor = '#0f172a';

  let logoUrl: string | null | undefined;



  try {

    const response = await fetchInternal(`/public/tenant?tenant=${tenant}`);

    if (response.ok) {

      const body = await parseInternalJson<PublicTenant>(response);

      if (body.data?.name) name = `${body.data.name} Barber`;

      if (body.data?.settings?.brandColor) {

        themeColor = body.data.settings.brandColor;

      }

      logoUrl = body.data?.settings?.logoUrl;

    }

  } catch {

    /* fallback defaults */

  }



  return {

    name,

    short_name: name.slice(0, 12),

    description: 'Book your barber appointment',

    start_url: '/user/dashboard',

    display: 'standalone',

    background_color: '#0f172a',

    theme_color: themeColor,

    icons: buildManifestIcons(logoUrl),

  };

}

