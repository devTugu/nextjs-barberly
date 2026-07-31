import type { Metadata } from 'next';

export const metadata: Metadata = {
  manifest: '/admin/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Barberly Admin',
    statusBarStyle: 'black-translucent',
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
