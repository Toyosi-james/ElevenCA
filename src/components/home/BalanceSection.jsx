/**
 * Home balance card — data from src/lib/payloads/wallet.js
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'

const fmtUsd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const IconDeposit = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
  </svg>
)

const IconWithdraw = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d="M12 5v10m0 0l-4-4m4 4l4-4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 19h14" strokeLinecap="round" />
  </svg>
)

const IconExchange = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d="M7 10h13l-3-3m3 3l-3 3M17 14H4l3 3m-3-3l3-3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** @param {{ totalUsd: number; change24hPct: number | null; currency: string }} props */
export default function BalanceSection({ totalUsd, change24hPct, currency }) {
  const navigate = useNavigate()

  const pos = change24hPct != null && change24hPct >= 0

  const actionBtn =
    'relative flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition focus-visible:outline-2 focus-visible:outline-offset-2 sm:min-h-[3.25rem] sm:text-[10px]'

  return (
    <section className="relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-slate-elevated/45 p-px shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_50px_120px_-50px_rgba(0,0,0,0.82),0_0_120px_-48px_rgba(201,171,122,0.12)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(201,171,122,0.55),transparent)] opacity-80" aria-hidden />
      <div className="pointer-events-none absolute left-0 top-0 h-32 w-px bg-[linear-gradient(180deg,rgba(201,171,122,0.5),transparent)] opacity-60" aria-hidden />

      <div className="relative overflow-hidden rounded-[calc(1.35rem-1px)] bg-[linear-gradient(155deg,rgba(255,255,255,0.055)_0%,transparent_38%,rgba(201,171,122,0.04)_100%)] px-6 py-10 sm:px-11 sm:py-12">
        <div
          className="pointer-events-none absolute -right-28 -top-32 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(201,171,122,0.16),transparent_66%)] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-36 -left-28 h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(91,156,255,0.1),transparent_68%)] blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-11 lg:flex-row lg:items-stretch lg:justify-between lg:gap-14">
          <div className="lg:flex-1 lg:border-r lg:border-white/8 lg:pr-14">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-mist/90">Total portfolio value</p>
            <p className="mt-5 font-[Arial,Helvetica,sans-serif] text-[2.75rem] font-medium leading-[0.95] tracking-tight text-pearl sm:text-[3.25rem] lg:text-[3.5rem]">
              {currency === 'USD' ? fmtUsd.format(totalUsd) : `${totalUsd.toLocaleString()} ${currency}`}
            </p>
            {change24hPct != null ? (
              <div className="mt-6">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-medium tracking-wide shadow-[0_0_24px_-8px_rgba(0,0,0,0.5)] ${
                    pos
                      ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-50/95'
                      : 'border-red-400/35 bg-red-500/10 text-red-50/95'
                  }`}
                >
                  <span className="text-[10px] opacity-90" aria-hidden>
                    {pos ? '▲' : '▼'}
                  </span>
                  {pos ? '+' : ''}
                  {change24hPct.toFixed(2)}%
                  <span className="font-normal text-white/30">24h</span>
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col justify-end gap-3.5 lg:w-[min(100%,40rem)] xl:w-[min(100%,42rem)] lg:shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-mist/75 lg:text-right">Move funds</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => navigate('/deposit')}
                className={`${actionBtn} border border-transparent bg-[linear-gradient(180deg,var(--color-aurum)_0%,var(--color-aurum-muted)_100%)] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_12px_40px_-16px_rgba(201,171,122,0.35)] hover:brightness-[1.08] focus-visible:outline-aurum/70`}
              >
                <IconDeposit />
                Deposit
              </button>
              <button
                type="button"
                onClick={() => navigate('/withdraw')}
                className={`${actionBtn} border border-white/14 bg-white/3 text-frost shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-white/26 hover:bg-white/6 focus-visible:outline-white/25`}
              >
                <IconWithdraw />
                Withdraw
              </button>
              <button
                type="button"
                onClick={() => navigate('/exchange')}
                className={`${actionBtn} border border-cyan-400/35 bg-[linear-gradient(180deg,rgba(34,211,238,0.12)_0%,rgba(6,182,212,0.04)_100%)] text-cyan-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_32px_-12px_rgba(34,211,238,0.35)] hover:border-cyan-300/50 hover:bg-[linear-gradient(180deg,rgba(34,211,238,0.18)_0%,rgba(6,182,212,0.07)_100%)] focus-visible:outline-cyan-400/45`}
              >
                <IconExchange />
                Exchange
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
