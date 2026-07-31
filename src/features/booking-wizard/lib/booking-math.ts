export interface BookableService {
  id: number;
  durationMinutes: number;
  price: number;
}

export function sumServiceDuration(
  services: BookableService[],
  selectedIds: number[],
): number {
  return services
    .filter((s) => selectedIds.includes(s.id))
    .reduce((sum, s) => sum + s.durationMinutes, 0);
}

export function sumServicePrice(
  services: BookableService[],
  selectedIds: number[],
): number {
  return services
    .filter((s) => selectedIds.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);
}

export function bookingServicesDuration(
  services: Array<{ durationMinutes: number }>,
): number {
  return services.reduce((sum, s) => sum + s.durationMinutes, 0);
}
