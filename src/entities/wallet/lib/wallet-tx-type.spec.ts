import { describe, expect, it } from 'vitest';
import { isWalletTxTypeKey } from './wallet-tx-type';

describe('isWalletTxTypeKey', () => {
  it('accepts known wallet transaction types', () => {
    expect(isWalletTxTypeKey('booking_payment')).toBe(true);
    expect(isWalletTxTypeKey('WITHDRAWAL_REQUESTED')).toBe(true);
  });

  it('rejects unknown types', () => {
    expect(isWalletTxTypeKey('unknown')).toBe(false);
  });
});
