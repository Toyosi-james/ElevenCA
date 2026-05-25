/**
 * Shared HTTP client for all backend calls.
 *
 * - Builds full URL: `getApiBaseUrl()` + path (e.g. `/auth/login`)
 * - Sends `Authorization: Bearer <token>` when the user is logged in
 * - Parses JSON responses and throws `ApiError` on non-2xx status codes
 *
 * Use `apiGet` for reads and `apiPost` for writes. Path helpers live in `config.js`.
 */

import { getApiBaseUrl } from '../config.js'
import { getStoredAccessToken } from '../session.js'

/** Adds Bearer token from sessionStorage when available. @returns {Record<string, string>} */
export function getAuthHeaders() {
  const t = getStoredAccessToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

export class ApiError extends Error {
  /** @param {string} message */
  constructor(message, { status, body } = {}) {
    super(message)
    this.name = 'ApiError'
    /** @type {number | undefined} */
    this.status = status
    /** @type {unknown} */
    this.body = body
  }
}

/**
 * POST JSON to the API.
 * @param {string} path Absolute or relative path, e.g. `/auth/login`
 * @param {Record<string, unknown>} body
 * @param {{ signal?: AbortSignal, timeoutMs?: number, credentials?: RequestCredentials, headers?: Record<string, string> }} [options]
 */
export async function apiPost(path, body, options = {}) {
  const base = getApiBaseUrl()
  const normalized = path.startsWith('/') ? path : `/${path}`
  const url = `${base}${normalized}`

  const controller = new AbortController()
  const outerSignal = options.signal
  const timeoutMs = options.timeoutMs ?? 28_000

  if (outerSignal) {
    if (outerSignal.aborted) controller.abort(outerSignal.reason)
    else outerSignal.addEventListener('abort', () => controller.abort(outerSignal.reason), { once: true })
  }

  const timeoutId = setTimeout(() => controller.abort(new DOMException('Timeout', 'AbortError')), timeoutMs)

  try {
    // Actual network request (all POST APIs go through here)
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
      credentials: options.credentials ?? 'include',
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    const text = await res.text()
    /** @type {unknown} */
    let json = null
    if (text) {
      try {
        json = JSON.parse(text)
      } catch {
        json = { raw: text }
      }
    }

    if (!res.ok) {
      const message =
        (json && typeof json === 'object' && 'message' in json && typeof json.message === 'string' && json.message) ||
        (json && typeof json === 'object' && 'error' in json && typeof json.error === 'string' && json.error) ||
        res.statusText ||
        'Request failed'
      throw new ApiError(message, { status: res.status, body: json })
    }

    return json
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * GET JSON from the API (no request body).
 * @param {string} path e.g. `/wallet/summary` or `/wallet/transactions?page=1&limit=10`
 * @param {{ signal?: AbortSignal; timeoutMs?: number; credentials?: RequestCredentials; headers?: Record<string, string> }} [options]
 */
export async function apiGet(path, options = {}) {
  const base = getApiBaseUrl()
  const normalized = path.startsWith('/') ? path : `/${path}`
  const url = `${base}${normalized}`

  const controller = new AbortController()
  const outerSignal = options.signal
  const timeoutMs = options.timeoutMs ?? 28_000

  if (outerSignal) {
    if (outerSignal.aborted) controller.abort(outerSignal.reason)
    else outerSignal.addEventListener('abort', () => controller.abort(outerSignal.reason), { once: true })
  }

  const timeoutId = setTimeout(() => controller.abort(new DOMException('Timeout', 'AbortError')), timeoutMs)

  try {
    // Actual network request (all GET APIs go through here)
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
      credentials: options.credentials ?? 'include',
      signal: controller.signal,
    })

    const text = await res.text()
    /** @type {unknown} */
    let json = null
    if (text) {
      try {
        json = JSON.parse(text)
      } catch {
        json = { raw: text }
      }
    }

    if (!res.ok) {
      const message =
        (json && typeof json === 'object' && 'message' in json && typeof json.message === 'string' && json.message) ||
        (json && typeof json === 'object' && 'error' in json && typeof json.error === 'string' && json.error) ||
        res.statusText ||
        'Request failed'
      throw new ApiError(message, { status: res.status, body: json })
    }

    return json
  } finally {
    clearTimeout(timeoutId)
  }
}
