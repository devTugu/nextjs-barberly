import { z } from 'zod';

export function manualBookingSchema() {
  return z.object({
    staffId: z.number().int().positive(),
    startAtUtc: z.string().min(1),
    serviceIds: z.array(z.number().int().positive()).min(1),
    customerId: z.number().int().positive().optional(),
  });
}

export type ManualBookingFormValues = z.infer<
  ReturnType<typeof manualBookingSchema>
>;
