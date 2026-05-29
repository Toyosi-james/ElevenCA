/**
 * Portfolio balance shown on Home and Exchange.
 */

/** @type {{ totalUsd: number; change24hPct: number | null; currency: string }} */
export const WALLET_SUMMARY = {
  totalUsd: 2_847_392.55,
  change24hPct: 1.24,
  currency: 'USD',
}

/** @param {AbortSignal} [_signal] */
export async function loadWalletSummary(_signal) {
  return { ...WALLET_SUMMARY }
}
