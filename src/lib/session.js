/**
 * Browser session (sessionStorage) — frontend demo login state only.
 */

const USER_SNAPSHOT = 'cb_user_snapshot'
const WALLET_SUMMARY_OVERRIDE = 'cb_wallet_summary_override'
const LOGGED_IN = 'cb_logged_in'

/** @param {string} username */
export function persistUserSnapshotFromUsername(username) {
  const u = username.trim()
  const displayName = u
    ? u.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Client'
  persistUserSnapshot({ displayName })
  sessionStorage.setItem(LOGGED_IN, '1')
}

/** @param {{ displayName: string; email?: string; avatarUrl?: string }} user */
export function persistUserSnapshot(user) {
  sessionStorage.setItem(USER_SNAPSHOT, JSON.stringify(user))
  sessionStorage.setItem(LOGGED_IN, '1')
}

export function getUserSnapshot() {
  const r = sessionStorage.getItem(USER_SNAPSHOT)
  if (!r) return null
  try {
    const v = JSON.parse(r)
    if (v && typeof v === 'object' && typeof v.displayName === 'string') return v
    return null
  } catch {
    return null
  }
}

export function isLoggedIn() {
  return sessionStorage.getItem(LOGGED_IN) === '1' && Boolean(getUserSnapshot())
}

export function clearSession() {
  sessionStorage.removeItem(USER_SNAPSHOT)
  sessionStorage.removeItem(WALLET_SUMMARY_OVERRIDE)
  sessionStorage.removeItem(LOGGED_IN)
}

/**
 * After an in-app exchange, stash portfolio USD so Home reflects the new total.
 * @param {{ totalUsd: number; change24hPct?: number | null; currency?: string }} summary
 */
export function persistWalletSummaryOverride(summary) {
  try {
    sessionStorage.setItem(WALLET_SUMMARY_OVERRIDE, JSON.stringify(summary))
  } catch {
    /* ignore quota */
  }
}

export function clearWalletSummaryOverride() {
  sessionStorage.removeItem(WALLET_SUMMARY_OVERRIDE)
}

/** @returns {{ totalUsd: number; change24hPct?: number | null; currency?: string } | null} */
export function peekWalletSummaryOverride() {
  const raw = sessionStorage.getItem(WALLET_SUMMARY_OVERRIDE)
  if (!raw) return null
  try {
    const v = JSON.parse(raw)
    if (v && typeof v === 'object' && typeof v.totalUsd === 'number' && Number.isFinite(v.totalUsd)) return v
    return null
  } catch {
    return null
  }
}
