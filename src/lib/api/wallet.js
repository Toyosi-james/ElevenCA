/**
 * Portfolio balance API.
 *
 * API: GET `{base}{VITE_BALANCE_PATH}` (default: GET /wallet/summary)
 * Screen: Home.jsx (BalanceSection), Exchange.jsx (NAV presets)
 * Falls back to demo numbers if the request fails.
 */

import { getBalancePath } from '../config.js'
import { apiGet } from './client.js'

/**
 * @param {unknown} json
 * @returns {{ totalUsd: number; change24hPct: number | null; currency: string } | null}
 */
function normalizeBalance(json) {
  if (!json || typeof json !== 'object') return null
  const o = /** @type {Record<string, unknown>} */ (json)
  const root = /** @type {Record<string, unknown>} */ (
    (o.data && typeof o.data === 'object' && o.data) || o
  )
  const total =
    num(root.totalUsd) ??
    num(root.total_usd) ??
    num(root.balanceUsd) ??
    num(root.balance_usd) ??
    num(root.availableUsd)
  if (total == null || Number.isNaN(total)) return null
  const change =
    num(root.change24hPct) ??
    num(root.change_24h_pct) ??
    num(root.changePct) ??
    num(root.dayChangePct)
  const currency = typeof root.currency === 'string' ? root.currency : 'USD'
  return {
    totalUsd: total,
    change24hPct: change != null && !Number.isNaN(change) ? change : null,
    currency,
  }
}

/** @param {unknown} v */
function num(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v)
  return null
}

/** Demo balance shown when GET /wallet/summary is unavailable. */
export function mockWalletSummary() {
  return {
    totalUsd: 2_847_392.55,
    change24hPct: 1.24,
    currency: 'USD',
    _demo: true,
  }
}

/**
 * GET wallet summary — total USD, 24h change %, currency code.
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ totalUsd: number; change24hPct: number | null; currency: string; _demo?: boolean }>}
 */
export async function fetchWalletSummary(signal) {
  try {
    // HTTP: GET /wallet/summary (path from getBalancePath)
    const json = await apiGet(getBalancePath(), { signal })
    const n = normalizeBalance(json)
    if (n) return { ...n, _demo: false }
  } catch {
    /* fall through */
  }
  return mockWalletSummary()
}
