import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeFooter from '../components/home/HomeFooter.jsx'
import HomeHeader from '../components/home/HomeHeader.jsx'
import { fetchSessionUser } from '../lib/api/user.js'
import { DEPOSIT_HEADER_NAV_LINKS } from '../lib/appNav.js'
import { clearSession, getUserSnapshot } from '../lib/session.js'

export default function Deposit() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => getUserSnapshot() || { displayName: 'Client' })

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
          navLinks={DEPOSIT_HEADER_NAV_LINKS}
          showActions={false}
        />

        <main className="w-full flex-1 px-4 pb-14 pt-8 sm:px-6 sm:pt-10 lg:px-10 lg:pt-12 xl:px-14">
          <header className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-aurum/90">Treasury</p>
            <h1 className="mt-2 font-serif text-[2rem] font-medium tracking-tight text-pearl sm:text-[2.35rem]">Deposit</h1>
            <p className="mx-auto mt-3 max-w-xl text-[14px] font-light leading-relaxed text-mist/90">
              Choose an option to continue with your deposit action.
            </p>
            <div className="mx-auto mt-6 h-px w-full max-w-sm bg-[linear-gradient(90deg,transparent,rgba(201,171,122,0.45),transparent)]" />
          </header>

          <section className="mx-auto flex min-h-[54vh] max-w-xl items-center justify-center">
            <div className="relative w-full max-w-lg overflow-hidden rounded-[1.45rem] border border-white/12 bg-slate-elevated/45 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_55px_120px_-58px_rgba(0,0,0,0.92),0_0_110px_-46px_rgba(201,171,122,0.24)] backdrop-blur-2xl sm:p-8">
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full bg-[radial-gradient(circle_at_center,rgba(201,171,122,0.22),transparent_68%)] blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.14),transparent_72%)] blur-3xl"
                aria-hidden
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(201,171,122,0.6),transparent)] opacity-90" aria-hidden />

              <div className="relative space-y-2 pb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-aurum/85">Deposit Actions</p>
                <h2 className="font-serif text-[1.55rem] tracking-tight text-pearl sm:text-[1.78rem]">Choose action</h2>
                <p className="max-w-md text-[13px] leading-relaxed text-mist/80">
                  Receive funds into your vault address or continue to fund gas fees.
                </p>
              </div>

              <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  // Primary flow: open full receive-funds screen (QR + copy address).
                  onClick={() => navigate('/deposit/receive-funds')}
                  className="group relative w-full overflow-hidden rounded-xl border border-transparent bg-[linear-gradient(180deg,var(--color-aurum)_0%,var(--color-aurum-muted)_100%)] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_18px_50px_-20px_rgba(201,171,122,0.45)] transition hover:brightness-[1.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurum/70"
                >
                  <span className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100" aria-hidden>
                    <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] motion-safe:group-hover:translate-x-full motion-safe:transition-transform motion-safe:duration-700" />
                  </span>
                  <span className="relative">Receive Funds</span>
                </button>
                <button
                  type="button"
                  // Secondary flow: direct users to dedicated gas-fee funding page.
                  onClick={() => navigate('/deposit/fund-gas-fee')}
                  className="w-full rounded-xl border border-white/16 bg-[linear-gradient(170deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_52%,rgba(34,211,238,0.06)_100%)] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-frost shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-white/30 hover:bg-white/8 hover:text-pearl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/25"
                >
                  Fund Gas Fee
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
