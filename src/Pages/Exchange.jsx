import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeFooter from '../components/home/HomeFooter.jsx'
import HomeHeader from '../components/home/HomeHeader.jsx'
import { EXCHANGE_HEADER_NAV_LINKS } from '../lib/appNav.js'
import { ApiError } from '../lib/api/client.js'
import { computeMockExchangeQuote, executeExchange, fetchExchangeQuote, mockUsdUnitPrice } from '../lib/api/exchange.js'
import { fetchSessionUser } from '../lib/api/user.js'
import { fetchWalletSummary, mockWalletSummary } from '../lib/api/wallet.js'
import { clearSession, getUserSnapshot, persistWalletSummaryOverride } from '../lib/session.js'

/** @typedef {{ id: string; label: string; symbol: string; accent: string; glow: string }} ExchangeAsset */

/** @type {ExchangeAsset[]} */
const ASSETS = [
  { id: 'BTC', label: 'Bitcoin', symbol: 'BTC', accent: 'from-orange-400/[0.35] to-orange-600/[0.08]', glow: 'shadow-[0_0_24px_-6px_rgba(247,147,26,0.45)]' },
  { id: 'XRP', label: 'XRP', symbol: 'XRP', accent: 'from-slate-300/[0.25] to-sky-500/[0.12]', glow: 'shadow-[0_0_24px_-6px_rgba(56,189,248,0.35)]' },
  { id: 'USDT', label: 'Tether', symbol: 'USDT', accent: 'from-emerald-400/[0.3] to-teal-700/[0.1]', glow: 'shadow-[0_0_24px_-6px_rgba(52,211,153,0.35)]' },
  { id: 'ETH', label: 'Ethereum', symbol: 'ETH', accent: 'from-indigo-400/[0.32] to-violet-700/[0.1]', glow: 'shadow-[0_0_24px_-6px_rgba(139,92,246,0.38)]' },
  { id: 'SOL', label: 'Solana', symbol: 'SOL', accent: 'from-fuchsia-400/[0.28] to-purple-900/[0.15]', glow: 'shadow-[0_0_24px_-6px_rgba(217,70,239,0.32)]' },
]

