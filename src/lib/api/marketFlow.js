import { getMarketFlowPath } from '../config.js'
import { apiGet } from './client.js'

/**
 * @typedef {{ label: string; btc: number; eth: number; sol: number }} FlowPoint
 */

/** @param {unknown} raw @returns {FlowPoint[] | null} */
export function normalizeFlowSeries(raw) {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object'
      ? /** @type {Record<string, unknown>} */ (raw).series ||
        /** @type {Record<string, unknown>} */ (raw).data ||
        /** @type {Record<string, unknown>} */ (raw).points
      : null
  if (!Array.isArray(list) || list.length === 0) return null

  /** @type {FlowPoint[]} */
  const out = []
  for (let i = 0; i < list.length; i++) {
    const p = list[i]
    if (!p || typeof p !== 'object') continue
    const o = /** @type {Record<string, unknown>} */ (p)
    const label = String(o.t ?? o.ts ?? o.date ?? o.time ?? o.label ?? i)
    const btc = Number(o.btc ?? o.BTC ?? o.b ?? 0)
    const eth = Number(o.eth ?? o.ETH ?? o.e ?? 0)
    const sol = Number(o.sol ?? o.SOL ?? o.s ?? 0)
    if (!Number.isFinite(btc) && !Number.isFinite(eth) && !Number.isFinite(sol)) continue
    out.push({
      label,
      btc: Number.isFinite(btc) ? btc : 0,
      eth: Number.isFinite(eth) ? eth : 0,
      sol: Number.isFinite(sol) ? sol : 0,
    })
  }
  return out.length ? out : null
}

/** @returns {FlowPoint[]} */
export function buildMockMarketFlow() {
  /** @type {FlowPoint[]} */
  const out = []
  let b = 58_200
  let e = 2_480
  let s = 118
  const start = Date.now() - 29 * 86400000
  for (let i = 0; i < 30; i++) {
    b *= 1 + Math.sin(i / 4.2) * 0.006 + (Math.random() - 0.48) * 0.005
    e *= 1 + Math.cos(i / 3.8) * 0.007 + (Math.random() - 0.5) * 0.006
    s *= 1 + Math.sin(i / 2.9) * 0.008 + (Math.random() - 0.5) * 0.007
    const d = new Date(start + i * 86400000)
    out.push({
      label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      btc: Math.round(b * 100) / 100,
      eth: Math.round(e * 100) / 100,
      sol: Math.round(s * 100) / 100,
    })
  }
  return out
}

/** ~24 hourly points (demo only) for a credible 1D view when daily API data is not intraday. */
export function buildMockIntradayFlow() {
  /** @type {FlowPoint[]} */
  const out = []
  let b = 61_000 + (Math.random() - 0.5) * 400
  let e = 2_580 + (Math.random() - 0.5) * 40
  let s = 120 + (Math.random() - 0.5) * 3
  const start = Date.now() - 23 * 3600000
  for (let i = 0; i < 24; i++) {
    b *= 1 + (Math.random() - 0.5) * 0.0014
    e *= 1 + (Math.random() - 0.5) * 0.0018
    s *= 1 + (Math.random() - 0.5) * 0.0022
    const d = new Date(start + i * 3600000)
    out.push({
      label: d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
      btc: Math.round(b * 100) / 100,
      eth: Math.round(e * 100) / 100,
      sol: Math.round(s * 100) / 100,
    })
  }
  return out
}

/**
 * @typedef {'1d' | '7d' | '30d'} FlowRange
 */

/**
 * Last-N slices for multi-day ranges; demo 1D uses intraday mock. API 1D uses last two daily points when only coarse series exists.
 * @param {FlowPoint[]} points
 * @param {FlowRange} range
 * @param {{ source: 'api' | 'demo' }} opts
 * @returns {FlowPoint[]}
 */
export function selectFlowWindow(points, range, opts) {
  const list = Array.isArray(points) ? points : []
  if (list.length === 0) return []

  if (range === '30d') {
    return list.length <= 30 ? [...list] : list.slice(-30)
  }
  if (range === '7d') {
    return list.length <= 7 ? [...list] : list.slice(-7)
  }
  if (opts.source === 'demo') {
    return buildMockIntradayFlow()
  }
  return list.length <= 2 ? [...list] : list.slice(-2)
}

/**
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ points: FlowPoint[]; source: 'api' | 'demo' }>}
 */
export async function fetchMarketFlowSeries(signal) {
  try {
    const json = await apiGet(getMarketFlowPath(), { signal })
    const normalized = normalizeFlowSeries(json)
    if (normalized) return { points: normalized, source: 'api' }
  } catch {
    /* demo fallback */
  }
  return { points: buildMockMarketFlow(), source: 'demo' }
}
