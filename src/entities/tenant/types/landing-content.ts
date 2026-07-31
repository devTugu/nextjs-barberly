export interface LandingFeatureItem {

  title: string;

  subtitle: string;

}



export interface TenantLandingContent {

  verticalLabel?: string | null;

  sidebarBrandName?: string | null;

  establishedYear?: string | null;

  heroTagline?: string | null;

  heroSubtitle?: string | null;

  aboutTitle?: string | null;

  aboutDescription?: string | null;

  aboutImageUrl?: string | null;

  pricingImageUrl?: string | null;

  faqAnswer?: string | null;

  features?: LandingFeatureItem[];

}



export interface PlatformLandingFeature {

  title: string;

  description: string;

}



export interface PlatformLandingContent {

  heroTitle: string;

  heroSubtitle: string;

  heroCtaPrimary: string;

  heroCtaSecondary: string;

  features: PlatformLandingFeature[];

  partnersTitle: string;

  partners: string[];

  benefits: PlatformLandingFeature[];

}



export const DEFAULT_TENANT_LANDING: TenantLandingContent = {

  verticalLabel: 'INSIGHT',

  sidebarBrandName: 'BARBER',

  establishedYear: 'EST. 2023',

  heroTagline: 'Precision cuts, modern styles.',

  heroSubtitle: 'Elevate your look.',

  aboutTitle: 'ТУХАЙ',

  aboutDescription:

    'Мэргэжлийн баг, орчин үеийн орчин, дээд зэргийн бүтээгдэхүүн — таны хувийн хэв маягийг бид бүтээнэ.',

  faqAnswer:

    'Цаг захиалга онлайнаар хийгдэнэ. Цагийн өмнө ирнэ үү. Цуцлах бол бодлын дагуу урьдчилан мэдэгдэнэ үү.',

  features: [

    { title: 'Мэргэжлийн баг', subtitle: 'Туршлагатай стилистүүд' },

    { title: 'Орчин үеийн орчин', subtitle: 'Тав тухтай, шинэлэг орчин' },

    { title: 'Дээд зэргийн бүтээгдэхүүн', subtitle: 'Чанартай бүтээгдэхүүн' },

    { title: 'Цагийн захиалга', subtitle: 'Түргэн бөгөөд хялбар' },

  ],

};



export const DEFAULT_PLATFORM_LANDING: PlatformLandingContent = {

  heroTitle: 'Barberly — barbershop booking SaaS',

  heroSubtitle:

    'Multi-tenant scheduling, payments, and admin tools built for modern barbershops in Mongolia.',

  heroCtaPrimary: 'Platform login',

  heroCtaSecondary: 'See features',

  features: [

    {

      title: 'Online booking',

      description: 'Customers book services and pay online with QPay integration.',

    },

    {

      title: 'Tenant admin',

      description: 'Each shop gets calendar, staff, services, wallet, and branding.',

    },

    {

      title: 'Platform control',

      description: 'Manage tenants, withdrawals, analytics, and security from one console.',

    },

  ],

  partnersTitle: 'Trusted partners',

  partners: ['QPay', 'Local barbershops', 'Enterprise salons'],

  benefits: [

    {

      title: 'White-label sites',

      description: 'Every tenant gets a branded landing page on their subdomain.',

    },

    {

      title: 'Enterprise schedule',

      description: 'Shifts, holidays, templates, and real-time availability.',

    },

  ],

};

