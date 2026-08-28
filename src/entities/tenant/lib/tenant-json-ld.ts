import { absolutePageUrl } from './marketing-metadata';

const SCHEMA_WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export interface TenantJsonLdScheduleDay {
  dayOfWeek: number;
  closed: boolean;
  blocks: Array<{ startTime: string; endTime: string }>;
}

function schemaWeekday(dayOfWeek: number): string {
  if (dayOfWeek === 0 || dayOfWeek === 7) return 'Sunday';
  if (dayOfWeek >= 1 && dayOfWeek <= 6) return SCHEMA_WEEKDAYS[dayOfWeek - 1];
  return 'Monday';
}

function toClock(value: string): string {
  return value.slice(0, 5);
}

export function buildTenantJsonLd(input: {
  origin: string;
  name: string;
  description: string;
  telephone: string | null;
  address: string | null;
  image: string | null;
  scheduleDays: TenantJsonLdScheduleDay[];
}): Record<string, unknown> {
  const url = absolutePageUrl(input.origin);
  const openingHoursSpecification = input.scheduleDays.flatMap((day) => {
    if (day.closed) return [];
    return day.blocks.map((block) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${schemaWeekday(day.dayOfWeek)}`,
      opens: toClock(block.startTime),
      closes: toClock(block.endTime),
    }));
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    name: input.name,
    url,
    description: input.description,
    image: input.image ?? undefined,
    telephone: input.telephone ?? undefined,
    address: input.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: input.address,
          addressCountry: 'MN',
        }
      : undefined,
    openingHoursSpecification:
      openingHoursSpecification.length > 0
        ? openingHoursSpecification
        : undefined,
  };
}
