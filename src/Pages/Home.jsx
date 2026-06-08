/**
 * HOME PAGE (/home)
 *
 * Dashboard: balance card, market flow chart, paginated transaction history.
 * Backend developer: search "BACKEND INTEGRATION" in this file.
 */

import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BalanceSection from '../components/home/BalanceSection.jsx'
import FlowChart from '../components/home/FlowChart.jsx'
import TransactionHistory from '../components/home/TransactionHistory.jsx'
import HomeFooter from '../components/home/HomeFooter.jsx'
import HomeHeader from '../components/home/HomeHeader.jsx'
import { getAccessToken, clearTokens } from '../api/auth.js'
import axios from 'axios'
import { useEffect } from 'react'

const TRANSACTION_PAGE_SIZE = 6

/** Static UI placeholders — replace with backend data via state setters below */
const PLACEHOLDER_USER = { displayName: 'Alexandra Chen', email: 'alexandra.chen@vault.example' }
const PLACEHOLDER_BALANCE = { totalUsd: 2_847_392.55, change24hPct: 1.24, currency: 'USD' }
const PLACEHOLDER_CHART = [
  { label: 'Mar 1', btc: 58200, eth: 2480, sol: 118 },
  { label: 'Mar 5', btc: 59100, eth: 2510, sol: 121 },
  { label: 'Mar 10', btc: 57800, eth: 2450, sol: 116 },
  { label: 'Mar 15', btc: 60200, eth: 2550, sol: 124 },
  { label: 'Mar 20', btc: 61500, eth: 2590, sol: 127 },
  { label: 'Mar 25', btc: 60800, eth: 2575, sol: 125 },
  { label: 'Mar 30', btc: 62100, eth: 2620, sol: 129 },
]
const PLACEHOLDER_TRANSACTIONS = [
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

  useEffect(() => {
    if (!getAccessToken()) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const [user] = useState(PLACEHOLDER_USER)
  const [balance, setBalance] = useState(null)
  const [balanceLoading, setBalanceLoading] = useState(false)

  const [chartRange, setChartRange] = useState('30d')
  const [txPage, setTxPage] = useState(1)

  const [txItems, setTxItems] = useState([])
  const [txTotal, setTxTotal] = useState(0)
  const [txTotalPages, setTxTotalPages] = useState(1)
  const [txHasNextPage, setTxHasNextPage] = useState(false)
  const [txLoading, setTxLoading] = useState(false)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setBalanceLoading(true)

        const token = getAccessToken()

        const response = await axios.get(
          'https://api.elevenca.org/elevenCA/client_availableBalance',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        console.log('Balance API:', response.data)

      const data = response.data

const mappedBalance = {
  totalUsd: data.available_balance ?? 0,
  change24hPct: 0,
  currency: 'USD',
}

console.log("Mapped Balance:", mappedBalance)

setBalance(mappedBalance)

        setBalance(mappedBalance)
      } catch (error) {
        console.error('Balance Error:', error.response?.data || error.message)
      } finally {
        setBalanceLoading(false)
      }
    }

    fetchBalance()
  }, [])


useEffect(() => {
  const fetchTransactions = async () => {
    try {
      setTxLoading(true)

      const token = getAccessToken()

      const response = await axios.get(
        'https://api.elevenca.org/elevenCA/transaction/history',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('Transaction History:', response.data)

const rawTransactions = response.data?.data || response.data || []

const mappedTransactions = Array.isArray(rawTransactions)
  ? rawTransactions.map(tx => ({
      id: tx.id,
      title: tx.description,          // backend → UI fix
      amount: tx.amount,
      currency: 'USD',                // backend does not provide it
      direction: tx.direction,
      status: tx.status,
      occurredAt: tx.createdAt,       // backend → UI fix
    }))
  : []

setTxItems(mappedTransactions)

      const total = transactions.length

      setTxTotal(total)

      const totalPages = Math.max(
        1,
        Math.ceil(total / TRANSACTION_PAGE_SIZE)
      )

      setTxTotalPages(totalPages)

      setTxHasNextPage(txPage < totalPages)
    } catch (error) {
      console.error('Transaction History Error:', error)
    } finally {
      setTxLoading(false)
    }
  }

  fetchTransactions()
}, [txPage])

  // Static UI placeholder — remove when backend chart data is wired
  const chartPoints = useMemo(() => {
    if (chartRange === '7d') return PLACEHOLDER_CHART.slice(-5)
    if (chartRange === '1d') return PLACEHOLDER_CHART.slice(-2)
    return PLACEHOLDER_CHART
  }, [chartRange])

  // Static UI placeholder — remove when backend pagination is wired
  // const txSlice = useMemo(() => {
  //   const total = PLACEHOLDER_TRANSACTIONS.length
  //   const start = (txPage - 1) * TRANSACTION_PAGE_SIZE
  //   const items = PLACEHOLDER_TRANSACTIONS.slice(start, start + TRANSACTION_PAGE_SIZE)
  //   const totalPages = Math.max(1, Math.ceil(total / TRANSACTION_PAGE_SIZE))
  //   return { items, total, totalPages, hasNextPage: txPage < totalPages }
  // }, [txPage])

 const onLogout = () => {
  clearTokens()
  sessionStorage.clear() // optional safety
  navigate('/login', { replace: true })
}

  /*
   * ┌─────────────────────────────────────────────────────────────────
   * │ BACKEND INTEGRATION — Fetch Dashboard Data
   * ├─────────────────────────────────────────────────────────────────
   * │ Trigger:  page mount (+ re-fetch when txPage or chartRange changes)
   * │
   * │ Connect your backend fetches here:
   * │
   * │ 1) User / session info for header
   * │    → setUser(mappedData)
   * │
   * │ 2) Wallet balance for BalanceSection
   * │    → setBalance(mappedData)
   * │
   * │ 3) Chart data for FlowChart (respect chartRange state)
   * │    → set chart points state (replace chartPoints useMemo)
   * │
   * │ 4) Transaction history — see dedicated block above
   * │
   * │ Read stored tokens from src/api/auth.js if required by your backend.
   * │ Remove PLACEHOLDER_* constants when wired.
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
         {balanceLoading || !balance ? (
  <p className="text-white">Loading balance...</p>
) : (
  <BalanceSection
    totalUsd={balance.totalUsd}
    change24hPct={balance.change24hPct}
    currency={balance.currency}
  />
)}
          <div className="mt-10 sm:mt-12">
            <FlowChart points={chartPoints} range={chartRange} onRangeChange={setChartRange} />
          </div>

          <div className="mt-10 sm:mt-12">
            {/*
              TransactionHistory is display-only (receives data via props).
              Backend developer: wire transaction fetch in Home.jsx
              (search "BACKEND INTEGRATION — Fetch Transaction History").
            */}
           <TransactionHistory
  items={txItems}
  loading={txLoading}
  page={txPage}
  pageSize={TRANSACTION_PAGE_SIZE}
  total={txTotal}
  totalPages={txTotalPages}
  hasNextPage={txHasNextPage}
  onPageChange={setTxPage}
/>
          </div>
        </main>

        <HomeFooter />
      </div>
    </div>
  )
}
