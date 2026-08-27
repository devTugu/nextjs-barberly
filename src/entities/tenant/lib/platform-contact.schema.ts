import { z } from 'zod';

export const platformContactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  message: z.string().trim().min(10).max(2000),
});

export type PlatformContactInput = z.infer<typeof platformContactSchema>;
