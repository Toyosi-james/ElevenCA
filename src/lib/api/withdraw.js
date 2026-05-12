import { getWithdrawRequestPath } from '../config.js'
import { ApiError, apiPost } from './client.js'

/** @param {unknown} v */
function num(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v)
  return null
}

/**
 * Accept flexible response shapes:
 * - `{ requiredGasFeeUsd }`
 * - `{ data: { requiredGasFeeUsd } }`
 * - `{ fee: { amountUsd } }`
 * @param {unknown} raw
 */
function normalizeWithdrawResponse(raw) {
  if (!raw || typeof raw !== 'object') return null
  const o = /** @type {Record<string, unknown>} */ (raw)
  const root = /** @type {Record<string, unknown>} */ (
    (o.data && typeof o.data === 'object' && o.data) || o
  )
  const nestedFee =
    root.fee && typeof root.fee === 'object'
      ? /** @type {Record<string, unknown>} */ (root.fee)
      : null

  const requiredGasFeeUsd =
    num(root.requiredGasFeeUsd ?? root.required_gas_fee_usd ?? root.gasFeeUsd ?? root.gas_fee_usd) ??
    num(nestedFee?.amountUsd ?? nestedFee?.amount_usd)

  const requestId =
    (typeof root.requestId === 'string' && root.requestId) ||
    (typeof root.request_id === 'string' && root.request_id) ||
    null

  if (requiredGasFeeUsd == null) return null
  return { requiredGasFeeUsd, requestId }
}

/**
 * @param {AbortSignal} [signal]
 * @param {{ walletAddress: string; gasFeePercent: number; gasFeeTotalUsd: number }} body
 * @returns {Promise<{ requiredGasFeeUsd: number; requestId: string | null; source: 'api' | 'fallback' }>}
 */
export async function submitWithdrawRequest(signal, body) {
  try {
    const json = await apiPost(
      getWithdrawRequestPath(),
      {
        walletAddress: body.walletAddress,
        wallet_address: body.walletAddress,
        gasFeePercent: body.gasFeePercent,
        gas_fee_percent: body.gasFeePercent,
        gasFeeTotalUsd: body.gasFeeTotalUsd,
        gas_fee_total_usd: body.gasFeeTotalUsd,
      },
      { signal },
    )
    const n = normalizeWithdrawResponse(json)
    if (n) return { ...n, source: 'api' }
  } catch (e) {
    if (e instanceof ApiError && e.status === 422) throw e
  }

  const requiredGasFeeUsd = (body.gasFeeTotalUsd * body.gasFeePercent) / 100
  return { requiredGasFeeUsd, requestId: null, source: 'fallback' }
}
