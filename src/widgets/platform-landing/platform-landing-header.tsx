import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { MarketingButton } from '@/shared/ui/marketing';

interface PlatformLandingHeaderProps {
  loginUrl: string;
}

export async function PlatformLandingHeader({
  loginUrl,
}: PlatformLandingHeaderProps) {
  const t = await getTranslations('marketing');
  const links = [
    { href: '#product', label: t('platform.productNav') },
    { href: '#partners', label: t('platform.partnersNav') },
    { href: '#testimonials', label: t('platform.testimonialsNav') },
    { href: '#pricing', label: t('platform.pricingNav') },
    { href: '#contact', label: t('platform.contactNav') },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[var(--marketing-max-width)] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-sm font-semibold tracking-[0.28em] uppercase text-[var(--marketing-navy)]"
        >
          {t('platform.brand')}
        </Link>
        <nav aria-label={t('platform.brand')} className="flex items-center gap-3 lg:gap-6">
          <div className="hidden items-center gap-5 md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--marketing-navy)]/70 transition-colors hover:text-[var(--marketing-navy)]"
              >
                {link.label}
              </a>
            ))}
          </div>
          <details className="relative md:hidden">
            <summary className="flex cursor-pointer list-none items-center rounded-full border border-black/10 px-3 py-1.5 text-sm text-[var(--marketing-navy)] [&::-webkit-details-marker]:hidden">
              {t('nav.openMenu')}
            </summary>
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-black/8 bg-white p-2 shadow-lg">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-sm text-[var(--marketing-navy)] hover:bg-black/4"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </details>
          <MarketingButton
            href={loginUrl}
            variant="signIn"
            showArrow={false}
            external={loginUrl.startsWith('http')}
          >
            {t('nav.signIn')}
          </MarketingButton>
        </nav>
      </div>
    </header>
  );
}
