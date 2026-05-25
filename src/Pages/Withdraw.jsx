/**
 * Withdraw screen — user enters destination wallet and gas fee %.
 * API: POST /wallet/withdraw on submit (submitWithdrawRequest).
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeFooter from '../components/home/HomeFooter.jsx'
import HomeHeader from '../components/home/HomeHeader.jsx'
import { OVERVIEW_NAV_LINKS } from '../lib/appNav.js'
import { ApiError } from '../lib/api/client.js'
import { fetchSessionUser } from '../lib/api/user.js'
import { submitWithdrawRequest } from '../lib/api/withdraw.js'
import { clearSession, getUserSnapshot } from '../lib/session.js'

const GAS_FEE_TOTAL = 5800
const FEE_OPTIONS = [25, 50, 75, 100]

const fmtUsd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export default function Withdraw() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => getUserSnapshot() || { displayName: 'Client' })
  const [walletAddress, setWalletAddress] = useState('')
  const [selectedPct, setSelectedPct] = useState(/** @type {number | null} */ (null))
  const [error, setError] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [alertFeeAmount, setAlertFeeAmount] = useState(0)
  const [requestId, setRequestId] = useState(/** @type {string | null} */ (null))
  const [feeSource, setFeeSource] = useState(/** @type {'api' | 'fallback' | null} */ (null))

  useEffect(() => {
    const ac = new AbortController()
    ;(async () => {
      try {
        // API: GET /auth/me
        const u = await fetchSessionUser(ac.signal)
        if (!ac.signal.aborted) setUser(u)
      } catch {
        const snap = getUserSnapshot()
        if (snap && !ac.signal.aborted) setUser(snap)
      }
    })()
    return () => ac.abort()
  }, [])

  const onLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  const feeAmount = useMemo(() => {
    if (selectedPct == null) return 0
    return (GAS_FEE_TOTAL * selectedPct) / 100
  }, [selectedPct])

  const selectedAmount = useMemo(() => {
    if (selectedPct == null) return 0
    return (GAS_FEE_TOTAL * selectedPct) / 100
  }, [selectedPct])

  const onWithdraw = async () => {
    setError('')
    setRequestId(null)
    setFeeSource(null)
    if (!walletAddress.trim()) {
      setError('Please enter a wallet address.')
      return
    }
    if (selectedPct == null) {
      setError('Please choose a gas fee percentage.')
      return
    }

    const ac = new AbortController()
    setSubmitting(true)
    try {
      // API: POST /wallet/withdraw — body: { walletAddress, gasFeePercent, gasFeeTotalUsd }
      const res = await submitWithdrawRequest(ac.signal, {
        walletAddress: walletAddress.trim(),
        gasFeePercent: selectedPct,
        gasFeeTotalUsd: GAS_FEE_TOTAL,
      })
      setAlertFeeAmount(res.requiredGasFeeUsd)
      setRequestId(res.requestId)
      setFeeSource(res.source)
      setShowAlert(true)
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message)
      } else {
        setError('Unable to process withdrawal request right now.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-ink">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(201,171,122,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.014)_1px,transparent_1px)] bg-size-[80px_80px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,6,8,0.88)_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <HomeHeader
          displayName={user.displayName}
          avatarUrl={user.avatarUrl}
          onLogout={onLogout}
          navLinks={OVERVIEW_NAV_LINKS}
          showActions={false}
        />

        <main className="w-full flex-1 px-4 pb-14 pt-8 sm:px-6 sm:pt-10 lg:px-10 lg:pt-12 xl:px-14">
          <header className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-aurum/90">Treasury</p>
            <h1 className="mt-2 font-serif text-[2rem] font-medium tracking-tight text-pearl sm:text-[2.35rem]">Withdraw</h1>
            <p className="mx-auto mt-3 max-w-xl text-[14px] font-light leading-relaxed text-mist/90">
              Submit your destination wallet and choose the gas fee share required to proceed.
            </p>
            <div className="mx-auto mt-6 h-px w-full max-w-sm bg-[linear-gradient(90deg,transparent,rgba(201,171,122,0.45),transparent)]" />
          </header>

          <section className="mx-auto flex min-h-[54vh] max-w-xl items-center justify-center">
            <div className="relative w-full max-w-md overflow-hidden rounded-[1.35rem] border border-white/12 bg-slate-elevated/45 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_45px_110px_-55px_rgba(0,0,0,0.92),0_0_90px_-42px_rgba(201,171,122,0.2)] backdrop-blur-2xl sm:p-8">
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(201,171,122,0.2),transparent_68%)] blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-24 -left-16 h-44 w-44 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.13),transparent_72%)] blur-3xl"
                aria-hidden
              />

              <div className="relative space-y-5">
                <div className="space-y-2 pb-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-aurum/85">Withdrawal Request</p>
                  <h2 className="font-serif text-[1.45rem] tracking-tight text-pearl sm:text-[1.65rem]">Secure transfer setup</h2>
                  <p className="max-w-sm text-[13px] leading-relaxed text-mist/80">
                    Enter your destination address and choose your gas fee allocation before continuing.
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="withdraw-wallet-address" className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-mist">
                    Wallet address
                  </label>
                  <input
                    id="withdraw-wallet-address"
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter destination wallet address"
                    className="w-full rounded-xl border border-white/12 bg-ink/55 px-4 py-3.5 text-[15px] tracking-wide text-pearl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition placeholder:text-mist/40 focus:border-aurum/50 focus:ring-2 focus:ring-aurum/18"
                  />
                </div>

                <div className="space-y-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-mist">Gas fee allocation</p>
                  <div className="grid grid-cols-2 gap-3">
                    {FEE_OPTIONS.map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setSelectedPct(pct)}
                        className={`rounded-xl border px-4 py-3.5 text-center transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurum/45 ${
                          selectedPct === pct
                            ? 'border-aurum/45 bg-aurum/12 text-pearl shadow-[0_0_32px_-14px_rgba(201,171,122,0.35)]'
                            : 'border-white/12 bg-white/3 text-mist hover:border-aurum/28 hover:bg-white/5 hover:text-pearl'
                        }`}
                      >
                        <span className="block font-[Arial,Helvetica,sans-serif] text-[1.05rem] font-semibold text-pearl">{pct}%</span>
                        <span className="mt-1 block text-[10px] uppercase tracking-[0.15em] text-mist/75">
                          {fmtUsd.format((GAS_FEE_TOTAL * pct) / 100)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {error ? (
                  <p className="rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3 text-[13px] text-red-200/95">{error}</p>
                ) : null}

                <button
                  type="button"
                  onClick={onWithdraw}
                  disabled={submitting}
                  className="w-full rounded-xl border border-transparent bg-[linear-gradient(180deg,var(--color-aurum)_0%,var(--color-aurum-muted)_100%)] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_16px_46px_-18px_rgba(201,171,122,0.4)] transition hover:brightness-[1.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurum/70 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </div>
          </section>
        </main>

        <HomeFooter />
      </div>

      {showAlert ? (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/12 bg-slate-elevated/95 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_36px_90px_-46px_rgba(0,0,0,0.95)] backdrop-blur-2xl">
            <p className="text-sm leading-relaxed text-pearl">
              To withdraw pay the required gas fee of{' '}
              <span className="font-semibold text-aurum">{fmtUsd.format(alertFeeAmount || feeAmount)}</span>.
            </p>
            {feeSource ? (
              <p className="mt-2 text-[12px] text-mist/80">
                Fee source: {feeSource === 'api' ? 'Live backend' : 'Local fallback'}
                {requestId ? ` · Request ID: ${requestId}` : ''}
              </p>
            ) : null}
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAlert(false)}
                className="rounded-lg border border-white/15 bg-white/4 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-mist transition hover:bg-white/8"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAlert(false)
                  // Route users directly to the dedicated gas-fee funding screen.
                  navigate('/deposit/fund-gas-fee')
                }}
                className="rounded-lg border border-transparent bg-[linear-gradient(180deg,var(--color-aurum)_0%,var(--color-aurum-muted)_100%)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition hover:brightness-[1.08]"
              >
                Fund Gas Fees
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
