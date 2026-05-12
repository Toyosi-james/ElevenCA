import React, { useMemo } from 'react'

/** @typedef {'1d' | '7d' | '30d'} FlowRange */

/**
 * Spot prices; chart shows indexed movement (100 = window start) so BTC/ETH/SOL are comparable.
 * @param {{
 *   points: { label: string; btc: number; eth: number; sol: number }[]
 *   range: FlowRange
 *   onRangeChange: (r: FlowRange) => void
 *   windowMeta?: { source: 'api' | 'demo'; apiDaily1d?: boolean }
 * }} props
 */
export default function FlowChart({ points, range, onRangeChange, windowMeta }) {
  const layout = useMemo(() => {
    const W = 920
    const H = 300
    const padL = 52
    const padR = 22
    const padT = 28
    const padB = 52
    const innerW = W - padL - padR
    const innerH = H - padT - padB
    const n = points.length
    if (n < 2) return null

    const b0 = points[0].btc || 1
    const e0 = points[0].eth || 1
    const s0 = points[0].sol || 1

    const indexed = points.map((p) => ({
      label: p.label,
      btc: (p.btc / b0) * 100,
      eth: (p.eth / e0) * 100,
      sol: (p.sol / s0) * 100,
    }))

    const last = indexed[n - 1]
    const pct = (v) => ((v - 100) / 100) * 100

    const xAt = (i) => padL + (i / (n - 1)) * innerW

    const btc = indexed.map((p) => p.btc)
    const eth = indexed.map((p) => p.eth)
    const sol = indexed.map((p) => p.sol)
    const all = [...btc, ...eth, ...sol]
    const min = Math.min(...all)
    const max = Math.max(...all)
    const span = max - min || 1
    const pad = span * 0.06
    const yMin = min - pad
    const yMax = max + pad
    const ySpan = yMax - yMin || 1

    const yAt = (val) => padT + innerH - ((val - yMin) / ySpan) * innerH

    const linePath = (vals) =>
      vals
        .map((_, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(vals[i]).toFixed(1)}`)
        .join(' ')

    const btcLine = linePath(btc)
    const ethLine = linePath(eth)
    const solLine = linePath(sol)

    const yTicks = 4
    const gridYs = Array.from({ length: yTicks }, (_, i) => {
      const t = i / (yTicks - 1)
      const val = yMin + (yMax - yMin) * (1 - t)
      return { y: padT + innerH * t, val }
    })

    const step = n > 20 ? Math.max(1, Math.floor((n - 1) / 6)) : n > 12 ? 3 : 5
    const xLabels = points
      .map((p, i) => ({ i, label: p.label }))
      .filter((_, i) => i % step === 0 || i === n - 1)

    return {
      W,
      H,
      padL,
      padT,
      innerW,
      innerH,
      btcLine,
      ethLine,
      solLine,
      gridYs,
      xLabels,
      xAt,
      moves: {
        btc: pct(last.btc),
        eth: pct(last.eth),
        sol: pct(last.sol),
      },
    }
  }, [points])

  if (!layout) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-2xl border border-cyan-500/15 bg-slate-elevated/35 font-mono text-sm text-mist">
        No chart data
      </div>
    )
  }

  const { W, H, padL, padT, innerW, innerH, btcLine, ethLine, solLine, gridYs, xLabels, xAt, moves } = layout

  const fmtPct = (x) => {
    const sign = x > 0 ? '+' : ''
    return `${sign}${x.toFixed(2)}%`
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[linear-gradient(165deg,rgba(15,23,42,0.92)_0%,rgba(8,11,18,0.96)_45%,rgba(12,18,28,0.94)_100%)] p-px shadow-[0_0_0_1px_rgba(34,211,238,0.06)_inset,0_0_80px_-28px_rgba(34,211,238,0.14),0_40px_100px_-48px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.35),rgba(201,171,122,0.35),transparent)] opacity-90" aria-hidden />
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[24px_24px]" aria-hidden />

      <div className="relative rounded-[calc(1rem-1px)] px-5 py-7 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-24 top-0 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.09),transparent_68%)] blur-2xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.07),transparent_70%)] blur-2xl" aria-hidden />

        <div className="relative mb-5 flex flex-col gap-4 border-b border-white/[0.07] pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50 opacity-75" aria-hidden />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              </span>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300/95">
                Live
              </span>
            </div>

            <span className="hidden h-4 w-px bg-white/15 sm:block" aria-hidden />

            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.32em] text-mist/75">Benchmark</p>

            <div className="flex flex-wrap gap-2">
              {['BTC', 'ETH', 'SOL'].map((sym) => (
                <span
                  key={sym}
                  className="rounded border border-white/[0.09] bg-black/35 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-frost/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                >
                  {sym}
                </span>
              ))}
            </div>

            {windowMeta?.apiDaily1d ? (
              <span className="font-mono text-[9px] uppercase tracking-wider text-amber-200/55">Daily · 1D uses 2 closes</span>
            ) : null}
          </div>

          <div
            className="flex shrink-0 rounded-lg border border-cyan-500/20 bg-black/40 p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
            role="group"
            aria-label="Chart time range"
          >
            {[
              ['1d', '1D'],
              ['7d', '7D'],
              ['30d', '30D'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => onRangeChange(/** @type {FlowRange} */ (key))}
                className={`rounded-md px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider transition-all sm:px-4 ${
                  range === key
                    ? 'border border-cyan-400/45 bg-cyan-500/15 text-cyan-100 shadow-[0_0_24px_-8px_rgba(34,211,238,0.45)]'
                    : 'border border-transparent text-mist hover:border-white/10 hover:bg-white/[0.04] hover:text-frost/90'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flow-chart-scroll relative overflow-x-auto overflow-y-hidden rounded-lg border border-cyan-500/15 bg-[linear-gradient(165deg,rgba(17,24,39,0.65)_0%,rgba(8,11,18,0.94)_48%,rgba(15,23,42,0.82)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] [-webkit-overflow-scrolling:touch]">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="mx-auto block h-[220px] w-full min-w-[560px] max-w-none sm:h-[260px] sm:min-w-[620px] lg:h-[300px] lg:min-w-0 lg:w-full lg:max-w-full"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Indexed spot benchmark for Bitcoin, Ethereum, and Solana"
          >
            <defs>
              <filter id="flowGlowAurum" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="flowGlowBlue" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="flowGlowViolet" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {gridYs.map(({ y, val }, i) => (
              <g key={i}>
                <line
                  x1={padL}
                  y1={y}
                  x2={padL + innerW}
                  y2={y}
                  stroke="rgba(34,211,238,0.06)"
                  strokeDasharray="4 10"
                />
                <text
                  x={padL - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="rgba(148,163,184,0.82)"
                  fontSize="10"
                  fontFamily="ui-monospace, monospace"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            ))}

            <text
              x={12}
              y={padT + innerH / 2}
              fill="rgba(100,116,139,0.75)"
              fontSize="9"
              fontFamily="ui-monospace, monospace"
              transform={`rotate(-90 12 ${padT + innerH / 2})`}
              textAnchor="middle"
            >
              IDX
            </text>

            <path
              d={btcLine}
              fill="none"
              stroke="rgba(201,171,122,0.98)"
              strokeWidth="2.35"
              strokeLinejoin="round"
              strokeLinecap="round"
              filter="url(#flowGlowAurum)"
            />
            <path
              d={ethLine}
              fill="none"
              stroke="rgba(96,165,250,0.95)"
              strokeWidth="2.2"
              strokeLinejoin="round"
              strokeLinecap="round"
              filter="url(#flowGlowBlue)"
            />
            <path
              d={solLine}
              fill="none"
              stroke="rgba(192,132,252,0.96)"
              strokeWidth="2.2"
              strokeLinejoin="round"
              strokeLinecap="round"
              filter="url(#flowGlowViolet)"
            />

            {xLabels.map(({ i, label }) => (
              <text
                key={i}
                x={xAt(i)}
                y={H - 18}
                textAnchor="middle"
                fill="rgba(148,163,184,0.78)"
                fontSize="10"
                fontFamily="ui-monospace, monospace"
              >
                {label}
              </text>
            ))}
          </svg>
        </div>

        <div className="relative mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/[0.06] pt-5 font-mono text-[11px] uppercase tracking-wider">
          <span className="inline-flex items-center gap-2.5 text-frost/90">
            <span className="h-2 w-2 shrink-0 rounded-full bg-aurum shadow-[0_0_14px_rgba(201,171,122,0.55)]" />
            BTC <span className="tabular-nums normal-case text-cyan-100/90">{fmtPct(moves.btc)}</span>
          </span>
          <span className="inline-flex items-center gap-2.5 text-frost/90">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#60a5fa] shadow-[0_0_12px_rgba(96,165,250,0.45)]" />
            ETH <span className="tabular-nums normal-case text-cyan-100/90">{fmtPct(moves.eth)}</span>
          </span>
          <span className="inline-flex items-center gap-2.5 text-frost/90">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#c084fc] shadow-[0_0_12px_rgba(192,132,252,0.45)]" />
            SOL <span className="tabular-nums normal-case text-cyan-100/90">{fmtPct(moves.sol)}</span>
          </span>
        </div>
      </div>
    </section>
  )
}
