import { apiPost } from './client.js'

/**
 * Expected successful JSON shapes (any subset):
 * - `{ accessToken, refreshToken }` — stored in sessionStorage if present
 * - `{ access_token, refresh_token }` — same
 * - `{ user: { ... } }` — passed through; session persistence is optional
 * - Cookie-only sessions: empty JSON or `{ ok: true }` with Set-Cookie from server
 *
 * Validation errors (optional): `{ errors: { assetPin: ['...'], username: ['...'], password: ['...'] } }` (Laravel-style)
 */
const loginPath = () => import.meta.env.VITE_AUTH_LOGIN_PATH || '/auth/login'

/**
 * @param {{ assetPin: string; username: string; password: string; signal?: AbortSignal }} credentials
 * @returns {Promise<unknown>}
 */
export function signIn(credentials) {
  const { assetPin, username, password, signal } = credentials
  return apiPost(loginPath(), { assetPin, username, password }, { signal })
}
