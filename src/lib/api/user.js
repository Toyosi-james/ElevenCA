/**
 * Current user / session API.
 *
 * API: GET `{base}{VITE_AUTH_ME_PATH}` (default: GET /auth/me)
 * Used on: Home, Deposit, Withdraw, Exchange, Receive Funds, etc. (header name + avatar)
 */

import { getAuthMePath } from '../config.js'
import { persistUserSnapshot } from '../session.js'
import { apiGet } from './client.js'

/**
 * Turn API JSON into a simple { displayName, email?, avatarUrl? } for the UI.
 * @param {unknown} json
 * @returns {{ displayName: string; email?: string; avatarUrl?: string }}
 */
function parseUser(json) {
  if (!json || typeof json !== 'object') {
    return { displayName: 'Client' }
  }
  const o = /** @type {Record<string, unknown>} */ (json)
  const d = /** @type {Record<string, unknown>} */ (
    (o.data && typeof o.data === 'object' && o.data) ||
      (o.user && typeof o.user === 'object' && o.user) ||
      o
  )
  const email = typeof d.email === 'string' ? d.email : undefined
  const displayName =
    (typeof d.displayName === 'string' && d.displayName.trim() && d.displayName) ||
    (typeof d.name === 'string' && d.name.trim() && d.name) ||
    (typeof d.username === 'string' && d.username.trim() && d.username) ||
    (email ? emailLocalToName(email) : null) ||
    'Client'
  const avatarUrl =
    (typeof d.avatarUrl === 'string' && d.avatarUrl) ||
    (typeof d.avatar === 'string' && d.avatar) ||
    undefined
  return { displayName, email, avatarUrl }
}

/** @param {string} email */
function emailLocalToName(email) {
  const local = email.split('@')[0] || email
  return local.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * GET /auth/me — refreshes who is logged in and saves a snapshot to sessionStorage.
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ displayName: string; email?: string; avatarUrl?: string }>}
 */
export async function fetchSessionUser(signal) {
  // HTTP: GET /auth/me (path from getAuthMePath)
  const json = await apiGet(getAuthMePath(), { signal })
  const user = parseUser(json)
  persistUserSnapshot(user)
  return user
}
