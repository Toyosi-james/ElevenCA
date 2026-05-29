/**
 * Transaction history rows for the Home dashboard (paginated in loadTransactions).
 */

/** @typedef {'completed' | 'pending' | 'failed'} TxStatus */
/** @typedef {{
 *   id: string
 *   title: string
 *   amount: number
 *   currency: string
 *   direction: 'in' | 'out'
 *   status: TxStatus
 *   occurredAt: number
 *   reference?: string
 * }} TransactionRow */

const now = Date.now()
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

/** @type {TransactionRow[]} */
export const TRANSACTIONS = templates.map(([title, dir, amt], i) => ({
  id: `tx-${i + 1}`,
  title,
  amount: typeof amt === 'number' ? amt : 0,
  currency: 'USD',
  direction: dir === 'in' ? 'in' : 'out',
  status: /** @type {TxStatus} */ (statuses[i % statuses.length]),
  occurredAt: now - (i + 1) * 3.2 * 3600000,
  ...(i % 5 === 0 ? { reference: `ref-${1000 + i}` } : {}),
}))

/**
 * @param {AbortSignal | undefined} _signal
 * @param {{ page?: number; limit?: number }} [params]
 */
export async function loadTransactions(_signal, params = {}) {
  const page = Math.max(1, Number(params.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 10))
  const total = TRANSACTIONS.length
  const start = (page - 1) * limit
  const items = TRANSACTIONS.slice(start, start + limit)
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return {
    items,
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
  }
}
