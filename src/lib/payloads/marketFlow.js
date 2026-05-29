/**
 * Market flow chart series (BTC / ETH / SOL over time).
 */

/** @typedef {{ label: string; btc: number; eth: number; sol: number }} FlowPoint */
/** @typedef {'1d' | '7d' | '30d'} FlowRange */

/** @returns {FlowPoint[]} */
export function buildMarketFlowSeries() {
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

/** Hourly points for the 1-day chart range. */
export function buildIntradayFlowSeries() {
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
 * @param {FlowPoint[]} points
 * @param {FlowRange} range
 */
export function selectFlowWindow(points, range) {
  const list = Array.isArray(points) ? points : []
  if (list.length === 0) return []
  if (range === '30d') return list.length <= 30 ? [...list] : list.slice(-30)
  if (range === '7d') return list.length <= 7 ? [...list] : list.slice(-7)
  return buildIntradayFlowSeries()
}

/** @param {AbortSignal} [_signal] */
export async function loadMarketFlowSeries(_signal) {
  return { points: buildMarketFlowSeries() }
}
