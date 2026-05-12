import { getNotificationsPath, getNotificationsUseMockOnly } from '../config.js'
import { MOCK_RATE_UPDATE_NOTIFICATIONS } from '../notifications/rateUpdateNotifications.js'
import { apiGet } from './client.js'

/**
 * @typedef {{
 *   id: string
 *   pair: string
 *   headline: string
 *   body: string
 *   changePct: number
 *   occurredAt: number
 * }} RateUpdateNotification
 *
 * @typedef {{ items: RateUpdateNotification[]; source: 'api' | 'mock' }} RateUpdatesResult
 */

/** @param {unknown} v */
function num(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v)
  return null
}

/** @param {unknown} v */
function str(v) {
  if (typeof v === 'string') return v.trim()
  if (v != null && typeof v !== 'object') return String(v).trim()
  return ''
}

/** @param {unknown} v */
function parseOccurredAt(v) {
  if (typeof v === 'number' && Number.isFinite(v)) {
    return v > 1e12 ? v : v * 1000
  }
  if (typeof v === 'string' && v.trim()) {
    const t = Date.parse(v)
    if (!Number.isNaN(t)) return t
  }
  return Date.now()
}

/** @param {unknown} entry @param {number} idx */
function normalizeRateUpdate(entry, idx) {
  if (!entry || typeof entry !== 'object') return null
  const o = /** @type {Record<string, unknown>} */ (entry)
  const id = str(o.id ?? o.notificationId ?? `row-${idx}`)
  const pair = str(o.pair ?? o.symbol ?? o.assetPair ?? o.title)
  const headline = str(o.headline ?? o.title ?? o.subject ?? 'Rate update')
  const body = str(o.body ?? o.message ?? o.description ?? o.detail ?? '')
  const changePct = num(o.changePct ?? o.change_pct ?? o.changePercent ?? o.midChangePct ?? o.deltaPct)
  const occurredAt = parseOccurredAt(o.occurredAt ?? o.occurred_at ?? o.createdAt ?? o.timestamp ?? o.time)

  if (!pair && !headline) return null
  return /** @type {RateUpdateNotification} */ ({
    id: id || `n-${idx}`,
    pair: pair || '—',
    headline: headline || 'Rate update',
    body: body || '',
    changePct: changePct ?? 0,
    occurredAt,
  })
}

/** @param {unknown} raw */
function extractItems(raw) {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const o = /** @type {Record<string, unknown>} */ (raw)
    if (Array.isArray(o.items)) return o.items
    if (Array.isArray(o.data)) return o.data
    if (Array.isArray(o.notifications)) return o.notifications
    if (o.data && typeof o.data === 'object') {
      const d = /** @type {Record<string, unknown>} */ (o.data)
      if (Array.isArray(d.items)) return d.items
    }
  }
  return []
}

/**
 * Fetches rate-update notifications from the backend, or returns mock data on network/parse failure or mock-only mode.
 *
 * @param {AbortSignal} [signal]
 * @returns {Promise<RateUpdatesResult>}
 */
export async function fetchRateUpdateNotifications(signal) {
  if (getNotificationsUseMockOnly()) {
    return { items: [...MOCK_RATE_UPDATE_NOTIFICATIONS], source: 'mock' }
  }

  try {
    const json = await apiGet(getNotificationsPath(), { signal })
    const list = extractItems(json)
    const items = list.map((e, i) => normalizeRateUpdate(e, i)).filter(Boolean)
    return { items: /** @type {RateUpdateNotification[]} */ (items), source: 'api' }
  } catch (e) {
    if (signal?.aborted || (e instanceof DOMException && e.name === 'AbortError')) {
      throw e
    }
    return { items: [...MOCK_RATE_UPDATE_NOTIFICATIONS], source: 'mock' }
  }
}
