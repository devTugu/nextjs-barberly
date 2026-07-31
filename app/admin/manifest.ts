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

      src: '/icons/admin-192.svg',

      sizes: '192x512',

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



  let name = 'Barberly Admin';

  let themeColor = '#0f172a';

  let logoUrl: string | null | undefined;



  try {

    const response = await fetchInternal(`/public/tenant?tenant=${tenant}`);

    if (response.ok) {

      const body = await parseInternalJson<PublicTenant>(response);

      if (body.data?.name) name = `${body.data.name} Admin`;

      if (body.data?.settings?.brandColor) {

        themeColor = body.data.settings.brandColor;

      }

      logoUrl = body.data?.settings?.logoUrl;

    }

  } catch {

    /* fallback */

  }



  return {

    name,

    short_name: 'Admin',

    description: 'Barber shop daily operations',

    start_url: '/admin/dashboard',

    scope: '/admin',

    display: 'standalone',

    background_color: '#0f172a',

    theme_color: themeColor,

    icons: buildManifestIcons(logoUrl),

  };

}

