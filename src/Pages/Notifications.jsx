/**
 * Notifications — data from src/lib/payloads/notifications.js
 */

import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeFooter from '../components/home/HomeFooter.jsx'
import HomeHeader from '../components/home/HomeHeader.jsx'
import { OVERVIEW_NAV_LINKS } from '../lib/appNav.js'
import { formatNotificationTime, loadRateUpdateNotifications } from '../lib/payloads/notifications.js'
import { loadSessionUser } from '../lib/payloads/user.js'
import { clearSession, getUserSnapshot } from '../lib/session.js'

/** @typedef {import('../lib/payloads/notifications.js').RateUpdateNotification} RateUpdateNotification */

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
          className={`mt-3 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-[Arial,Helvetica,sans-serif] text-[12px] font-semibold tabular-nums ${
            flat
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
  const [user, setUser] = useState(() => getUserSnapshot() || { displayName: 'Client' })
  const [items, setItems] = useState(/** @type {RateUpdateNotification[]} */ ([]))
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (signal) => {
    setLoading(true)
    try {
      const { items: next } = await loadRateUpdateNotifications(signal)
      if (signal.aborted) return
      setItems(next)
    } catch (e) {
      if (signal.aborted || (e instanceof DOMException && e.name === 'AbortError')) return
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const ac = new AbortController()
    void load(ac.signal)
    return () => ac.abort()
  }, [load])

  useEffect(() => {
    const ac = new AbortController()
    ;(async () => {
      try {
        const u = await loadSessionUser(ac.signal)
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

  const onRefresh = () => {
    const ac = new AbortController()
    void load(ac.signal)
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-aurum/90">Alerts</p>
            <h1 className="mt-2 font-serif text-[2rem] font-medium tracking-tight text-pearl sm:text-[2.35rem]">Notifications</h1>
            <p className="mx-auto mt-3 max-w-xl text-[14px] font-light leading-relaxed text-mist/90">
              Rate updates and pricing notices for your watched pairs.
            </p>
            <div className="mx-auto mt-6 h-px w-full max-w-sm bg-[linear-gradient(90deg,transparent,rgba(201,171,122,0.45),transparent)]" />
          </header>

          <section className="mx-auto mt-10 max-w-2xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-[12px] text-mist/75">{items.length} notification{items.length === 1 ? '' : 's'}</p>
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-mist transition hover:bg-white/[0.08] hover:text-pearl disabled:opacity-50"
              >
                Refresh
              </button>
            </div>

            {loading && items.length === 0 ? (
              <ul className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="h-40 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
                ))}
              </ul>
            ) : items.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-slate-elevated/40 px-6 py-12 text-center text-[14px] text-mist/80">
                No notifications yet.
              </p>
            ) : (
              <ul className="space-y-4">{items.map((n) => <NotificationCard key={n.id} n={n} />)}</ul>
            )}
          </section>
        </main>

        <HomeFooter />
      </div>
    </div>
  )
}
