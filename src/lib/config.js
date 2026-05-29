/**
 * Frontend-only app settings (no backend URLs).
 * Wallet address can still be set via VITE_DEPOSIT_WALLET_ADDRESS in .env.
 */

export function getPostLoginRedirect() {
  return import.meta.env.VITE_POST_LOGIN_REDIRECT ?? '/home'
}

/** Wallet address for deposit QR codes when not overridden in payloads/deposit.js */
export function getDepositWalletAddress() {
  const u = import.meta.env.VITE_DEPOSIT_WALLET_ADDRESS
  if (u != null && String(u).trim() !== '') return String(u).trim()
  return '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
}

export function getPasswordResetUrl() {
  const u = import.meta.env.VITE_PASSWORD_RESET_URL
  return u && String(u).trim() !== '' ? String(u).trim() : null
}
