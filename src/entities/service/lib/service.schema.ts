import { z } from 'zod';

export function createServiceSchema(messages: { nameMinLength: string }) {
  return z.object({
    name: z.string().min(2, messages.nameMinLength),
    description: z.string().optional(),
    durationMinutes: z.number().int().min(5).max(480),
    price: z.number().min(0),
    sortOrder: z.number().int().optional(),
  });
}

export function updateServiceSchema() {
  return z.object({
    name: z.string().min(2).optional(),
    description: z.string().nullable().optional(),
    durationMinutes: z.number().int().min(5).max(480).optional(),
    price: z.number().min(0).optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  });
}

export type CreateServiceFormValues = z.infer<
  ReturnType<typeof createServiceSchema>
>;
export type UpdateServiceFormValues = z.infer<
  ReturnType<typeof updateServiceSchema>
>;
