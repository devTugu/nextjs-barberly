import { describe, expect, it } from 'vitest';
import { platformContactSchema } from './platform-contact.schema';

describe('platformContactSchema', () => {
  it('accepts a complete message', () => {
    const parsed = platformContactSchema.parse({
      name: 'Бат',
      email: 'bat@example.com',
      phone: '99112233',
      message: 'Брэнд багцын талаар ярихыг хүсэж байна.',
    });
    expect(parsed.email).toBe('bat@example.com');
  });

  it('rejects a short message', () => {
    const result = platformContactSchema.safeParse({
      name: 'Бат',
      email: 'bat@example.com',
      message: 'Сайн уу',
    });
    expect(result.success).toBe(false);
  });
});
