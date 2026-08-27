import { Mail, MapPin, Phone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { PlatformContactInfo } from '@/entities/tenant';
import { Container, GradientRibbon, Section, SectionHeader } from '@/shared/ui/marketing';
import { PlatformContactForm } from './platform-contact-form';

interface PlatformContactProps {
  contact: PlatformContactInfo;
}

export async function PlatformContact({ contact }: PlatformContactProps) {
  const t = await getTranslations('marketing.platform');
  const details = [
    { icon: Mail, label: t('contactEmail'), value: contact.email, href: `mailto:${contact.email}` },
    contact.phone
      ? { icon: Phone, label: t('contactPhone'), value: contact.phone, href: `tel:${contact.phone}` }
      : null,
    contact.address
      ? { icon: MapPin, label: t('contactAddress'), value: contact.address, href: null }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden border-t border-black/6 py-16 md:py-24">
      <GradientRibbon className="top-8 opacity-60" />
      <Section className="relative z-10 py-0" showGridPattern={false}>
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionHeader
                align="left"
                className="mb-8"
                eyebrow={t('contactEyebrow')}
                title={contact.title}
                description={contact.description}
              />
              <ul className="space-y-4">
                {details.map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <item.icon className="mt-0.5 size-4 text-[var(--marketing-indigo)]" />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--marketing-text-muted)]">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a href={item.href} className="text-sm font-medium hover:underline">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium">{item.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <PlatformContactForm contact={contact} />
          </div>
        </Container>
      </Section>
    </section>
  );
}
