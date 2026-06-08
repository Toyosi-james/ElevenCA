/**
 * ============================================================================
 * TOKEN STORAGE UTILITY
 * ============================================================================
 *
 * This file does NOT perform authentication.
 * The backend handles all login, JWT generation, and CSRF logic.
 *
 * Frontend responsibility:
 *   1. Receive tokens from the backend after login
 *   2. Store them in localStorage via saveTokens()
 *   3. Read them when making API requests via getAccessToken() / getCsrfToken()
 *   4. Remove them on logout via clearTokens()
 *
 * localStorage keys:
 *   - accessToken  → JWT returned by the backend
 *   - csrfToken    → CSRF token returned by the backend
 *
 * Expected backend login response shape (example):
 *   { accessToken: string, csrfToken: string, user?: object }
 *
 * Backend developer: wire your login call in src/Pages/Login.jsx, then call
 * saveTokens() with the values from your response.
 * ============================================================================
 */

/** localStorage key for the JWT access token */
const ACCESS_TOKEN_KEY = 'accessToken'

/** localStorage key for the CSRF token */
const CSRF_TOKEN_KEY = 'csrfToken'

/**
 * Save tokens returned by the backend after a successful login.
 *
 * @param {{ accessToken?: string, csrfToken?: string }} tokens
 *   accessToken — JWT from backend response
 *   csrfToken   — CSRF token from backend response
 */
export function saveTokens({ accessToken, csrfToken }) {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  }
  if (csrfToken) {
    localStorage.setItem(CSRF_TOKEN_KEY, csrfToken)
  }
}

/**
 * Read the stored JWT access token.
 * Use this when attaching Authorization: Bearer <token> to API requests.
 *
 * @returns {string | null}
 */
export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * Read the stored CSRF token.
 * Use this when the backend requires a CSRF header on protected requests.
 *
 * @returns {string | null}
 */
// export function getCsrfToken() {
//   return localStorage.getItem(CSRF_TOKEN_KEY)
// }

/**
 * Remove both tokens from localStorage.
 * Call this on logout or when the session is invalidated.
 */
export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(CSRF_TOKEN_KEY)
}
