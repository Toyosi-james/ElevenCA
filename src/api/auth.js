/**
 * Auth helpers: CSRF bootstrap, login, JWT + refresh token storage, authenticated fetch.
 * Configurable via VITE_* env vars — see .env.example.
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export const AUTH_ENDPOINTS = {
  csrf: import.meta.env.VITE_AUTH_CSRF_URL ?? '/api/auth/csrf',
  login: import.meta.env.VITE_AUTH_LOGIN_URL ?? '/api/auth/login',
  refresh: import.meta.env.VITE_AUTH_REFRESH_URL ?? '/api/auth/refresh',
}

export const CSRF_COOKIE_NAME = import.meta.env.VITE_CSRF_COOKIE_NAME ?? 'XSRF-TOKEN'
export const CSRF_HEADER_NAME = import.meta.env.VITE_CSRF_HEADER_NAME ?? 'X-XSRF-TOKEN'
export const JWT_STORAGE_KEY = import.meta.env.VITE_JWT_STORAGE_KEY ?? 'accessToken'
export const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken'
export const SESSION_KEY = 'eleven_user'

const JWT_PRIMARY_FIELD = import.meta.env.VITE_JWT_RESPONSE_FIELD ?? 'accessToken'
const JWT_FALLBACK_FIELDS = ['token', 'jwt', 'access_token']

/** @type {Promise<string> | null} */
let refreshInFlight = null

function resolveUrl(path) {
  if (/^https?:\/\//i.test(path)) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  return API_BASE ? `${API_BASE}${normalized}` : normalized
}

/** Read a cookie value by name (supports encoded names/values). */
export function getCookie(name) {
  if (!name || typeof document === 'undefined') return null

  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim()
    const separator = trimmed.indexOf('=')
    if (separator === -1) continue

    const rawKey = trimmed.slice(0, separator)
    const rawValue = trimmed.slice(separator + 1)
    if (rawKey === name) {
      return rawValue ? decodeURIComponent(rawValue) : null
    }
  }

  return null
}

/** Return the CSRF token stored in the cookie set by the CSRF endpoint. */
export function getCsrfTokenFromCookie() {
  return getCookie(CSRF_COOKIE_NAME)
}

/**
 * GET the CSRF endpoint so the server sets the CSRF cookie.
 * Some backends also return the token in the JSON body as a fallback.
 */
export async function fetchCsrfToken() {
  const res = await fetch(resolveUrl(AUTH_ENDPOINTS.csrf), {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error('Unable to initialize secure session. Please refresh the page.')
  }

  let bodyToken = null
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    try {
      const data = await res.json()
      bodyToken = data?.token ?? data?.csrfToken ?? data?.csrf ?? null
    } catch {
      /* empty or non-JSON body is acceptable when the cookie is set */
    }
  }

  return getCsrfTokenFromCookie() ?? bodyToken
}

export function getStoredAccessToken() {
  return localStorage.getItem(JWT_STORAGE_KEY)
}

export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
}

export function isAuthenticated() {
  return Boolean(getStoredAccessToken() || getStoredRefreshToken())
}

export function storeAuthSession({ accessToken, refreshToken, user }) {
  if (accessToken) {
    localStorage.setItem(JWT_STORAGE_KEY, accessToken)
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken)
  }
  if (user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
  }
}

export function clearAuthSession() {
  localStorage.removeItem(JWT_STORAGE_KEY)
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

/** Clear tokens and redirect to the login page. */
export function logout() {
  clearAuthSession()
  window.location.assign('/login')
}

function extractRefreshToken(data) {
  const value = data?.refreshToken
  return typeof value === 'string' && value.length > 0 ? value : null
}

function extractAccessToken(data) {
  const fields = [JWT_PRIMARY_FIELD, ...JWT_FALLBACK_FIELDS.filter((f) => f !== JWT_PRIMARY_FIELD)]
  for (const field of fields) {
    const value = data?.[field]
    if (typeof value === 'string' && value.length > 0) return value
  }
  return null
}

function buildUserFromResponse(data, username) {
  if (data?.user && typeof data.user === 'object') return data.user

  const displayName = username
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return { displayName: displayName || 'Client' }
}

async function parseErrorMessage(res) {
  try {
    const data = await res.json()
    if (typeof data?.message === 'string') return data.message
    if (typeof data?.error === 'string') return data.error
    if (typeof data?.detail === 'string') return data.detail
  } catch {
    /* ignore */
  }
  return null
}

/**
 * Authenticate with CSRF protection and persist the returned JWT.
 * @param {{ username: string, assetPin: string, password: string }} credentials
 */
export async function login({ username, assetPin, password }) {
  let csrfToken = getCsrfTokenFromCookie()
  if (!csrfToken) {
    csrfToken = await fetchCsrfToken()
  }
  if (!csrfToken) {
    throw new Error('Security token missing. Please refresh the page and try again.')
  }

  const res = await fetch(resolveUrl(AUTH_ENDPOINTS.login), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      [CSRF_HEADER_NAME]: csrfToken,
    },
    body: JSON.stringify({ username, assetPin, password }),
  })

  if (!res.ok) {
    const message =
      (await parseErrorMessage(res)) ?? 'Invalid credentials. Please try again.'
    throw new Error(message)
  }

  const data = await res.json()
  const accessToken = extractAccessToken(data)
  if (!accessToken) {
    throw new Error('Login succeeded but no access token was returned.')
  }

  const user = buildUserFromResponse(data, username)
  const refreshToken = extractRefreshToken(data)
  storeAuthSession({ accessToken, refreshToken, user })
  if (!refreshToken) {
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
  }

  return { accessToken, refreshToken, user }
}

/**
 * Exchange a stored refresh token for a new access token.
 * Clears the session and logs out when refresh is unavailable or rejected.
 * @returns {Promise<string>} The new access token
 */
export async function refreshAccessToken() {
  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    const refreshToken = getStoredRefreshToken()
    if (!refreshToken) {
      logout()
      throw new Error('Session expired')
    }

    const res = await fetch(resolveUrl(AUTH_ENDPOINTS.refresh), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!res.ok) {
      logout()
      throw new Error('Session expired')
    }

    const data = await res.json()
    const accessToken = extractAccessToken(data)
    if (!accessToken) {
      logout()
      throw new Error('Session expired')
    }

    const rotatedRefreshToken = extractRefreshToken(data)
    storeAuthSession({
      accessToken,
      refreshToken: rotatedRefreshToken ?? refreshToken,
    })

    return accessToken
  })()

  try {
    return await refreshInFlight
  } finally {
    refreshInFlight = null
  }
}

function buildAuthHeaders(initHeaders) {
  const headers = new Headers(initHeaders)
  const token = getStoredAccessToken()
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }
  return headers
}

/**
 * Authenticated fetch: attaches Bearer token, retries once after 401 via refresh.
 * Use this for protected API calls (not login / CSRF / refresh).
 */
export async function authFetch(input, init = {}, retried = false) {
  const url = typeof input === 'string' ? resolveUrl(input) : input
  const headers = buildAuthHeaders(init.headers)

  let res = await fetch(url, {
    ...init,
    headers,
    credentials: init.credentials ?? 'include',
  })

  if (res.status === 401 && !retried) {
    try {
      await refreshAccessToken()
    } catch {
      throw new Error('Session expired')
    }

    const retryHeaders = buildAuthHeaders(init.headers)
    res = await fetch(url, {
      ...init,
      headers: retryHeaders,
      credentials: init.credentials ?? 'include',
    })

    if (res.status === 401) {
      logout()
      throw new Error('Session expired')
    }
  }

  return res
}
