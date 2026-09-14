/**
 * Server + client gate for QPay webhook simulation.
 *
 * Production: only when NEXT_PUBLIC_QPAY_SIMULATE_ENABLED=true (explicit opt-in).
 * Non-production: allowed by default so local/e2e flows work without extra env.
 * Set NEXT_PUBLIC_QPAY_SIMULATE_ENABLED=false to force-disable in any environment.
 */
export function isQpaySimulateAllowed(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (env.NEXT_PUBLIC_QPAY_SIMULATE_ENABLED === 'true') return true;
  if (env.NEXT_PUBLIC_QPAY_SIMULATE_ENABLED === 'false') return false;
  return (env.NODE_ENV ?? 'development') !== 'production';
}

export const QPAY_SIMULATE_PUBLIC_PATH = '/public/webhooks/qpay/simulate';
