import { getTranslations } from 'next-intl/server';

interface LuxuryFaqProps {
  faqAnswer?: string | null;
}

export async function LuxuryFaq({ faqAnswer }: LuxuryFaqProps) {
  const t = await getTranslations('home');
  if (!faqAnswer) return null;

  return (
    <section id="faq" className="scroll-mt-24 py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-lg font-semibold uppercase tracking-wider">{t('navFaq')}</h2>
        <p className="mt-3 max-w-2xl text-sm text-white/65">{faqAnswer}</p>
      </div>
    </section>
  );
}
