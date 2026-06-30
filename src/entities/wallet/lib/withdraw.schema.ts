import { z } from 'zod';

export function withdrawSchema(messages: { amountMin: string }) {
  return z.object({
    amount: z.number().positive(messages.amountMin),
    reference: z.string().optional(),
  });
}

export type WithdrawFormValues = z.infer<ReturnType<typeof withdrawSchema>>;
