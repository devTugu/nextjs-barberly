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

  heroTitle: 'Үсчин бүрт өөрийн сайт. Платформ нь нэг.',

  heroSubtitle:

    'Цаг захиалга, QPay төлбөр, ажилтны календарь, брэндийн лендинг — орчин үеийн салонд зориулсан SaaS.',

  heroCtaPrimary: 'Платформд нэвтрэх',

  heroCtaSecondary: 'Салонуудыг үзэх',

  features: [

    {

      title: 'Онлайн захиалга',

      description: 'Үйлчлүүлэгч үйлчилгээ сонгож, QPay-ээр төлөөд цагаа баталгаажуулна.',

    },

    {

      title: 'Салоны админ',

      description: 'Календарь, ажилтан, үйлчилгээ, хэтэвч, брэндинг — салон бүрт өөрийн самбар.',

    },

    {

      title: 'Платформ удирдлага',

      description: 'Tenant, татан авалт, аналитик, аюулгүй байдлыг нэг консолоос.',

    },

  ],

  partnersTitle: 'Хамтрагчид',

  partners: ['QPay', 'Үсчиний газрууд', 'Enterprise салонууд'],

  benefits: [

    {

      title: 'White-label сайт',

      description: 'Салон бүрт өөрийн брэндийн лендинг, өөрийн subdomain дээр.',

    },

    {

      title: 'Enterprise хуваарь',

      description: 'Ээлж, амралт, template, бодит цагийн сул цаг.',

    },

  ],

};

