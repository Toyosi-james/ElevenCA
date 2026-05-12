/**
 * Fallback mock rate-update notifications when the API is unavailable or `VITE_NOTIFICATIONS_USE_MOCK=true`.
 * Replace with live data via `fetchRateUpdateNotifications` in `src/lib/api/notifications.js`.
 */

/** @typedef {{ id: string; pair: string; headline: string; body: string; changePct: number; occurredAt: number }} RateUpdateNotification */

/** @type {RateUpdateNotification[]} */
export const MOCK_RATE_UPDATE_NOTIFICATIONS = [
  {
    id: '1',
    pair: 'BTC / USD',
    headline: 'Reference rate refreshed',
    body: 'Venue mid moved +0.42% vs. prior print. Exchange quotes now anchor to $97,842.',
    changePct: 0.42,
    occurredAt: Date.now() - 4 * 60 * 1000,
  },
  {
    id: '2',
    pair: 'ETH / USD',
    headline: 'Reference rate refreshed',
    body: 'Mid-rate down −0.18% after liquidity sweep. Spreads widened 2 bps on the ETH leg.',
    changePct: -0.18,
    occurredAt: Date.now() - 38 * 60 * 1000,
  },
  {
    id: '3',
    pair: 'SOL / USDT',
    headline: 'Reference rate refreshed',
    body: 'Oracle consensus ticked +0.91%. Routing desk updated SOL→USDT conversion ladder.',
    changePct: 0.91,
    occurredAt: Date.now() - 2 * 60 * 60 * 1000,
  },
  {
    id: '4',
    pair: 'XRP / USD',
    headline: 'Reference rate refreshed',
    body: 'Flat session: mid unchanged within 0.02%. No action required on open orders.',
    changePct: 0.02,
    occurredAt: Date.now() - 5 * 60 * 60 * 1000,
  },
]

export function formatNotificationTime(ms) {
  const d = Math.floor((Date.now() - ms) / 60000)
  if (d < 1) return 'Just now'
  if (d < 60) return `${d}m ago`
  const h = Math.floor(d / 60)
  if (h < 48) return `${h}h ago`
  const days = Math.floor(h / 24)
  return `${days}d ago`
}
