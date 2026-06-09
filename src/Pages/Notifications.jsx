/**
 * NOTIFICATIONS PAGE (/notifications)
 *
 * Rate-update alerts list. Search "BACKEND INTEGRATION" for GET endpoint.
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeFooter from '../components/home/HomeFooter.jsx'
import HomeHeader from '../components/home/HomeHeader.jsx'
import { useEffect } from 'react'
import { getAccessToken } from '../api/auth.js'

const SESSION_KEY = 'eleven_user'

function readLoggedInUser() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return { displayName: 'Client' }
}

function formatNotificationTime(ms) {
  const d = Math.floor((Date.now() - ms) / 60000)
  if (d < 1) return 'Just now'
  if (d < 60) return `${d}m ago`
  const h = Math.floor(d / 60)
  if (h < 48) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

/**
 * DEMO ONLY — notification cards.
 * BACKEND: GET /api/wallet/notifications/rate-updates
 * Response: { items: [{ id, pair, headline, body, changePct, occurredAt }] }
 */
const SAMPLE_NOTIFICATIONS = [
  {
    id: '1',
    pair: 'BTC / USD',
    headline: 'Reference rate refreshed',
    body: 'Venue mid moved +0.42% vs. prior print.',
    changePct: 0.42,
    occurredAt: Date.now() - 4 * 60 * 1000,
  },
  {
    id: '2',
    pair: 'ETH / USD',
    headline: 'Reference rate refreshed',
    body: 'Mid-rate down −0.18% after liquidity sweep.',
    changePct: -0.18,
    occurredAt: Date.now() - 38 * 60 * 1000,
  },
  {
    id: '3',
    pair: 'SOL / USDT',
    headline: 'Reference rate refreshed',
    body: 'Oracle consensus ticked +0.91%.',
    changePct: 0.91,
    occurredAt: Date.now() - 2 * 60 * 60 * 1000,
  },
  {
    id: '4',
    pair: 'XRP / USD',
    headline: 'Reference rate refreshed',
    body: 'Flat session: mid unchanged within 0.02%.',
    changePct: 0.02,
    occurredAt: Date.now() - 5 * 60 * 60 * 1000,
  },
]

function NotificationCard({ n }) {
  const up = n.changePct > 0
  const flat = Math.abs(n.changePct) < 0.05
  return (
    <li className="relative min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-elevated/45 p-px shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_28px_80px_-48px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(201,171,122,0.45),transparent)] opacity-90" aria-hidden />
      <div className="relative rounded-[calc(1rem-1px)] bg-[linear-gradient(155deg,rgba(255,255,255,0.055)_0%,transparent_42%,rgba(201,171,122,0.04)_100%)] px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-mist/80">Rate update</p>
          <time className="text-[11px] tabular-nums text-mist/70" dateTime={new Date(n.occurredAt).toISOString()}>
            {formatNotificationTime(n.occurredAt)}
          </time>
        </div>
        <p className="mt-2 font-serif text-lg font-medium tracking-tight text-pearl sm:text-xl">{n.pair}</p>
        <p className="mt-1 text-[13px] font-medium text-pearl/92">{n.headline}</p>
        <p className="mt-2 text-[13px] leading-relaxed text-mist/85">{n.body}</p>
        <p
          className={`mt-3 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-[Arial,Helvetica,sans-serif] text-[12px] font-semibold tabular-nums ${flat
              ? 'border-white/15 bg-white/[0.04] text-mist'
              : up
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100/95'
                : 'border-red-400/30 bg-red-500/10 text-red-100/95'
            }`}
        >
          {up && !flat ? '▲' : !up && !flat ? '▼' : '—'}{' '}
          {up && !flat ? '+' : ''}
          {n.changePct.toFixed(2)}% <span className="font-sans text-[10px] font-normal uppercase tracking-wider text-mist/60">mid</span>
        </p>
      </div>
    </li>
  )
}

export default function Notifications() {
  const navigate = useNavigate()
  useEffect(() => {
    if (!getAccessToken()) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const [user] = useState(readLoggedInUser)
  const [items] = useState(SAMPLE_NOTIFICATIONS)

  /*
   * ┌─────────────────────────────────────────────────────────────────
   * │ BACKEND INTEGRATION — Load rate-update notifications
   * ├─────────────────────────────────────────────────────────────────
   * │ Trigger:  page mount (useEffect) — optional pull-to-refresh later
   * │ Method:   GET
   * │ URL:      /api/wallet/notifications/rate-updates
   * │ Auth:     Authorization: Bearer <accessToken>
   * │
   * │ Response: { items: [{ id, pair, headline, body, changePct, occurredAt }] }
   * │   occurredAt = Unix ms timestamp (used by formatNotificationTime)
   * │
   * │ Wire to: setItems(data.items)
   * │ DEMO ONLY: SAMPLE_NOTIFICATIONS used as initial state
   * └─────────────────────────────────────────────────────────────────
   */

  const onLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
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
        <HomeHeader
          displayName={user.displayName}
          avatarUrl={user.avatarUrl}
          onLogout={onLogout}
          navLinks={[{ to: '/home', label: 'Overview' }]}
          showActions={false}
        />

        <main className="w-full flex-1 px-4 pb-14 pt-8 sm:px-6 sm:pt-10 lg:px-10 lg:pt-12 xl:px-14">
          <header className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-aurum/90">Alerts</p>
            <h1 className="mt-2 font-serif text-[2rem] font-medium tracking-tight text-pearl sm:text-[2.35rem]">Notifications</h1>
            <p className="mx-auto mt-3 max-w-xl text-[14px] font-light leading-relaxed text-mist/90">
              Rate updates and pricing notices for your watched pairs.
            </p>
          </header>

          <section className="mx-auto mt-10 max-w-2xl">
            <p className="mb-6 text-[12px] text-mist/75">{items.length} notifications (sample data)</p>
            <ul className="space-y-4">{items.map((n) => <NotificationCard key={n.id} n={n} />)}</ul>
          </section>
        </main>

        <HomeFooter />
      </div>
    </div>
  )
}
