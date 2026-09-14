import { describe, expect, it } from 'vitest';
import { withdrawSchema } from './withdraw.schema';

describe('withdrawSchema', () => {
  const messages = { amountMin: 'min', amountMax: 'max' };

  it('accepts a positive amount within balance', () => {
    const parsed = withdrawSchema(messages, 50_000).safeParse({
      amount: 10_000,
      reference: 'payroll',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects non-positive amounts', () => {
    const parsed = withdrawSchema(messages, 50_000).safeParse({ amount: 0 });
    expect(parsed.success).toBe(false);
  });

  it('rejects amounts above max balance', () => {
    const parsed = withdrawSchema(messages, 5_000).safeParse({ amount: 6_000 });
    expect(parsed.success).toBe(false);
  });
});
