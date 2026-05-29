/**
 * Wallet addresses for QR codes on deposit screens.
 * Override deposit address with VITE_DEPOSIT_WALLET_ADDRESS in .env if needed.
 */

import { getDepositWalletAddress } from '../config.js'

const fallback = getDepositWalletAddress()

/** @type {{ address: string; network?: string; label?: string }} */
export const DEPOSIT_ADDRESS = {
  address: fallback,
  network: 'Ethereum',
  label: 'Vault receiving address',
}

/** @type {{ address: string; network?: string; label?: string }} */
export const GAS_FEE_ADDRESS = {
  address: fallback,
  network: 'Ethereum',
  label: 'Gas fee funding address',
}

/** @param {AbortSignal} [_signal] */
export async function loadDepositAddress(_signal) {
  return { ...DEPOSIT_ADDRESS }
}

/** @param {AbortSignal} [_signal] */
export async function loadGasFeeAddress(_signal) {
  return { ...GAS_FEE_ADDRESS }
}
