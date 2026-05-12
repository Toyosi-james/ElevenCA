/** API origin without trailing slash. Empty string = same origin (e.g. Vite proxy). */
export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (raw == null || raw === '') return ''
  return String(raw).replace(/\/+$/, '')
}

export function getPostLoginRedirect() {
  return import.meta.env.VITE_POST_LOGIN_REDIRECT ?? '/home'
}

/** GET path for current user (session). */
export function getAuthMePath() {
  return import.meta.env.VITE_AUTH_ME_PATH || '/auth/me'
}

/** GET path for extended profile fields (defaults to same as session endpoint). */
export function getProfileDetailPath() {
  const p = import.meta.env.VITE_PROFILE_DETAIL_PATH
  if (p != null && String(p).trim() !== '') return String(p).trim()
  return getAuthMePath()
}

/**
 * When `true`, profile UI skips the profile GET and uses `PROFILE_MOCK_DATA` + session snapshot only.
 * Set `VITE_PROFILE_USE_MOCK=true` in `.env` for layout demos without a backend.
 */
export function getProfileUseMockOnly() {
  return String(import.meta.env.VITE_PROFILE_USE_MOCK ?? '').toLowerCase() === 'true'
}

/** GET path for aggregate balance / portfolio summary. */
export function getBalancePath() {
  return import.meta.env.VITE_BALANCE_PATH || '/wallet/summary'
}

/** GET transaction history list — default `/wallet/transactions`. */
export function getTransactionsPath() {
  return import.meta.env.VITE_TRANSACTIONS_PATH || '/wallet/transactions'
}

/**
 * GET rate-update / pricing notifications for the Notifications screen.
 * Expected JSON: `{ items: [...] }` or `{ data: [...] }` or a raw array (see `src/lib/api/notifications.js`).
 */
export function getNotificationsPath() {
  const p = import.meta.env.VITE_NOTIFICATIONS_PATH
  if (p != null && String(p).trim() !== '') return String(p).trim()
  return '/wallet/notifications/rate-updates'
}

/**
 * When `true`, skips the notifications GET and uses mock data only (layout / demos without a backend).
 */
export function getNotificationsUseMockOnly() {
  return String(import.meta.env.VITE_NOTIFICATIONS_USE_MOCK ?? '').toLowerCase() === 'true'
}

/**
 * GET path for market / flow series (backend contract — adjust to match your API).
 * Expected JSON (flexible): `{ series: [{ t, btc, eth, sol }] }` or `{ data: [...] }` or raw array.
 */
export function getMarketFlowPath() {
  return import.meta.env.VITE_MARKET_FLOW_PATH || '/markets/flow'
}

/** GET deposit receiving address (wallet string for QR + display). Backend contract — adjust path to match your API. */
export function getDepositAddressPath() {
  return import.meta.env.VITE_DEPOSIT_ADDRESS_PATH || '/wallet/deposit-address'
}

/** GET gas-fee funding address used by the Fund Gas Fee screen. */
export function getFundGasFeeAddressPath() {
  return import.meta.env.VITE_FUND_GAS_FEE_ADDRESS_PATH || '/wallet/gas-fee-address'
}

/** Optional full URLs opened by Deposit / Stake actions. */
export function getDepositUrl() {
  const u = import.meta.env.VITE_DEPOSIT_URL
  return u && String(u).trim() ? String(u).trim() : null
}

/**
 * Wallet address shown on the in-app deposit screen and encoded in the QR code.
 * Set `VITE_DEPOSIT_WALLET_ADDRESS` in production.
 */
export function getDepositWalletAddress() {
  const u = import.meta.env.VITE_DEPOSIT_WALLET_ADDRESS
  if (u != null && String(u).trim() !== '') return String(u).trim()
  return '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
}

export function getStakeUrl() {
  const u = import.meta.env.VITE_STAKE_URL
  return u && String(u).trim() ? String(u).trim() : null
}

export function getWithdrawUrl() {
  const u = import.meta.env.VITE_WITHDRAW_URL
  return u && String(u).trim() ? String(u).trim() : null
}

/** POST — create withdraw request / gas-fee challenge. */
export function getWithdrawRequestPath() {
  const p = import.meta.env.VITE_WITHDRAW_REQUEST_PATH
  if (p != null && String(p).trim() !== '') return String(p).trim()
  return '/wallet/withdraw'
}

export function getExchangeUrl() {
  const u = import.meta.env.VITE_EXCHANGE_URL
  return u && String(u).trim() ? String(u).trim() : null
}

/** POST — quote swap (`from`, `to`, `amountFrom`). */
export function getExchangeQuotePath() {
  const p = import.meta.env.VITE_EXCHANGE_QUOTE_PATH
  if (p != null && String(p).trim() !== '') return String(p).trim()
  return '/wallet/exchange/quote'
}

/** POST — execute swap (same body + optional `quoteId`). */
export function getExchangeExecutePath() {
  const p = import.meta.env.VITE_EXCHANGE_EXECUTE_PATH
  if (p != null && String(p).trim() !== '') return String(p).trim()
  return '/wallet/exchange'
}

/** Optional: account / profile settings page (used by header Profile controls). */
export function getProfileUrl() {
  const u = import.meta.env.VITE_PROFILE_URL
  return u && String(u).trim() ? String(u).trim() : null
}

export function getPasswordResetUrl() {
  const u = import.meta.env.VITE_PASSWORD_RESET_URL
  return u && String(u).trim() !== '' ? String(u).trim() : null
}