/** @param {{ asset: ExchangeAsset; size?: 'sm' | 'md' }} props */
function CoinBadge({ asset, size = 'md' }) {
  const sz = size === 'sm' ? 'h-9 w-9 text-[10px]' : 'h-11 w-11 text-[11px]'
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br ${asset.accent} font-semibold uppercase tracking-tight text-pearl/95 ${asset.glow} ${sz}`}
      aria-hidden
    >
      {asset.symbol}
    </div>
  )
}

/**
 * @param {{
 *   label: string
 *   value: string
 *   onChange: (id: string) => void
 *   open: boolean
 *   onOpenChange: (v: boolean) => void
 * }} props
 */
function CoinDropdown({ label, value, onChange, open, onOpenChange }) {
  const rootRef = useRef(/** @type {HTMLDivElement | null} */ (null))
  const selected = ASSETS.find((a) => a.id === value) ?? ASSETS[0]

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (rootRef.current && !rootRef.current.contains(/** @type {Node} */ (e.target))) onOpenChange(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open, onOpenChange])

  return (
    <div ref={rootRef} className={`relative ${open ? 'z-80' : 'z-1'}`}>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-mist/85">{label}</p>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => onOpenChange(!open)}
        className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-[linear-gradient(165deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_50%,rgba(0,0,0,0.05)_100%)] px-4 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-aurum/30 hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurum/45 sm:px-5 sm:py-5"
      >
        <CoinBadge asset={selected} />
        <div className="min-w-0 flex-1">
          <p className="font-serif text-lg font-medium tracking-tight text-pearl sm:text-xl">{selected.label}</p>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.18em] text-mist/75">{selected.symbol}</p>
        </div>
        <svg className={`h-5 w-5 shrink-0 text-mist/60 transition ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <ul
          role="listbox"
          className="exchange-coin-scroll absolute left-0 right-0 top-[calc(100%+10px)] z-90 max-h-[min(22rem,52vh)] overflow-auto rounded-2xl border border-white/12 bg-ink/95 py-2 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85),0_0_0_1px_rgba(201,171,122,0.12)] backdrop-blur-2xl"
        >
          {ASSETS.map((a) => (
            <li key={a.id} role="option" aria-selected={a.id === value}>
              <button
                type="button"
                className={`flex w-full items-center gap-4 px-4 py-3.5 text-left transition hover:bg-aurum/[0.07] ${a.id === value ? 'bg-aurum/[0.09]' : ''}`}
                onClick={() => {
                  onChange(a.id)
                  onOpenChange(false)
                }}
              >
                <CoinBadge asset={a} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-pearl">{a.label}</p>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-mist/70">{a.symbol}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

const fmtCrypto = (n, maxFrac = 8) => {
  if (!Number.isFinite(n)) return '—'
  const s = n.toFixed(maxFrac).replace(/\.?0+$/, '')
  return s || '0'
}

/** Deposit page–style panel: border, aurum highlights, inner wash */
function DepositStyleCard({ children, innerClassName = '', className = '', allowOverflow = false }) {
  return (
    <div
      className={`relative min-w-0 rounded-[1.35rem] border border-white/10 bg-slate-elevated/45 p-px shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_50px_120px_-50px_rgba(0,0,0,0.82),0_0_120px_-48px_rgba(201,171,122,0.14)] backdrop-blur-2xl ${
        allowOverflow ? 'overflow-visible' : 'overflow-hidden'
      } ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(201,171,122,0.55),transparent)] opacity-90" aria-hidden />
      <div className="pointer-events-none absolute left-0 top-0 h-32 w-px bg-[linear-gradient(180deg,rgba(201,171,122,0.5),transparent)] opacity-60" aria-hidden />
      <div
        className={`relative rounded-[calc(1.35rem-1px)] bg-[linear-gradient(155deg,rgba(255,255,255,0.055)_0%,transparent_40%,rgba(201,171,122,0.05)_100%)] ${
          allowOverflow ? 'overflow-visible' : 'overflow-hidden'
        } ${innerClassName}`}
      >
        {children}
      </div>
    </div>
  )
}

export default function Exchange() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => getUserSnapshot() || { displayName: 'Client' })
  const [wallet, setWallet] = useState(() => mockWalletSummary())

  const [fromId, setFromId] = useState('BTC')
  const [toId, setToId] = useState('ETH')
  const [openFrom, setOpenFrom] = useState(false)
  const [openTo, setOpenTo] = useState(false)

  const [amountStr, setAmountStr] = useState('1')
  const [preset, setPreset] = useState(/** @type {null | 25 | 50 | 75 | 100} */ (null))

  const [quote, setQuote] = useState(/** @type {ReturnType<typeof computeMockExchangeQuote> | null} */ (null))
  const [quoteLoading, setQuoteLoading] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(/** @type {string | null} */ (null))

  useEffect(() => {
    const ac = new AbortController()
    ;(async () => {
      try {
        const u = await fetchSessionUser(ac.signal)
        if (!ac.signal.aborted) setUser(u)
      } catch {
        const snap = getUserSnapshot()
        if (snap && !ac.signal.aborted) setUser(snap)
      }
      try {
        const w = await fetchWalletSummary(ac.signal)
        if (!ac.signal.aborted) setWallet(w)
      } catch {
        if (!ac.signal.aborted) setWallet(mockWalletSummary())
      }
    })()
    return () => ac.abort()
  }, [])

  const amountFromNum = useMemo(() => {
    const n = Number(String(amountStr).replace(/,/g, ''))
    return Number.isFinite(n) && n > 0 ? n : 0
  }, [amountStr])

  const pairInvalid = fromId === toId

  /** Debounced quote */
  useEffect(() => {
    if (pairInvalid || amountFromNum <= 0) {
      setQuote(null)
      return
    }
    const ac = new AbortController()
    const t = window.setTimeout(async () => {
      setQuoteLoading(true)
      setFormError(null)
      try {
        const { quote: q } = await fetchExchangeQuote(ac.signal, {
          from: fromId,
          to: toId,
          amountFrom: amountFromNum,
        })
        if (!ac.signal.aborted) {
          setQuote(q)
        }
      } catch {
        if (!ac.signal.aborted) {
          setQuote(computeMockExchangeQuote(fromId, toId, amountFromNum))
        }
      } finally {
        if (!ac.signal.aborted) setQuoteLoading(false)
      }
    }, 420)
    return () => {
      ac.abort()
      window.clearTimeout(t)
    }
  }, [fromId, toId, amountFromNum, pairInvalid])

  const applyPreset = useCallback(
    (pct) => {
      const totalUsd = wallet.totalUsd
      const px = mockUsdUnitPrice(fromId)
      if (!px || totalUsd <= 0) return
      const usdPortion = totalUsd * (pct / 100)
      const amt = usdPortion / px
      setPreset(pct)
      setAmountStr(fmtCrypto(amt, 10))
    },
    [fromId, wallet.totalUsd],
  )

  const onLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    if (pairInvalid) {
      setFormError('Choose two different assets.')
      return
    }
    if (amountFromNum <= 0) {
      setFormError('Enter an amount greater than zero.')
      return
    }
    if (!quote || quote.amountTo <= 0) {
      setFormError('Wait for a valid quote or adjust the amount.')
      return
    }

    setSubmitting(true)
    const ac = new AbortController()
    try {
      const res = await executeExchange(
        ac.signal,
        {
          from: fromId,
          to: toId,
          amountFrom: amountFromNum,
          quoteId: quote.quoteId,
        },
        {
          fallbackTotalUsd: wallet.totalUsd,
          fallbackChangePct: wallet.change24hPct,
          fallbackCurrency: wallet.currency,
        },
      )
      if (res.wallet && typeof res.wallet.totalUsd === 'number') {
        persistWalletSummaryOverride({
          totalUsd: res.wallet.totalUsd,
          change24hPct: res.wallet.change24hPct ?? wallet.change24hPct,
          currency: res.wallet.currency ?? wallet.currency,
        })
      }
      navigate('/home')
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Exchange could not be completed.'
      setFormError(msg)
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
          navLinks={EXCHANGE_HEADER_NAV_LINKS}
          showActions={false}
        />

        <main className="w-full flex-1 px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10 lg:px-10 lg:pt-12 xl:px-14">
          <header className="mx-auto mb-5 max-w-4xl text-center sm:mb-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-aurum/90">Convert</p>
            <h1 className="mt-2 font-serif text-[2rem] font-medium tracking-tight text-pearl sm:mt-3 sm:text-[2.35rem]">Exchange</h1>
            <p className="mx-auto mt-3 max-w-md text-[14px] font-light leading-relaxed text-mist/90">
              Institutional-grade routing between listed digital assets. Quotes refresh as markets move.
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            className="mx-auto grid w-full max-w-lg grid-cols-1 items-start gap-5 sm:gap-6 xl:max-w-[1800px] xl:grid-cols-3 xl:gap-5 2xl:gap-6"
          >
            {/* Left: portfolio + amount — nudged up toward header on wide layouts */}
            <div className="order-3 flex w-full min-w-0 flex-col gap-4 xl:order-1 xl:-mt-6 xl:max-w-md xl:justify-self-start 2xl:-mt-8">
              <DepositStyleCard innerClassName="p-5 sm:p-7 lg:p-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-mist/85">Portfolio allocation</p>
                <p className="mt-2 text-[12px] leading-relaxed text-mist/72">
                  Apply a slice of your vault NAV ({wallet.currency}) to size this leg from <span className="text-pearl/90">{fromId}</span>.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-2">
                  {([25, 50, 75, 100]).map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => applyPreset(/** @type {25|50|75|100} */ (pct))}
                      className={`rounded-2xl border px-4 py-4 text-center transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurum/45 ${
                        preset === pct
                          ? 'border-aurum/45 bg-aurum/[0.12] text-pearl shadow-[0_0_32px_-14px_rgba(201,171,122,0.35)]'
                          : 'border-white/10 bg-white/[0.03] text-mist hover:border-aurum/28 hover:bg-white/[0.05] hover:text-pearl'
                      }`}
                    >
                      <span className="block font-[Arial,Helvetica,sans-serif] text-xl font-medium text-pearl">{pct}%</span>
                      <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-mist/65">of NAV</span>
                    </button>
                  ))}
                </div>
              </DepositStyleCard>

              <DepositStyleCard innerClassName="flex flex-col justify-center p-5 sm:p-7 lg:p-8">
                <label htmlFor="exchange-amount" className="text-[10px] font-semibold uppercase tracking-[0.26em] text-mist/85">
                  Amount ({fromId})
                </label>
                <input
                  id="exchange-amount"
                  inputMode="decimal"
                  autoComplete="off"
                  value={amountStr}
                  onChange={(ev) => {
                    setPreset(null)
                    setAmountStr(ev.target.value)
                  }}
                  placeholder="0.00"
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-ink/50 px-5 py-4 font-serif text-xl tracking-tight text-pearl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition placeholder:text-mist/40 focus:border-aurum/40 focus:ring-2 focus:ring-aurum/15"
                />
              </DepositStyleCard>

              {formError ? (
                <div
                  role="alert"
                  className="w-full rounded-xl border border-red-400/25 bg-red-500/[0.08] px-4 py-3 text-[13px] text-red-100/95"
                >
                  {formError}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting || pairInvalid || amountFromNum <= 0 || quoteLoading || !quote}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-aurum/35 bg-[linear-gradient(180deg,rgba(201,171,122,0.92)_0%,rgba(140,115,78,0.94)_100%)] px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.22em] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_16px_48px_-18px_rgba(201,171,122,0.42)] transition hover:brightness-[1.06] disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurum/55"
              >
                {submitting ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-90" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Submitting
                  </>
                ) : (
                  'Confirm exchange'
                )}
              </button>
            </div>

            {/* Center: from / to */}
            <div className="order-1 flex w-full min-w-0 justify-center xl:order-2">
              <DepositStyleCard className="w-full max-w-md xl:w-full" innerClassName="p-5 sm:p-7 lg:p-8" allowOverflow>
                <div className="space-y-5">
                  <CoinDropdown
                    label="From"
                    value={fromId}
                    onChange={(id) => {
                      setFromId(id)
                      setOpenFrom(false)
                    }}
                    open={openFrom}
                    onOpenChange={(v) => {
                      setOpenFrom(v)
                      if (v) setOpenTo(false)
                    }}
                  />

                  <div className="flex justify-center py-1">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-aurum/35 bg-aurum/[0.08] text-aurum shadow-[0_0_28px_-10px_rgba(201,171,122,0.4)]" aria-hidden>
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  <CoinDropdown
                    label="To"
                    value={toId}
                    onChange={(id) => {
                      setToId(id)
                      setOpenTo(false)
                    }}
                    open={openTo}
                    onOpenChange={(v) => {
                      setOpenTo(v)
                      if (v) setOpenFrom(false)
                    }}
                  />
                </div>
              </DepositStyleCard>
            </div>

            {/* Right: live quote (centered on mobile, flush right on xl+) */}
            <div className="order-2 flex w-full min-w-0 justify-center xl:order-3 xl:justify-end">
              <DepositStyleCard
                className="w-full max-w-md xl:w-full"
                innerClassName="flex min-h-44 flex-col px-5 py-6 sm:px-7 sm:py-7 xl:min-h-0"
              >
                <p className="text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-mist/80 xl:text-left">
                  Live quote
                </p>
                {pairInvalid ? (
                  <p className="mt-3 text-center text-sm text-amber-200/85 xl:text-left">
                    Select two different assets to fetch a conversion rate.
                  </p>
                ) : quoteLoading ? (
                  <div className="mt-4 space-y-3">
                    <div className="mx-auto h-8 w-48 max-w-full animate-pulse rounded-lg bg-white/[0.06]" />
                    <div className="mx-auto h-4 w-full max-w-xs animate-pulse rounded bg-white/[0.05]" />
                  </div>
                ) : quote ? (
                  <div className="mt-4 text-center xl:text-left">
                    <p className="font-[Arial,Helvetica,sans-serif] text-2xl font-medium tracking-tight text-pearl sm:text-[1.75rem]">
                      {fmtCrypto(amountFromNum)} {fromId}{' '}
                      <span className="text-base font-normal text-mist/70">→</span>{' '}
                      {fmtCrypto(quote.amountTo)} {toId}
                    </p>
                    <p className="mt-2 font-[Arial,Helvetica,sans-serif] text-[13px] text-mist/78">
                      Rate: <span className="font-medium text-pearl/95">1 {fromId}</span> ≈{' '}
                      <span className="font-medium text-aurum/95">{fmtCrypto(quote.rate, 8)}</span> {toId}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-center text-sm text-mist/75 xl:text-left">Enter an amount to preview conversion.</p>
                )}
              </DepositStyleCard>
            </div>
          </form>
        </main>

        <HomeFooter />
      </div>
    </div>
  )
}
