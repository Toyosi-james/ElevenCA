import { getTransactionsPath } from '../config.js'
import { apiGet } from './client.js'

/**
 * Transaction rows are authored by your admin / backend; this client only reads via GET (paginated).
 *
 * @typedef {'completed' | 'pending' | 'failed'} TxStatus
 * @typedef {{
 *   id: string
 *   title: string
 *   amount: number
 *   currency: string
 *   direction: 'in' | 'out'
 *   status: TxStatus
 *   occurredAt: number
 *   reference?: string
 * }} TransactionRow
 *
 * @typedef {{
 *   items: TransactionRow[]
 *   page: number
 *   limit: number
 *   total: number
 *   totalPages: number
 *   hasNextPage: boolean
 *   source: 'api' | 'demo' | 'empty'
 * }} TransactionsPageResult
 */

/** @param {unknown} v */
function num(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v)
  return null
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

/** @param {unknown} raw */
function normalizeStatus(raw) {
  const s = String(raw ?? 'completed').toLowerCase()
  if (s === 'pending' || s === 'processing') return /** @type {TxStatus} */ ('pending')
  if (s === 'failed' || s === 'error' || s === 'cancelled' || s === 'canceled') return /** @type {TxStatus} */ ('failed')
  return /** @type {TxStatus} */ ('completed')
}

/** @param {string} typeRaw */
function directionFromType(typeRaw) {
  const t = typeRaw.toLowerCase()
  if (
    ['deposit', 'credit', 'receive', 'inbound', 'incoming', 'reward', 'stake_reward', 'interest'].some((x) =>
      t.includes(x),
    )
  ) {
    return /** @type {'in'} */ ('in')
  }
  if (
    ['withdraw', 'withdrawal', 'debit', 'send', 'outbound', 'outgoing', 'fee', 'stake', 'unstake'].some((x) =>
      t.includes(x),
    )
  ) {
    return /** @type {'out'} */ ('out')
  }
  return /** @type {'out'} */ ('out')
}

/** @param {unknown} entry @param {number} idx */
export function normalizeTransactionRow(entry, idx) {
  if (!entry || typeof entry !== 'object') return null
  const o = /** @type {Record<string, unknown>} */ (entry)

  const id = String(o.id ?? o.txId ?? o.transaction_id ?? o.reference ?? `tx-${idx}`)
  const typeRaw = String(o.type ?? o.kind ?? o.category ?? '')
  const title =
    String(o.description ?? o.memo ?? o.label ?? o.title ?? '').trim() ||
    (typeRaw ? typeRaw.replace(/_/g, ' ') : 'Transaction')

  let amount =
    num(o.amount) ??
    num(o.amountUsd) ??
    num(o.amount_usd) ??
    num(o.value) ??
    num(o.change) ??
    num(o.quantity)

  const currency =
    String(o.currency ?? o.asset ?? o.symbol ?? 'USD').trim().toUpperCase().slice(0, 8) || 'USD'

  const dirRaw = String(o.direction ?? o.side ?? '').toLowerCase()
  let direction = directionFromType(typeRaw + ' ' + title)
  if (dirRaw === 'in' || dirRaw === 'credit' || dirRaw === 'receive') direction = 'in'
  if (dirRaw === 'out' || dirRaw === 'debit' || dirRaw === 'send') direction = 'out'

  if (amount == null || Number.isNaN(amount)) amount = 0
  const abs = Math.abs(amount)
  if (direction === 'out' && amount > 0) amount = -abs
  if (direction === 'in' && amount < 0) amount = abs

  const status = normalizeStatus(o.status ?? o.state)
  const occurredAt = parseOccurredAt(o.createdAt ?? o.created_at ?? o.timestamp ?? o.date ?? o.ts ?? o.time)

  const reference =
    typeof o.reference === 'string'
      ? o.reference
      : typeof o.txHash === 'string'
        ? o.txHash
        : typeof o.hash === 'string'
          ? o.hash
          : typeof o.external_id === 'string'
            ? o.external_id
            : undefined

  return /** @type {TransactionRow} */ ({
    id,
    title,
    amount,
    currency,
    direction,
    status,
    occurredAt,
    ...(reference ? { reference } : {}),
  })
}

/**
 * @param {unknown} raw
 * @returns {{ list: unknown[] | null; meta: Record<string, unknown> }}
 */
function extractListAndMeta(raw) {
  if (!raw) return { list: null, meta: {} }
  if (Array.isArray(raw)) return { list: raw, meta: {} }

  if (typeof raw !== 'object') return { list: null, meta: {} }
  const o = /** @type {Record<string, unknown>} */ (raw)

  let list =
    (Array.isArray(o.transactions) && o.transactions) ||
    (Array.isArray(o.items) && o.items) ||
    (Array.isArray(o.history) && o.history) ||
    (Array.isArray(o.rows) && o.rows) ||
    (Array.isArray(o.data) && o.data) ||
    null

  /** @type {Record<string, unknown>} */
  let meta = { ...o }

  if (!list && o.data && typeof o.data === 'object' && !Array.isArray(o.data)) {
    const d = /** @type {Record<string, unknown>} */ (o.data)
    meta = { ...o, ...d }
    list =
      (Array.isArray(d.items) && d.items) ||
      (Array.isArray(d.transactions) && d.transactions) ||
      (Array.isArray(d.records) && d.records) ||
      (Array.isArray(d.data) && d.data) ||
      null
  }

  return { list, meta }
}

