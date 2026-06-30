import { z } from 'zod';

const subdomainRegex = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function createTenantSchema(messages: {
  nameMinLength: string;
  subdomainInvalid: string;
}) {
  return z.object({
    subdomain: z
      .string()
      .min(2)
      .max(63)
      .regex(subdomainRegex, messages.subdomainInvalid),
    name: z.string().min(2, messages.nameMinLength),
    timezone: z.string().min(1),
    phone: z.string().optional(),
    address: z.string().optional(),
  });
}

export function updateTenantSchema() {
  return z.object({
    name: z.string().min(2).optional(),
    timezone: z.string().min(1).optional(),
    isActive: z.boolean().optional(),
    phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    slotLockMinutes: z.number().int().min(1).max(60).optional(),
    cancelHoursBefore: z.number().int().min(0).optional(),
    rescheduleHoursBefore: z.number().int().min(0).optional(),
    commissionPercent: z.number().min(0).max(100).optional(),
  });
}

export type CreateTenantFormValues = z.infer<
  ReturnType<typeof createTenantSchema>
>;
export type UpdateTenantFormValues = z.infer<
  ReturnType<typeof updateTenantSchema>
>;
