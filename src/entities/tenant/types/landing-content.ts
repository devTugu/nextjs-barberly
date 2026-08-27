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

export interface PlatformTestimonial {
  quote: string;
  name: string;
  role: string;
}

export interface PlatformPricePlan {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export interface PlatformContactInfo {
  title: string;
  description: string;
  email: string;
  phone: string;
  address: string;
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
  testimonialsTitle: string;
  testimonials: PlatformTestimonial[];
  pricingTitle: string;
  pricingSubtitle: string;
  plans: PlatformPricePlan[];
  contact: PlatformContactInfo;
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

  heroCtaSecondary: 'Хамтрагчдыг үзэх',

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

  partnersTitle: 'Хамтрагч байгууллагууд',

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

  testimonialsTitle: 'Хүмүүсийн сэтгэгдэл',

  testimonials: [

    {
      quote:
        'Цаг захиалга цаасан дэвтэр дээр байхаа больсон. Үйлчлүүлэгчид өөрсдөө орж, төлөөд баталгаажуулдаг.',
      name: 'Э. Бат-Эрдэнэ',
      role: 'Салоны эзэн',
    },
    {
      quote:
        'Салбар бүрт өөрийн лендинг байгаа нь брэндээ нэг дороос харагдуулах боломж олгосон.',
      name: 'Б. Сарангэрэл',
      role: 'Брэндийн менежер',
    },
    {
      quote:
        'QPay, хуваарь, ажилтны цалин — өдөр тутмын ажил нэг самбар дээр хураагдсан.',
      name: 'Г. Төгөлдөр',
      role: 'Үсчин, менежер',
    },

  ],

  pricingTitle: 'Үнэ',

  pricingSubtitle:
    'Сарын захиалгын төлбөргүй. Платформ захиалгын шимтгэлээр ажиллана — том брэндийн нөхцөл тусад нь.',

  plans: [

    {
      name: 'Салон',
      price: 'Шимтгэлээр',
      cadence: 'Сарын төлбөргүй',
      description: 'Нэг салбарт брэндийн сайт, захиалга, төлбөр.',
      features: [
        'White-label лендинг',
        'Онлайн захиалга + QPay',
        'Календарь, ажилтан, хэтэвч',
      ],
      cta: 'Холбоо барих',
    },
    {
      name: 'Брэнд',
      price: 'Олон салбар',
      cadence: 'Шимтгэл + брэндийн нөхцөл',
      description: 'Хэд хэдэн салбар, нэг брэндийн нүүр, каталог sync.',
      features: [
        'Бүх Салон боломж',
        'Салбар хоорондын брэндинг',
        'Каталог болон хуваарь sync',
      ],
      highlighted: true,
      cta: 'Холбоо барих',
    },
    {
      name: 'Enterprise',
      price: 'Тохиролцоно',
      cadence: 'SLA, custom',
      description: 'Том сүлжээ, тусгай нөхцөл, платформ дэмжлэг.',
      features: [
        'Бүх Брэнд боломж',
        'Аналитик, татан авалт',
        'Хамгаалалт, тусгай тохиргоо',
      ],
      cta: 'Холбоо барих',
    },

  ],

  contact: {

    title: 'Холбоо барих',

    description:
      'Салон, брэнд, эсвэл хамтын ажиллагааны талаар бидэнтэй холбогдоорой. Нэг имэйлээр эхэлнэ.',

    email: 'hello@barberly.mn',

    phone: '',

    address: 'Улаанбаатар, Монгол',

  },

};

