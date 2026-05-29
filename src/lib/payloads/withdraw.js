/**
 * Withdraw request response (computed locally from form input).
 */

/**
 * @param {AbortSignal} _signal
 * @param {{ walletAddress: string; gasFeePercent: number; gasFeeTotalUsd: number }} body
 */
export async function submitWithdrawRequest(_signal, body) {
  const requiredGasFeeUsd = (body.gasFeeTotalUsd * body.gasFeePercent) / 100
  return {
    requiredGasFeeUsd,
    requestId: `wd-${Date.now()}`,
  }
}
