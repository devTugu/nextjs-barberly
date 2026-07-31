import { z } from 'zod';

const subdomainRegex = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

const optionalHexColor = z
  .string()
  .optional()
  .refine((val) => !val || hexColorRegex.test(val), 'Invalid hex color');

const nullableHexColor = z
  .string()
  .nullable()
  .optional()
  .refine(
    (val) =>
      val === undefined || val === null || val === '' || hexColorRegex.test(val),
    'Invalid hex color',
  );

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
    brandColor: optionalHexColor,
    ownerEmail: z.string().email().optional().or(z.literal('')),
    commissionPercent: z.number().min(0).max(100).optional(),
    parentTenantId: z.number().int().positive().nullable().optional(),
  });
}

export function updateTenantSchema() {
  return z.object({
    name: z.string().min(2).optional(),
    timezone: z.string().min(1).optional(),
    isActive: z.boolean().optional(),
    phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    logoUrl: z.string().max(512).nullable().optional(),
    bannerUrl: z.string().max(512).nullable().optional(),
    brandColor: nullableHexColor,
    slotLockMinutes: z.number().int().min(1).max(60).optional(),
    cancelHoursBefore: z.number().int().min(0).optional(),
    rescheduleHoursBefore: z.number().int().min(0).optional(),
    commissionPercent: z.number().min(0).max(100).optional(),
    depositPercent: z.number().min(1).max(100).optional(),
    parentTenantId: z.number().int().positive().nullable().optional(),
  });
}

export type CreateTenantFormValues = z.infer<
  ReturnType<typeof createTenantSchema>
>;
export type UpdateTenantFormValues = z.infer<
  ReturnType<typeof updateTenantSchema>
>;
