import { getTranslations } from 'next-intl/server';
import {
  buildPlatformJsonLd,
  type PlatformLandingContent,
  type PublicShopCard,
} from '@/entities/tenant';
import { CsrfBootstrap } from '@/shared/ui/csrf-bootstrap';
import { JsonLd } from '@/shared/ui/json-ld';
import { PlatformContact } from './platform-contact';
import { PlatformFeatures } from './platform-features';
import { PlatformLandingHeader } from './platform-landing-header';
import { PlatformLandingHero } from './platform-landing-hero';
import { PlatformPricing } from './platform-pricing';
import { PlatformShopGallery } from './platform-shop-gallery';
import { PlatformTestimonials } from './platform-testimonials';

interface PlatformLandingPageProps {
  content: PlatformLandingContent;
  platformLoginUrl: string;
  shops: PublicShopCard[];
  origin: string;
}

export async function PlatformLandingPage({
  content,
  platformLoginUrl,
  shops,
  origin,
}: PlatformLandingPageProps) {
  const t = await getTranslations('marketing');
  const year = new Date().getFullYear();
  const brand = t('platform.brand');
  const footerLinks = [
    { href: '#product', label: t('platform.productNav') },
    { href: '#partners', label: t('platform.partnersNav') },
    { href: '#pricing', label: t('platform.pricingNav') },
    { href: '#contact', label: t('platform.contactNav') },
  ];

  return (
    <div className="marketing-surface relative min-h-svh overflow-x-hidden bg-white text-[var(--marketing-navy)]">
      <JsonLd
        data={buildPlatformJsonLd({
          origin,
          siteName: brand,
          description: content.heroSubtitle,
          email: content.contact.email,
        })}
      />
      <CsrfBootstrap />
      <PlatformLandingHeader loginUrl={platformLoginUrl} />
      <main>
        <PlatformLandingHero
          content={content}
          platformLoginUrl={platformLoginUrl}
          featuredShop={shops[0] ?? null}
          liveShopCount={shops.length}
        />
        <PlatformFeatures features={content.features} />
        <PlatformShopGallery shops={shops} content={content} />
        <PlatformTestimonials
          title={content.testimonialsTitle}
          testimonials={content.testimonials}
          shops={shops}
        />
        <PlatformPricing
          title={content.pricingTitle}
          subtitle={content.pricingSubtitle}
          plans={content.plans}
        />
        <PlatformContact contact={content.contact} />
      </main>
      <footer className="border-t border-black/8 py-10">
        <div className="mx-auto flex max-w-[var(--marketing-max-width)] flex-col items-center gap-4 px-4 text-xs text-[var(--marketing-text-muted)] sm:flex-row sm:justify-between">
          <p>{t('footer.copyright', { year, siteName: brand })}</p>
          <nav aria-label={brand} className="flex flex-wrap justify-center gap-4">
            {footerLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-[var(--marketing-navy)]">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
