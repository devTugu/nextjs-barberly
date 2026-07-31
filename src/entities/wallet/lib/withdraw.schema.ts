import { z } from 'zod';

export function withdrawSchema(
  messages: { amountMin: string; amountMax: string },
  maxBalance?: number,
) {
  return z.object({
    amount: z
      .number()
      .positive(messages.amountMin)
      .refine(
        (value) => maxBalance === undefined || value <= maxBalance,
        messages.amountMax,
      ),
    reference: z.string().optional(),
  });
}

export type WithdrawFormValues = z.infer<ReturnType<typeof withdrawSchema>>;
