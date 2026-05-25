/**
 * Settings menu — links to update PIN / password screens.
 * API: GET /auth/me for header only. Save endpoints not wired in this app yet.
 */

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeFooter from '../components/home/HomeFooter.jsx'
import HomeHeader from '../components/home/HomeHeader.jsx'
import { OVERVIEW_NAV_LINKS } from '../lib/appNav.js'
import { fetchSessionUser } from '../lib/api/user.js'
import { clearSession, getUserSnapshot } from '../lib/session.js'

export default function Settings() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => getUserSnapshot() || { displayName: 'Client' })

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

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-ink">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(201,171,122,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.014)_1px,transparent_1px)] bg-size-[80px_80px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,6,8,0.88)_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <HomeHeader displayName={user.displayName} avatarUrl={user.avatarUrl} onLogout={onLogout} navLinks={OVERVIEW_NAV_LINKS} showActions={false} />

        <main className="w-full flex-1 px-4 pb-14 pt-8 sm:px-6 sm:pt-10 lg:px-10 lg:pt-12 xl:px-14">
          <header className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-aurum/90">Account</p>
            <h1 className="mt-2 font-serif text-[2rem] font-medium tracking-tight text-pearl sm:text-[2.35rem]">Settings</h1>
            <p className="mx-auto mt-3 max-w-xl text-[14px] font-light leading-relaxed text-mist/90">
              Manage your account preferences and security settings.
            </p>
            <div className="mx-auto mt-6 h-px w-full max-w-sm bg-[linear-gradient(90deg,transparent,rgba(201,171,122,0.45),transparent)]" />
          </header>

          <section className="mx-auto flex min-h-[54vh] max-w-xl items-center justify-center">
            <div className="relative w-full max-w-md overflow-hidden rounded-[1.35rem] border border-white/12 bg-slate-elevated/45 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_45px_110px_-55px_rgba(0,0,0,0.92),0_0_90px_-42px_rgba(201,171,122,0.2)] backdrop-blur-2xl sm:p-8">
              <div
                className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(201,171,122,0.2),transparent_68%)] blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.13),transparent_72%)] blur-3xl"
                aria-hidden
              />
              <div className="relative space-y-2 pb-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-aurum/85">Security Controls</p>
                <h2 className="font-serif text-[1.5rem] tracking-tight text-pearl sm:text-[1.7rem]">Update credentials</h2>
                <p className="max-w-sm text-[13px] leading-relaxed text-mist/80">
                  Choose the item you want to update. These actions help keep your account secure.
                </p>
              </div>
              <div className="relative space-y-4">
              <button
                type="button"
                onClick={() => navigate('/settings/update-password')}
                className="w-full rounded-xl border border-transparent bg-[linear-gradient(180deg,var(--color-aurum)_0%,var(--color-aurum-muted)_100%)] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_16px_46px_-18px_rgba(201,171,122,0.4)] transition hover:brightness-[1.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurum/70"
              >
                Update Password
              </button>
              <button
                type="button"
                onClick={() => navigate('/settings/update-pin')}
                className="w-full rounded-xl border border-white/14 bg-white/3 px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-frost shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-white/26 hover:bg-white/6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/25"
              >
                Update Pin
              </button>
              </div>
            </div>
          </section>
        </main>

        <HomeFooter />
      </div>
    </div>
  )
}
