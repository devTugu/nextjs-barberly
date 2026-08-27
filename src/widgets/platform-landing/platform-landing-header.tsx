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
        <nav className="flex items-center gap-4 lg:gap-6">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hidden text-sm text-[var(--marketing-navy)]/70 transition-colors hover:text-[var(--marketing-navy)] md:inline"
            >
              {link.label}
            </a>
          ))}
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
