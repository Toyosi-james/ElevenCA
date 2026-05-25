/**
 * Browser session helpers (sessionStorage).
 *
 * After login (POST /auth/login), we may store:
 * - Access / refresh tokens (for Authorization header on API calls)
 * - A small user snapshot (name, email, avatar) for instant UI
 * - Optional wallet balance override after an in-app exchange
 *
 * Keys are prefixed with `cb_` so they are easy to find in DevTools.
 */

const ACCESS = 'cb_access_token'
const REFRESH = 'cb_refresh_token'
const USER_SNAPSHOT = 'cb_user_snapshot'
const WALLET_SUMMARY_OVERRIDE = 'cb_wallet_summary_override'

/**
 * Saves login response: tokens + optional user object from POST /auth/login.
 * Prefer httpOnly cookies from your API when possible — then omit tokens from the body.
 *
 * @param {unknown} data
 * @param {{ email?: string; username?: string }} [meta] Optional login identifiers for display until `/auth/me` runs.
 */
export function persistAuthPayload(data, meta = {}) {
  if (!data || typeof data !== 'object') {
    if (meta.username) persistUserSnapshotFromUsername(meta.username)
    else if (meta.email) persistUserSnapshotFromEmail(meta.email)
    return
  }

  const o = /** @type {Record<string, unknown>} */ (data)
  const access = o.accessToken ?? o.access_token
  const refresh = o.refreshToken ?? o.refresh_token

  if (typeof access === 'string' && access.length > 0) {
    sessionStorage.setItem(ACCESS, access)
  }
  if (typeof refresh === 'string' && refresh.length > 0) {
    sessionStorage.setItem(REFRESH, refresh)
  }

  if (o.user && typeof o.user === 'object') {
    persistUserSnapshot(normalizeUserFromPayload(/** @type {Record<string, unknown>} */ (o.user)))
  } else if (meta.username) {
    persistUserSnapshotFromUsername(meta.username)
  } else if (meta.email) {
    persistUserSnapshotFromEmail(meta.email)
  }
}

/** @param {Record<string, unknown>} u */
function normalizeUserFromPayload(u) {
  const displayName =
    (typeof u.displayName === 'string' && u.displayName) ||
    (typeof u.name === 'string' && u.name) ||
    (typeof u.username === 'string' && u.username) ||
    (typeof u.email === 'string' && emailToDisplayName(u.email)) ||
    'Client'
  const email = typeof u.email === 'string' ? u.email : undefined
  const avatarUrl = typeof u.avatarUrl === 'string' ? u.avatarUrl : typeof u.avatar === 'string' ? u.avatar : undefined
  return { displayName, email, avatarUrl }
}

/** @param {string} email */
function persistUserSnapshotFromEmail(email) {
  persistUserSnapshot({ displayName: emailToDisplayName(email), email })
}

/** @param {string} username */
function persistUserSnapshotFromUsername(username) {
  const u = username.trim()
  const displayName = u
    ? u.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Client'
  persistUserSnapshot({ displayName })
}

/** @param {string} email */
function emailToDisplayName(email) {
  const local = email.split('@')[0] || email
  return local.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/** @param {{ displayName: string; email?: string; avatarUrl?: string }} user */
export function persistUserSnapshot(user) {
  sessionStorage.setItem(USER_SNAPSHOT, JSON.stringify(user))
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

export function clearStoredTokens() {
  sessionStorage.removeItem(ACCESS)
  sessionStorage.removeItem(REFRESH)
}

export function clearSession() {
  clearStoredTokens()
  sessionStorage.removeItem(USER_SNAPSHOT)
  sessionStorage.removeItem(WALLET_SUMMARY_OVERRIDE)
}

/**
 * After an in-app exchange, stash portfolio USD so Home can reflect it when using demo balance (`fetchWalletSummary` fallback).
 *
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

/**
 * @returns {{ totalUsd: number; change24hPct?: number | null; currency?: string } | null}
 */
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

/** @returns {string | null} */
export function getStoredAccessToken() {
  return sessionStorage.getItem(ACCESS)
}

/** @param {unknown} body */
export function extractFieldErrors(body) {
  if (!body || typeof body !== 'object') return {}
  const errors = /** @type {Record<string, unknown>} */ (body).errors
  if (!errors || typeof errors !== 'object') return {}

  /** @type {Record<string, string>} */
  const out = {}
  for (const [key, val] of Object.entries(errors)) {
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') {
      out[key] = val[0]
    } else if (typeof val === 'string') {
      out[key] = val
    }
  }
  return out
}
