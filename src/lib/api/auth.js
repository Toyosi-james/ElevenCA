/**
 * Login API — signs the user in.
 *
 * API: POST `{VITE_API_BASE_URL}{VITE_AUTH_LOGIN_PATH}` (default: POST /auth/login)
 * Body: { assetPin, username, password }
 * Screen: Login.jsx
 */

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
/** Backend login path (override with VITE_AUTH_LOGIN_PATH in .env). */
const loginPath = () => import.meta.env.VITE_AUTH_LOGIN_PATH || '/auth/login'

/**
 * POST login — returns tokens and/or user object from your backend.
 * @param {{ assetPin: string; username: string; password: string; signal?: AbortSignal }} credentials
 * @returns {Promise<unknown>}
 */
export function signIn(credentials) {
  const { assetPin, username, password, signal } = credentials
  // HTTP: POST /auth/login
  return apiPost(loginPath(), { assetPin, username, password }, { signal })
}
