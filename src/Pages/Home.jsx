/**
 * HOME PAGE (/home)
 *
 * Dashboard: balance card, market flow chart, paginated transaction history.
 * Search this file for "BACKEND INTEGRATION" — four GET endpoints to wire on mount
 * (and re-fetch transactions when txPage or chartRange changes).
 */

import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BalanceSection from '../components/home/BalanceSection.jsx'
import FlowChart from '../components/home/FlowChart.jsx'
import TransactionHistory from '../components/home/TransactionHistory.jsx'
import HomeFooter from '../components/home/HomeFooter.jsx'
import HomeHeader from '../components/home/HomeHeader.jsx'

const SESSION_KEY = 'eleven_user'
const TRANSACTION_PAGE_SIZE = 6

// --- Sample data (edit these values for demos) ---

/**
 * DEMO ONLY — user shown in header.
 * BACKEND: replace with GET /api/auth/me response (or user object from login).
 * Expected shape: { displayName: string, email?: string, avatarUrl?: string }
 */
function readLoggedInUser() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore invalid JSON */
  }
  return { displayName: 'Alexandra Chen', email: 'alexandra.chen@vault.example' }
}

/**
 * DEMO ONLY — balance card data.
 * BACKEND: GET /api/wallet/summary
 * Response: { totalUsd: number, change24hPct: number, currency: 'USD' }
 * Wire to: setBalance(data) — see BACKEND INTEGRATION block in component body
 */
const SAMPLE_BALANCE = {
  totalUsd: 2_847_392.55,
  change24hPct: 1.24,
  currency: 'USD',
}

/**
 * DEMO ONLY — chart series for FlowChart component.
 * BACKEND: GET /api/markets/flow?range=1d|7d|30d
 * Response: { points: [{ label: string, btc: number, eth: number, sol: number }] }
 * Wire to: setChartPoints(data.points) — filter by chartRange state
 */
const SAMPLE_CHART = [
  { label: 'Mar 1', btc: 58200, eth: 2480, sol: 118 },
  { label: 'Mar 5', btc: 59100, eth: 2510, sol: 121 },
  { label: 'Mar 10', btc: 57800, eth: 2450, sol: 116 },
  { label: 'Mar 15', btc: 60200, eth: 2550, sol: 124 },
  { label: 'Mar 20', btc: 61500, eth: 2590, sol: 127 },
  { label: 'Mar 25', btc: 60800, eth: 2575, sol: 125 },
  { label: 'Mar 30', btc: 62100, eth: 2620, sol: 129 },
]

/**
 * DEMO ONLY — transaction table rows.
 * BACKEND: GET /api/wallet/transactions?page={txPage}&limit={TRANSACTION_PAGE_SIZE}
 * Response: {
 *   items: [{ id, title, amount, currency, direction: 'in'|'out', status, occurredAt, reference? }],
 *   total: number, totalPages: number, hasNextPage: boolean
 * }
 * Wire to: setTransactions(data) — re-fetch when txPage changes (onPageChange)
 */
const SAMPLE_TRANSACTIONS = [
  { id: 'tx-1', title: 'Inbound · ETH conversion', amount: 125430.5, currency: 'USD', direction: 'in', status: 'completed', occurredAt: Date.now() - 3600000 },
  { id: 'tx-2', title: 'Withdrawal · Settlement', amount: -48200, currency: 'USD', direction: 'out', status: 'completed', occurredAt: Date.now() - 7200000 },
  { id: 'tx-3', title: 'Stake rewards', amount: 3842.12, currency: 'USD', direction: 'in', status: 'completed', occurredAt: Date.now() - 10800000 },
  { id: 'tx-4', title: 'Deposit · Wire prefund', amount: 500000, currency: 'USD', direction: 'in', status: 'pending', occurredAt: Date.now() - 14400000 },
  { id: 'tx-5', title: 'Exchange · BTC → USD', amount: -22180, currency: 'USD', direction: 'out', status: 'completed', occurredAt: Date.now() - 18000000 },
  { id: 'tx-6', title: 'Network fee', amount: -42.18, currency: 'USD', direction: 'out', status: 'completed', occurredAt: Date.now() - 21600000 },
  { id: 'tx-7', title: 'OTC settlement', amount: 89000, currency: 'USD', direction: 'in', status: 'completed', occurredAt: Date.now() - 25200000 },
  { id: 'tx-8', title: 'Custody fee', amount: -120, currency: 'USD', direction: 'out', status: 'completed', occurredAt: Date.now() - 28800000 },
]

