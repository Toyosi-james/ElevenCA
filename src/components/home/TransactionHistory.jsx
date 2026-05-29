/**
 * Paginated transaction list — data from src/lib/payloads/transactions.js
 */

import React from 'react'

/** @param {{ items: Array<{ id: string; title: string; amount: number; currency: string; direction: 'in' | 'out'; status: string; occurredAt: number; reference?: string }>; loading?: boolean; page: number; pageSize: number; total: number; totalPages: number; hasNextPage: boolean; onPageChange: (nextPage: number) => void }} props */
export default function TransactionHistory({
  items,
  loading,
  page,
  pageSize,
  total,
  totalPages,
  hasNextPage,
  onPageChange,
}) {
  const fmtMoney = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const fmtRelative = (ms) => {
    const d = Math.floor((Date.now() - ms) / 60000)
    if (d < 1) return 'Just now'
    if (d < 60) return `${d}m ago`
    const h = Math.floor(d / 60)
    if (h < 48) return `${h}h ago`
    const days = Math.floor(h / 24)
    if (days < 14) return `${days}d ago`
    return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatAmount = (row) => {
    const abs = Math.abs(row.amount)
    const signedPrefix = row.amount >= 0 ? '+' : '−'
    if (row.currency === 'USD') {
      return `${signedPrefix}${fmtMoney.format(abs)}`
    }
    return `${signedPrefix}${abs.toLocaleString(undefined, { maximumFractionDigits: 8 })} ${row.currency}`
  }

  const statusBadge = (status) => {
    const base =
      'inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]'
    if (status === 'pending')
      return `${base} border-amber-400/35 bg-amber-500/10 text-amber-100/95`
    if (status === 'failed') return `${base} border-red-400/35 bg-red-500/10 text-red-100/95`
    return `${base} border-emerald-500/30 bg-emerald-500/10 text-emerald-50/95`
  }

  const winStart = items.length === 0 ? 0 : (page - 1) * pageSize + 1
  const winEnd = (page - 1) * pageSize + items.length
  const canPrev = page > 1 && !loading
  const canNext = hasNextPage && !loading

  const pageBtn =
    'min-h-[44px] flex-1 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-pearl transition hover:border-aurum/35 hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurum/55 disabled:cursor-not-allowed disabled:border-white/[0.06] disabled:opacity-40 disabled:hover:bg-white/[0.04] xs:flex-none xs:min-h-0 xs:px-5'

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-elevated/40 p-px shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_40px_100px_-48px_rgba(0,0,0,0.78)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(201,171,122,0.45),transparent)] opacity-90" aria-hidden />

      <div className="relative rounded-[calc(1rem-1px)] px-3 py-5 xs:px-4 sm:px-6 sm:py-8 xl:px-8 xl:py-9">
        <div className="border-b border-white/[0.07] pb-4 sm:pb-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-aurum/90">Activity</p>
          <h2 className="mt-2 font-serif text-[clamp(1.25rem,4vw,1.65rem)] font-medium leading-tight tracking-tight text-pearl xl:text-2xl">
            Transaction history
          </h2>
        </div>

        <div className="mt-4 flex flex-col overflow-hidden rounded-xl border border-white/[0.06] sm:mt-5">
          <div className="hidden shrink-0 grid-cols-[minmax(0,1fr)_minmax(6rem,7rem)_5.5rem_5rem] gap-3 border-b border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-mist/75 xl:grid 2xl:grid-cols-[minmax(0,1fr)_7rem_6rem_5.5rem]">
            <span>Details</span>
            <span className="text-right tabular-nums">Amount</span>
            <span className="text-center">Status</span>
            <span className="text-right whitespace-nowrap">Time</span>
          </div>

          <div
            className="tx-history-scroll max-h-[min(36vh,280px)] overflow-y-auto overscroll-y-contain xs:max-h-[min(38vh,300px)] xl:max-h-[min(40vh,340px)]"
            role="region"
            aria-label="Transaction list"
          >
          <ul className="divide-y divide-white/[0.05]" aria-busy={loading}>
            {loading ? (
              Array.from({ length: Math.min(pageSize, 6) }).map((_, i) => (
                <li key={`sk-${i}`} className="animate-pulse p-2 xs:p-3">
                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-3 xl:hidden">
                    <div className="h-3.5 w-[72%] max-w-[14rem] rounded bg-white/10" />
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="h-3.5 rounded bg-white/10" />
                      <div className="h-3.5 rounded bg-white/10" />
                    </div>
                  </div>
                  <div className="hidden py-3 xl:block">
                    <div className="h-3.5 w-full max-w-xl rounded bg-white/10" />
                  </div>
                </li>
              ))
            ) : items.length === 0 ? (
              <li className="flex min-h-[11rem] items-center justify-center px-4 py-8 text-center text-[13px] font-light leading-relaxed text-mist xs:text-[14px]">
                No transactions on this page.
              </li>
            ) : (
              items.map((row) => (
                <li key={row.id} className="min-w-0">
                  {/* Narrow → wide tablet: stacked card */}
                  <div className="p-2 xs:p-2.5 sm:p-3 xl:hidden">
                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] xs:px-3.5 xs:py-3">
                      <div className="flex flex-col gap-2 xs:flex-row xs:items-start xs:justify-between xs:gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-[14px] font-medium leading-snug tracking-tight text-pearl xs:text-[15px]">
                            {row.title}
                          </p>
                          {row.reference ? (
                            <p className="mt-1.5 break-all font-mono text-[10px] leading-snug text-mist/65 xs:text-[11px]">
                              {row.reference}
                            </p>
                          ) : null}
                        </div>
                        <span className={`${statusBadge(row.status)} self-start xs:shrink-0`}>{row.status}</span>
                      </div>
                      <div className="mt-2.5 grid grid-cols-1 gap-3 border-t border-white/[0.06] pt-2.5 xs:grid-cols-2 xs:items-end xs:gap-4 xs:pt-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-mist/65">Amount</p>
                          <p className="mt-0.5 break-all font-mono text-[13px] font-semibold tabular-nums leading-snug text-white xs:text-[14px]">
                            {formatAmount(row)}
                          </p>
                        </div>
                        <div className="min-w-0 xs:text-right">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-mist/65">Time</p>
                          <p className="mt-0.5 text-[12px] font-medium tabular-nums text-mist/88 xs:text-[13px]">{fmtRelative(row.occurredAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* XL+: row table */}
                  <div className="hidden min-w-0 px-4 py-3 transition hover:bg-white/[0.02] xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(6rem,7rem)_5.5rem_5rem] xl:items-center xl:gap-3 2xl:grid-cols-[minmax(0,1fr)_7rem_6rem_5.5rem]">
                    <div className="min-w-0">
                      <p className="break-words font-medium tracking-tight text-pearl">{row.title}</p>
                      {row.reference ? (
                        <p className="mt-1 break-all font-mono text-[11px] text-mist/70">{row.reference}</p>
                      ) : null}
                    </div>
                    <p className="break-all font-mono text-[13px] font-semibold tabular-nums text-white xl:text-right">
                      {formatAmount(row)}
                    </p>
                    <div className="flex xl:justify-center">
                      <span className={statusBadge(row.status)}>{row.status}</span>
                    </div>
                    <p className="whitespace-nowrap text-[13px] font-medium tabular-nums text-mist/85 xl:text-right">
                      {fmtRelative(row.occurredAt)}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
          </div>

          <div className="flex shrink-0 flex-col gap-3 border-t border-white/[0.06] bg-white/[0.015] px-3 py-3 xs:gap-4 xs:px-4 xs:py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-center text-[11px] leading-snug tabular-nums text-mist/75 text-balance xs:text-[12px] sm:text-left">
              {items.length === 0 ? (
                <>
                  Page {page}
                  <span className="text-mist/45"> · </span>
                  {total} total
                </>
              ) : (
                <>
                  <span className="inline-block sm:inline">{winStart}–{winEnd}</span>
                  <span className="text-mist/45"> of </span>
                  {total}
                  <span className="hidden text-mist/45 sm:inline"> · </span>
                  <br className="xs:hidden" />
                  <span className="text-mist/55 xs:text-mist/45">Page </span>
                  {page} / {Math.max(1, totalPages)}
                </>
              )}
            </p>
            <div className="flex w-full gap-2 xs:w-auto xs:justify-center sm:w-auto sm:justify-end">
              <button type="button" disabled={!canPrev} className={pageBtn} onClick={() => onPageChange(page - 1)}>
                Previous
              </button>
              <button type="button" disabled={!canNext} className={pageBtn} onClick={() => onPageChange(page + 1)}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
