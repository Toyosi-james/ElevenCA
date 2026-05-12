import { getExchangeExecutePath, getExchangeQuotePath } from '../config.js'
import { ApiError, apiPost } from './client.js'

/** Demo USD reference prices for mock quotes when the API is unavailable. */
export const MOCK_USD_PER_UNIT = {
  BTC: 97_200,
  ETH: 3_520,
  SOL: 178,
  XRP: 2.42,
  USDT: 1,
}

const MOCK_SPREAD = 0.0018

/** @param {string} id */
export function mockUsdUnitPrice(id) {
  return MOCK_USD_PER_UNIT[/** @type {keyof typeof MOCK_USD_PER_UNIT} */ (id)] ?? 1
}

/**
 * @param {unknown} json
 * @returns {{
 *   rate: number
 *   amountFrom: number
 *   amountTo: number
 *   from: string
 *   to: string
 *   quoteId?: string
 * } | null}
 */
function normalizeQuote(json, from, to, amountFrom) {
  if (!json || typeof json !== 'object') return null
  const o = /** @type {Record<string, unknown>} */ (json)
  const root = /** @type {Record<string, unknown>} */ (
    (o.data && typeof o.data === 'object' && o.data) || (o.quote && typeof o.quote === 'object' && o.quote) || o
  )
  const rate = num(root.rate ?? root.exchangeRate ?? root.price)
  const amtFrom = num(root.amountFrom ?? root.fromAmount ?? root.spendAmount) ?? amountFrom
  const amtTo = num(root.amountTo ?? root.toAmount ?? root.receiveAmount ?? root.outputAmount)
  if (rate != null && amtTo != null) {
    return {
      rate,
      amountFrom: amtFrom,
      amountTo: amtTo,
      from,
      to,
      quoteId: typeof root.quoteId === 'string' ? root.quoteId : typeof root.quote_id === 'string' ? root.quote_id : undefined,
    }
  }
  if (amtFrom != null && amtTo != null && amtFrom > 0) {
    return {
      rate: amtTo / amtFrom,
      amountFrom: amtFrom,
      amountTo: amtTo,
      from,
      to,
      quoteId: typeof root.quoteId === 'string' ? root.quoteId : undefined,
    }
  }
  return null
}

/** @param {unknown} v */
function num(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v)
  return null
}

/**
 * @param {string} from
 * @param {string} to
 * @param {number} amountFrom
 */
export function computeMockExchangeQuote(from, to, amountFrom) {
  if (!Number.isFinite(amountFrom) || amountFrom <= 0) {
    return { rate: 0, amountFrom, amountTo: 0, from, to }
  }
  const pf = mockUsdUnitPrice(from)
  const pt = mockUsdUnitPrice(to)
  const usd = amountFrom * pf
  const amountTo = (usd / pt) * (1 - MOCK_SPREAD)
  const rate = amountFrom > 0 ? amountTo / amountFrom : 0
  return { rate, amountFrom, amountTo, from, to }
}

/**
 * @param {AbortSignal} [signal]
 * @param {{ from: string; to: string; amountFrom: number }} body
 * @returns {Promise<{ quote: Awaited<ReturnType<typeof computeMockExchangeQuote>>; source: 'api' | 'mock' }>}
 */
export async function fetchExchangeQuote(signal, body) {
  const { from, to, amountFrom } = body
  const mock = computeMockExchangeQuote(from, to, amountFrom)
  try {
    const json = await apiPost(
      getExchangeQuotePath(),
      { from, to, amountFrom, amount_from: amountFrom, assetFrom: from, assetTo: to },
      { signal },
    )
    const n = normalizeQuote(json, from, to, amountFrom)
    if (n) return { quote: n, source: 'api' }
  } catch (e) {
    if (e instanceof ApiError && e.status === 422) throw e
    /* use mock */
  }
  return { quote: mock, source: 'mock' }
}

/**
 * @param {unknown} json
 * @returns {{ totalUsd?: number; change24hPct?: number | null; currency?: string } | null}
 */
function normalizeExecuteWallet(json) {
  if (!json || typeof json !== 'object') return null
  const o = /** @type {Record<string, unknown>} */ (json)
  const root = /** @type {Record<string, unknown>} */ (
    (o.data && typeof o.data === 'object' && o.data) || (o.wallet && typeof o.wallet === 'object' && o.wallet) || o
  )
  const summary =
    root.newBalance && typeof root.newBalance === 'object'
      ? /** @type {Record<string, unknown>} */ (root.newBalance)
      : root.balance && typeof root.balance === 'object'
        ? /** @type {Record<string, unknown>} */ (root.balance)
        : root.summary && typeof root.summary === 'object'
          ? /** @type {Record<string, unknown>} */ (root.summary)
          : root

  const totalUsd = num(summary.totalUsd ?? summary.total_usd ?? summary.balanceUsd ?? summary.balance_usd)
  const change24hPct = num(summary.change24hPct ?? summary.change_24h_pct)
  const currency = typeof summary.currency === 'string' ? summary.currency : undefined
  if (totalUsd != null) return { totalUsd, change24hPct, currency }
  return null
}

/**
 * @param {AbortSignal} [signal]
 * @param {{ from: string; to: string; amountFrom: number; quoteId?: string }} body
 * @param {{ fallbackTotalUsd: number; fallbackChangePct: number | null; fallbackCurrency: string }} walletFallback
 */
export async function executeExchange(signal, body, walletFallback) {
  const payload = {
    from: body.from,
    to: body.to,
    amountFrom: body.amountFrom,
    amount_from: body.amountFrom,
    quoteId: body.quoteId,
    quote_id: body.quoteId,
  }
  try {
    const json = await apiPost(getExchangeExecutePath(), payload, { signal })
    const w = normalizeExecuteWallet(json)
    if (w && typeof w.totalUsd === 'number') return { ok: true, wallet: w, source: 'api' }
  } catch (e) {
    if (e instanceof ApiError && e.status === 422) throw e
  }

  const spendUsd = body.amountFrom * mockUsdUnitPrice(body.from)
  const mockQ = computeMockExchangeQuote(body.from, body.to, body.amountFrom)
  const receiveUsd = mockQ.amountTo * mockUsdUnitPrice(body.to)
  const nextTotal = Math.max(0, walletFallback.fallbackTotalUsd - spendUsd + receiveUsd)

  return {
    ok: true,
    wallet: {
      totalUsd: nextTotal,
      change24hPct: walletFallback.fallbackChangePct,
      currency: walletFallback.fallbackCurrency,
    },
    source: 'mock',
  }
}