export default function Home() {
  const navigate = useNavigate()
  const [user] = useState(readLoggedInUser)
  const [balance] = useState(SAMPLE_BALANCE)
  const [chartRange, setChartRange] = useState('30d')
  const [txPage, setTxPage] = useState(1)

  // ─── Transaction history state (replace DEMO with API response) ───────────
  // const [txItems, setTxItems] = useState([])
  // const [txTotal, setTxTotal] = useState(0)
  // const [txTotalPages, setTxTotalPages] = useState(1)
  // const [txHasNextPage, setTxHasNextPage] = useState(false)
  // const [txLoading, setTxLoading] = useState(false)

  /*
   * ┌─────────────────────────────────────────────────────────────────
   * │ BACKEND INTEGRATION — Transaction history  ← PUT API CALL HERE
   * ├─────────────────────────────────────────────────────────────────
   * │ File:     src/Pages/Home.jsx  (this file — NOT TransactionHistory.jsx)
   * │ Trigger:  page mount AND whenever txPage changes (user clicks pagination)
   * │ Method:   GET
   * │ URL:      /api/wallet/transactions?page={txPage}&limit={TRANSACTION_PAGE_SIZE}
   * │ Auth:     Authorization: Bearer <accessToken>
   * │
   * │ Response: {
   * │   items: [{ id, title, amount, currency, direction, status, occurredAt, reference? }],
   * │   total: number,
   * │   totalPages: number,
   * │   hasNextPage: boolean
   * │ }
   * │
   * │ Wire to TransactionHistory props at bottom of this file:
   * │   items={data.items}
   * │   loading={txLoading}
   * │   page={txPage}
   * │   pageSize={TRANSACTION_PAGE_SIZE}
   * │   total={data.total}
   * │   totalPages={data.totalPages}
   * │   hasNextPage={data.hasNextPage}
   * │   onPageChange={setTxPage}   ← changing page re-runs this fetch
   * │
   * │ Example:
   * │   useEffect(() => {
   * │     setTxLoading(true)
   * │     fetch(`/api/wallet/transactions?page=${txPage}&limit=${TRANSACTION_PAGE_SIZE}`, {
   * │       headers: { Authorization: `Bearer ${token}` },
   * │     })
   * │       .then(r => r.json())
   * │       .then(data => {
   * │         setTxItems(data.items)
   * │         setTxTotal(data.total)
   * │         setTxTotalPages(data.totalPages)
   * │         setTxHasNextPage(data.hasNextPage)
   * │       })
   * │       .finally(() => setTxLoading(false))
   * │   }, [txPage])
   * │
   * │ DEMO ONLY below: SAMPLE_TRANSACTIONS + txSlice useMemo — delete when wired
   * └─────────────────────────────────────────────────────────────────
   */

  // DEMO ONLY — client-side range filter. BACKEND: pass chartRange as ?range= query param instead.
  const chartPoints = useMemo(() => {
    if (chartRange === '7d') return SAMPLE_CHART.slice(-5)
    if (chartRange === '1d') return SAMPLE_CHART.slice(-2)
    return SAMPLE_CHART
  }, [chartRange])

  // DEMO ONLY — client-side pagination. BACKEND: server returns paginated items + totalPages.
  const txSlice = useMemo(() => {
    const total = SAMPLE_TRANSACTIONS.length
    const start = (txPage - 1) * TRANSACTION_PAGE_SIZE
    const items = SAMPLE_TRANSACTIONS.slice(start, start + TRANSACTION_PAGE_SIZE)
    const totalPages = Math.max(1, Math.ceil(total / TRANSACTION_PAGE_SIZE))
    return { items, total, totalPages, hasNextPage: txPage < totalPages }
  }, [txPage])

  const onLogout = () => {
    /*
     * BACKEND INTEGRATION — logout (optional)
     * Method: POST  URL: /api/auth/logout  Auth: Bearer token
     * Then clear stored token and redirect to /login
     */
    sessionStorage.removeItem(SESSION_KEY)
    navigate('/login', { replace: true })
  }

  /*
   * ┌─────────────────────────────────────────────────────────────────
   * │ BACKEND INTEGRATION — Dashboard data (4 endpoints)
   * ├─────────────────────────────────────────────────────────────────
   * │ Trigger:  page mount + when txPage or chartRange changes
   * │ Auth:     Authorization: Bearer <accessToken>
   * │
   * │ 1) GET /api/auth/me
   * │    Response: { displayName, email?, avatarUrl? }
   * │    → setUser(data)
   * │
   * │ 2) GET /api/wallet/summary
   * │    Response: { totalUsd, change24hPct, currency }
   * │    → setBalance(data)
   * │
   * │ 3) GET /api/markets/flow?range={chartRange}   // '1d' | '7d' | '30d'
   * │    Response: { points: [{ label, btc, eth, sol }] }
   * │    → setChartPoints(data.points)
   * │
   * │ 4) GET /api/wallet/transactions?page={txPage}&limit={TRANSACTION_PAGE_SIZE}
   * │    Response: { items, total, totalPages, hasNextPage }
   * │    → pass to TransactionHistory (replace txSlice useMemo)
   * │
   * │ Example skeleton:
   * │   useEffect(() => {
   * │     const headers = { Authorization: `Bearer ${token}` }
   * │     fetch('/api/wallet/summary', { headers }).then(r => r.json()).then(setBalance)
   * │     fetch(`/api/markets/flow?range=${chartRange}`, { headers }).then(...)
   * │     fetch(`/api/wallet/transactions?page=${txPage}&limit=${TRANSACTION_PAGE_SIZE}`, { headers }).then(...)
   * │   }, [txPage, chartRange])
   * │
   * │ DEMO ONLY below: SAMPLE_* constants + useMemo slicing — remove when wired
   * └─────────────────────────────────────────────────────────────────
   */

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-ink">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(201,171,122,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.014)_1px,transparent_1px)] bg-size-[80px_80px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,6,8,0.88)_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <HomeHeader displayName={user.displayName} avatarUrl={user.avatarUrl} onLogout={onLogout} />

        <main className="w-full flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-10 xl:px-14">
          <BalanceSection totalUsd={balance.totalUsd} change24hPct={balance.change24hPct} currency={balance.currency} />

          <div className="mt-10 sm:mt-12">
            <FlowChart points={chartPoints} range={chartRange} onRangeChange={setChartRange} />
          </div>

          <div className="mt-10 sm:mt-12">
            {/*
              TransactionHistory is display-only.
              Backend developer: add GET /api/wallet/transactions in Home.jsx
              (search "BACKEND INTEGRATION — Transaction history" above).
            */}
            <TransactionHistory
              items={txSlice.items}
              loading={false}
              page={txPage}
              pageSize={TRANSACTION_PAGE_SIZE}
              total={txSlice.total}
              totalPages={txSlice.totalPages}
              hasNextPage={txSlice.hasNextPage}
              onPageChange={setTxPage}
            />
          </div>
        </main>

        <HomeFooter />
      </div>
    </div>
  )
}
