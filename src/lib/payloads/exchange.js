/**
 * Exchange quotes and swap execution (frontend-only math).
 */

/** USD reference prices per asset — edit to change demo quotes. */
export const EXCHANGE_USD_PRICES = {
  BTC: 97_200,
  ETH: 3_520,
  SOL: 178,
  XRP: 2.42,
  USDT: 1,
}

const SPREAD = 0.0018

/** @param {string} id */
export function usdUnitPrice(id) {
  return EXCHANGE_USD_PRICES[/** @type {keyof typeof EXCHANGE_USD_PRICES} */ (id)] ?? 1
}

/**
 * @param {string} from
 * @param {string} to
 * @param {number} amountFrom
 */
export function computeExchangeQuote(from, to, amountFrom) {
  if (!Number.isFinite(amountFrom) || amountFrom <= 0) {
    return { rate: 0, amountFrom, amountTo: 0, from, to }
  }
  const pf = usdUnitPrice(from)
  const pt = usdUnitPrice(to)
  const usd = amountFrom * pf
  const amountTo = (usd / pt) * (1 - SPREAD)
  const rate = amountFrom > 0 ? amountTo / amountFrom : 0
  return { rate, amountFrom, amountTo, from, to }
}

/**
 * @param {AbortSignal} _signal
 * @param {{ from: string; to: string; amountFrom: number }} body
 */
export async function loadExchangeQuote(_signal, body) {
  const { from, to, amountFrom } = body
  return { quote: computeExchangeQuote(from, to, amountFrom) }
}

/**
 * @param {AbortSignal} _signal
 * @param {{ from: string; to: string; amountFrom: number }} body
 * @param {{ fallbackTotalUsd: number; fallbackChangePct: number | null; fallbackCurrency: string }} walletFallback
 */
export async function executeExchange(_signal, body, walletFallback) {
  const spendUsd = body.amountFrom * usdUnitPrice(body.from)
  const mockQ = computeExchangeQuote(body.from, body.to, body.amountFrom)
  const receiveUsd = mockQ.amountTo * usdUnitPrice(body.to)
  const nextTotal = Math.max(0, walletFallback.fallbackTotalUsd - spendUsd + receiveUsd)

  return {
    ok: true,
    wallet: {
      totalUsd: nextTotal,
      change24hPct: walletFallback.fallbackChangePct,
      currency: walletFallback.fallbackCurrency,
    },
  }
}
