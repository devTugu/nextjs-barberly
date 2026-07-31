export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function staffRatingPlaceholder(staffId: number): string {
  return (4.5 + (staffId % 5) * 0.1).toFixed(1);
}

export function formatMnt(amount: number, locale?: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'MNT',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSlotTime(
  startAtUtc: string,
  locale?: string,
  timeZone?: string,
): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timeZone ?? 'UTC',
  }).format(new Date(startAtUtc));
}

export function formatBookingDateTime(
  startAtUtc: string,
  locale?: string,
  timeZone?: string,
): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timeZone ?? 'UTC',
  }).format(new Date(startAtUtc));
}

export function serviceLabel(
  services: Array<{ serviceName: string }> | undefined,
): string {
  if (!services?.length) return '';
  return services.map((s) => s.serviceName).join(', ');
}
