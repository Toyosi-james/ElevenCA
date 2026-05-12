import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeFooter from '../components/home/HomeFooter.jsx'
import HomeHeader from '../components/home/HomeHeader.jsx'
import { OVERVIEW_NAV_LINKS } from '../lib/appNav.js'
import { fetchRateUpdateNotifications } from '../lib/api/notifications.js'
import { fetchSessionUser } from '../lib/api/user.js'
import { formatNotificationTime } from '../lib/notifications/rateUpdateNotifications.js'
import { clearSession, getUserSnapshot } from '../lib/session.js'

/** @typedef {import('../lib/api/notifications.js').RateUpdateNotification} RateUpdateNotification */

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
  const [source, setSource] = useState(/** @type {'api' | 'mock' | null} */ (null))

  const load = useCallback(async (signal) => {
    setLoading(true)
    try {
      const { items: next, source: src } = await fetchRateUpdateNotifications(signal)
      if (signal.aborted) return
      setItems(next)
      setSource(src)
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

        <main className="w-full flex-1 px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:px-10 lg:pt-12 xl:px-14 2xl:px-16">
          <div className="mb-8 flex flex-col gap-4 border-b border-white/[0.07] pb-8 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <header className="max-w-2xl text-center sm:text-left">
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-aurum/90">Alerts</p>
              <h1 className="mt-2 font-serif text-[2rem] font-medium tracking-tight text-pearl sm:text-[2.35rem]">Notifications</h1>
              <p className="mx-auto mt-3 max-w-xl text-[14px] font-light leading-relaxed text-mist/90 sm:mx-0">
                Rate updates from our pricing desk and venue feeds. These refresh as markets move.
              </p>
            </header>
            <div className="flex shrink-0 flex-wrap items-center justify-center gap-3 sm:justify-end">
              {source ? (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-mist/80">
                  Data: {source === 'api' ? 'API' : 'Simulator'}
                </span>
              ) : null}
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-pearl transition hover:border-aurum/35 hover:bg-white/[0.07] disabled:opacity-45"
              >
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4" aria-busy="true" aria-label="Loading notifications">
              {Array.from({ length: 8 }).map((_, i) => (
                <li key={`sk-${i}`} className="animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 sm:p-6">
                  <div className="h-3 w-24 rounded bg-white/10" />
                  <div className="mt-4 h-4 w-3/4 max-w-[12rem] rounded bg-white/10" />
                  <div className="mt-3 h-3 w-full rounded bg-white/[0.06]" />
                  <div className="mt-2 h-3 w-[90%] rounded bg-white/[0.06]" />
                  <div className="mt-4 h-8 w-28 rounded-lg bg-white/[0.06]" />
                </li>
              ))}
            </ul>
          ) : items.length === 0 ? (
            <p className="py-16 text-center text-[14px] text-mist/80">No rate updates yet. Check back after the next pricing refresh.</p>
          ) : (
            <ul
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4"
              aria-label="Rate update notifications"
            >
              {items.map((n) => (
                <NotificationCard key={n.id} n={n} />
              ))}
            </ul>
          )}
        </main>

        <HomeFooter />
      </div>
    </div>
  )
}