/**
 * @param {Record<string, unknown>} meta
 * @param {number} page
 * @param {number} limit
 * @param {number} itemsLen
 */
function extractPagination(meta, page, limit, itemsLen) {
  const pagination =
    meta.pagination && typeof meta.pagination === 'object'
      ? /** @type {Record<string, unknown>} */ (meta.pagination)
      : {}

  const m =
    meta.meta && typeof meta.meta === 'object' ? /** @type {Record<string, unknown>} */ (meta.meta) : {}

  const totalKnown =
    num(meta.total) ??
    num(meta.totalCount) ??
    num(meta.total_count) ??
    num(pagination.total) ??
    num(pagination.total_count) ??
    num(m.total)

  let totalPagesKnown =
    num(pagination.totalPages) ??
    num(pagination.total_pages) ??
    num(pagination.last_page) ??
    num(meta.totalPages) ??
    num(meta.total_pages)

  if (totalKnown != null && limit > 0 && totalPagesKnown == null) {
    totalPagesKnown = Math.max(1, Math.ceil(totalKnown / limit))
  }

  let resolvedTotal = totalKnown ?? 0
  let resolvedTotalPages = totalPagesKnown ?? 1

  if (totalKnown == null) {
    if (itemsLen < limit) {
      resolvedTotalPages = Math.max(1, page)
      resolvedTotal = (page - 1) * limit + itemsLen
    } else {
      resolvedTotalPages = page + 1
      resolvedTotal = page * limit + itemsLen
    }
  }

  const hasNextPage = page < resolvedTotalPages

  return { total: resolvedTotal, totalPages: resolvedTotalPages, hasNextPage }
}

/** @returns {TransactionRow[]} */
function demoTransactionPool() {
  const now = Date.now()
  /** @type {TransactionRow[]} */
  const pool = []
  const templates = [
    ['Inbound · ETH conversion', 'in', 125_430.5],
    ['Withdrawal · Settlement', 'out', -48_200],
    ['Stake rewards', 'in', 3_842.12],
    ['Deposit · Wire prefund', 'in', 500_000],
    ['Exchange · BTC → USD', 'out', -22_180],
    ['Network fee', 'out', -42.18],
    ['OTC settlement', 'in', 89_000],
    ['Custody fee', 'out', -120],
    ['SOL routing', 'in', 12_400],
    ['Stablecoin mint', 'in', 250_000],
    ['Treasury rebalance', 'out', -310_000],
    ['Reward distribution', 'in', 910],
    ['Compliance hold release', 'in', 44_000],
    ['Gas refill', 'out', -380],
    ['Loan repayment', 'out', -62_500],
    ['Yield accrual', 'in', 5_621],
    ['Fx hedge close', 'out', -18_200],
    ['Inbound · BTC', 'in', 203_100],
    ['Outbound · Partner', 'out', -95_000],
    ['Adjust · correction', 'in', 210],
    ['Stake lock', 'out', -10_000],
    ['Unstake unlock', 'in', 10_000],
    ['Listing fee', 'out', -2_500],
    ['Rebate credit', 'in', 640],
  ]

  const statuses = /** @type {const} */ (['completed', 'completed', 'completed', 'pending', 'completed'])

  for (let i = 0; i < templates.length; i++) {
    const [title, dir, amt] = templates[i]
    pool.push({
      id: `demo-${i + 1}`,
      title,
      amount: typeof amt === 'number' ? amt : 0,
      currency: 'USD',
      direction: dir === 'in' ? 'in' : 'out',
      status: /** @type {'completed' | 'pending'} */ (statuses[i % statuses.length]),
      occurredAt: now - (i + 1) * 3.2 * 3600000,
      ...(i % 5 === 0 ? { reference: `ref-${1000 + i}` } : {}),
    })
  }
  return pool
}

/**
 * @param {AbortSignal | undefined} signal
 * @param {{ page?: number; limit?: number }} [params]
 * @returns {Promise<TransactionsPageResult>}
 */
export async function fetchTransactions(signal, params = {}) {
  const page = Math.max(1, Number(params.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 10))
  const rawPath = getTransactionsPath()
  const pathBase = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  try {
    const json = await apiGet(`${pathBase}?${qs.toString()}`, { signal })
    const { list, meta } = extractListAndMeta(json)
    if (!Array.isArray(list)) {
      throw new Error('No transaction list')
    }

    /** @type {TransactionRow[]} */
    const items = []
    for (let i = 0; i < list.length; i++) {
      const row = normalizeTransactionRow(list[i], i)
      if (row) items.push(row)
    }

    const { total, totalPages, hasNextPage } = extractPagination(meta, page, limit, items.length)

    return {
      items,
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      source: 'api',
    }
  } catch {
    /* Paginated mock when API is down or not wired yet — replace with live data via GET + query params. */
    const pool = demoTransactionPool()
    const total = pool.length
    const start = (page - 1) * limit
    const items = pool.slice(start, start + limit)
    const totalPages = Math.max(1, Math.ceil(total / limit))

    return {
      items,
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      source: 'demo',
    }
  }
}
