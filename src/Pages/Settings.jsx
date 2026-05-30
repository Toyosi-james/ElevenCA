/**
 * SETTINGS PAGE (/settings)
 *
 * Navigation hub only — no API calls on this page.
 * Routes to UpdatePassword (PUT /api/user/password) and UpdatePin (PUT /api/user/pin).
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeFooter from '../components/home/HomeFooter.jsx'
import HomeHeader from '../components/home/HomeHeader.jsx'

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

export default function Settings() {
  const navigate = useNavigate()
  const [user] = useState(readLoggedInUser)

  const onLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    navigate('/login', { replace: true })
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-ink">
      <div className="relative z-10 flex min-h-screen flex-col">
        <HomeHeader displayName={user.displayName} avatarUrl={user.avatarUrl} onLogout={onLogout} navLinks={[{ to: '/home', label: 'Overview' }]} showActions={false} />

        <main className="w-full flex-1 px-4 pb-14 pt-8 sm:px-6 sm:pt-10 lg:px-10 lg:pt-12 xl:px-14">
          <header className="mx-auto max-w-2xl text-center">
            <h1 className="font-serif text-[2rem] font-medium tracking-tight text-pearl sm:text-[2.35rem]">Settings</h1>
          </header>

          <section className="mx-auto mt-10 flex max-w-md flex-col gap-4">
            <button type="button" onClick={() => navigate('/settings/update-password')} className="w-full rounded-xl bg-[linear-gradient(180deg,var(--color-aurum)_0%,var(--color-aurum-muted)_100%)] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink">
              Update Password
            </button>
            <button type="button" onClick={() => navigate('/settings/update-pin')} className="w-full rounded-xl border border-white/14 bg-white/3 px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-frost">
              Update Pin
            </button>
          </section>
        </main>

        <HomeFooter />
      </div>
    </div>
  )
}
