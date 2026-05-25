/**
 * Deposit address APIs (wallet addresses for QR codes).
 *
 * | API (GET)                    | Screen              |
 * |------------------------------|---------------------|
 * | /wallet/deposit-address      | ReceiveFunds.jsx    |
 * | /wallet/gas-fee-address      | FundGasFee.jsx      |
 *
 * If GET fails, falls back to `VITE_DEPOSIT_WALLET_ADDRESS` from config.js.
 */

import { getDepositAddressPath, getDepositWalletAddress, getFundGasFeeAddressPath } from '../config.js'
import { apiGet } from './client.js'

/**
 * @param {unknown} v
 * @returns {string | undefined}
 */
function pickStr(obj, keys) {
  if (!obj || typeof obj !== 'object') return undefined
  const o = /** @type {Record<string, unknown>} */ (obj)
  for (const k of keys) {
    const v = o[k]
    if (typeof v === 'string' && v.trim() !== '') return v.trim()
  }
  return undefined
}

/**
 * Accepts flexible JSON: `{ address }`, `{ data: { address } }`, `walletAddress`, `depositAddress`, etc.
 * @param {unknown} raw
 * @returns {{ address: string; network?: string; label?: string } | null}
 */
export function normalizeDepositAddress(raw) {
  if (!raw || typeof raw !== 'object') return null
  const root = /** @type {Record<string, unknown>} */ (raw)
  const nested =
    root.data && typeof root.data === 'object'
      ? /** @type {Record<string, unknown>} */ (root.data)
      : root

  const address = pickStr(nested, [
    'address',
    'walletAddress',
    'wallet_address',
    'depositAddress',
    'deposit_address',
    'receivingAddress',
    'receiving_address',
  ])
  if (!address) return null

  const network = pickStr(nested, ['network', 'chain', 'asset', 'symbol'])
  const label = pickStr(nested, ['label', 'name', 'description'])

  return {
    address,
    ...(network ? { network } : {}),
    ...(label ? { label } : {}),
  }
}

/**
 * Shared address fetcher used by deposit-style screens.
 * It keeps API integration strict while still allowing offline/demo fallback.
 * @param {string} path
 * @param {string} fallbackAddress
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ address: string; network?: string; label?: string; source: 'api' | 'fallback' }>}
 */
async function fetchAddressWithFallback(path, fallbackAddress, signal) {
  try {
    // HTTP: GET deposit or gas-fee address (path passed in — see fetchDepositAddress / fetchFundGasFeeAddress)
    const json = await apiGet(path, { signal })
    const n = normalizeDepositAddress(json)
    if (n) return { ...n, source: 'api' }
  } catch {
    /* demo / offline */
  }
  return {
    address: fallbackAddress,
    source: 'fallback',
  }
}

/**
 * Fetch the receiving address for standard deposits.
 * @param {AbortSignal} [signal]
 */
/** Calls GET /wallet/deposit-address */
export async function fetchDepositAddress(signal) {
  return fetchAddressWithFallback(getDepositAddressPath(), getDepositWalletAddress(), signal)
}

/**
 * Fetch the receiving address for gas-fee funding.
 * Falls back to deposit wallet when a dedicated endpoint is unavailable.
 * @param {AbortSignal} [signal]
 */
/** Calls GET /wallet/gas-fee-address */
export async function fetchFundGasFeeAddress(signal) {
  return fetchAddressWithFallback(getFundGasFeeAddressPath(), getDepositWalletAddress(), signal)
}
