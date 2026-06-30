const WALLET_TX_TYPE_KEYS = [
  'booking_payment',
  'platform_commission',
  'refund',
  'WITHDRAWAL_REQUESTED',
  'adjustment',
] as const;

export type WalletTxTypeKey = (typeof WALLET_TX_TYPE_KEYS)[number];

export function isWalletTxTypeKey(type: string): type is WalletTxTypeKey {
  return (WALLET_TX_TYPE_KEYS as readonly string[]).includes(type);
}
