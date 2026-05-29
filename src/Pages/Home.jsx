/**
 * Main dashboard — loads all data from src/lib/payloads/*.js
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BalanceSection from '../components/home/BalanceSection.jsx'
import FlowChart from '../components/home/FlowChart.jsx'
import TransactionHistory from '../components/home/TransactionHistory.jsx'
import HomeFooter from '../components/home/HomeFooter.jsx'
import HomeHeader from '../components/home/HomeHeader.jsx'
import {
  buildMarketFlowSeries,
  loadMarketFlowSeries,
  selectFlowWindow,
} from '../lib/payloads/marketFlow.js'
import { loadTransactions } from '../lib/payloads/transactions.js'
import { WALLET_SUMMARY, loadWalletSummary } from '../lib/payloads/wallet.js'
import { loadSessionUser } from '../lib/payloads/user.js'
import { clearSession, clearWalletSummaryOverride, getUserSnapshot, peekWalletSummaryOverride } from '../lib/session.js'

const TRANSACTION_PAGE_SIZE = 6

export default function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => getUserSnapshot() || { displayName: 'Client' })
  const [balance, setBalance] = useState(() => ({ ...WALLET_SUMMARY }))
  const [flowPoints, setFlowPoints] = useState(() => buildMarketFlowSeries())
  const [chartRange, setChartRange] = useState(() => /** @type {'1d' | '7d' | '30d'} */ ('30d'))
  const [transactions, setTransactions] = useState(() => [])
  const [txPage, setTxPage] = useState(1)
  const [txTotal, setTxTotal] = useState(0)
  const [txTotalPages, setTxTotalPages] = useState(1)
  const [txHasNext, setTxHasNext] = useState(false)
  const [transactionsLoading, setTransactionsLoading] = useState(true)

  const chartPoints = useMemo(
    () => selectFlowWindow(flowPoints, chartRange),
    [flowPoints, chartRange],
  )

  useEffect(() => {
    const ac = new AbortController()

    const run = async () => {
      try {
        const u = await loadSessionUser(ac.signal)
        setUser(u)
      } catch {
        const snap = getUserSnapshot()
        if (snap) setUser(snap)
      }

      try {
        const bal = await loadWalletSummary(ac.signal)
        if (ac.signal.aborted) return
        const o = peekWalletSummaryOverride()
        if (o) {
          clearWalletSummaryOverride()
          setBalance({
            ...bal,
            totalUsd: o.totalUsd,
            change24hPct: o.change24hPct ?? bal.change24hPct,
            currency: typeof o.currency === 'string' ? o.currency : bal.currency,
          })
        } else {
          setBalance(bal)
        }
      } catch {
        if (!ac.signal.aborted) setBalance({ ...WALLET_SUMMARY })
      }

      try {
        const flow = await loadMarketFlowSeries(ac.signal)
        setFlowPoints(flow.points)
      } catch {
        setFlowPoints(buildMarketFlowSeries())
      }
    }

    run()
    return () => ac.abort()
  }, [])

  useEffect(() => {
    const ac = new AbortController()
    const run = async () => {
      setTransactionsLoading(true)
      try {
        const tx = await loadTransactions(ac.signal, { page: txPage, limit: TRANSACTION_PAGE_SIZE })
        if (ac.signal.aborted) return
        setTransactions(tx.items)
        setTxTotal(tx.total)
        setTxTotalPages(tx.totalPages)
        setTxHasNext(tx.hasNextPage)
      } finally {
        if (!ac.signal.aborted) setTransactionsLoading(false)
      }
    }
    run()
    return () => ac.abort()
  }, [txPage])

  const onLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

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
            <TransactionHistory
              items={transactions}
              loading={transactionsLoading}
              page={txPage}
              pageSize={TRANSACTION_PAGE_SIZE}
              total={txTotal}
              totalPages={txTotalPages}
              hasNextPage={txHasNext}
              onPageChange={setTxPage}
            />
          </div>
        </main>

        <HomeFooter />
      </div>
    </div>
  )
}
