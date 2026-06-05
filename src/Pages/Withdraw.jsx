/**
 * WITHDRAW PAGE (/withdraw)
 *
 * Form: destination wallet address + gas fee percentage.
 * Search "BACKEND INTEGRATION" in onWithdraw for POST /api/wallet/withdraw.
 */

import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeFooter from '../components/home/HomeFooter.jsx'
import HomeHeader from '../components/home/HomeHeader.jsx'
import axios from 'axios'


const SESSION_KEY = 'eleven_user'
/** DEMO ONLY — total gas fee in USD. BACKEND: may come from GET /api/wallet/withdraw/fees or in POST response */
const GAS_FEE_TOTAL = 5800
const FEE_OPTIONS = [25, 50, 75, 100]

function readLoggedInUser() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return { displayName: 'Client' }
}

const fmtUsd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export default function Withdraw() {
  const navigate = useNavigate()
  const [user] = useState(readLoggedInUser)

  // --- Form state ---
  const [walletAddress, setWalletAddress] = useState('')
  const [selectedPct, setSelectedPct] = useState(null)
  const [error, setError] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertFeeAmount, setAlertFeeAmount] = useState(0)
  const [requestId, setRequestId] = useState(null)

  const feeAmount = useMemo(() => {
    if (selectedPct == null) return 0
    return (GAS_FEE_TOTAL * selectedPct) / 100
  }, [selectedPct])

  const onLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    navigate('/login', { replace: true })
  }

  const onWithdraw = () => {
    setError('')
    setRequestId(null)

    // --- Validation ---
    if (!walletAddress.trim()) {
      setError('Please enter a wallet address.')
      return
    }
    if (selectedPct == null) {
      setError('Please choose a gas fee percentage.')
      return
    }

    // --- Payload sent to backend (see BACKEND INTEGRATION below) ---
    const withdrawPayload = {
      walletAddress: walletAddress.trim(),
      gasFeePercent: selectedPct,
      gasFeeTotalUsd: GAS_FEE_TOTAL,
    }

    /*
     * ┌─────────────────────────────────────────────────────────────────
     * │ BACKEND INTEGRATION — Submit withdrawal request
     * ├─────────────────────────────────────────────────────────────────
     * │ Trigger:  Withdraw button click (onWithdraw)
     * │ Method:   POST
     * │ URL:      /api/wallet/withdraw
     * │ Auth:     Authorization: Bearer <accessToken>
     * │ Body:     withdrawPayload  →  { walletAddress, gasFeePercent, gasFeeTotalUsd }
     * │
     * │ Success response (example):
     * │   { requestId: string, requiredGasFeeUsd: number, status: 'pending_gas' }
     * │
     * │ On success:
     * │   setAlertFeeAmount(data.requiredGasFeeUsd)
     * │   setRequestId(data.requestId)
     * │   setShowAlert(true)   // modal prompts user to fund gas fee
     * │
     * │ On error: setError(message from response)
     * │
     * │ Related page: /deposit/fund-gas-fee (GET /api/wallet/gas-fee-address)
     * │
     * │ DEMO ONLY below — computes fee locally, no server call
     * └─────────────────────────────────────────────────────────────────
     */
    setAlertFeeAmount((GAS_FEE_TOTAL * selectedPct) / 100)
    setRequestId(`wd-demo-${Date.now()}`)
    setShowAlert(true)
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
          navLinks={[{ to: '/home', label: 'Overview' }]}
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
              <div className="relative space-y-5">
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
                  className="w-full rounded-xl border border-transparent bg-[linear-gradient(180deg,var(--color-aurum)_0%,var(--color-aurum-muted)_100%)] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_16px_46px_-18px_rgba(201,171,122,0.4)] transition hover:brightness-[1.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurum/70"
                >
                  Withdraw
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
            {requestId ? <p className="mt-2 text-[12px] text-mist/80">Request ID: {requestId}</p> : null}
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setShowAlert(false)} className="rounded-lg border border-white/15 bg-white/4 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-mist transition hover:bg-white/8">
                Close
              </button>
              <button type="button" onClick={() => { setShowAlert(false); navigate('/deposit/fund-gas-fee') }} className="rounded-lg border border-transparent bg-[linear-gradient(180deg,var(--color-aurum)_0%,var(--color-aurum-muted)_100%)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition hover:brightness-[1.08]">
                Fund Gas Fees
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
