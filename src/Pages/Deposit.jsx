/**
 * DEPOSIT PAGE (/deposit)
 *
 * Navigation hub only — no API calls on this page.
 * Routes to ReceiveFunds (GET /api/wallet/deposit-address) or
 * FundGasFee (GET /api/wallet/gas-fee-address).
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

export default function Deposit() {
  const navigate = useNavigate()
  // 
  useEffect(() => {
    if (!getAccessToken()) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const [user] = useState(readLoggedInUser)

  const onLogout = () => {
  localStorage.removeItem('accessToken')
  sessionStorage.removeItem('accessToken')

  // if you have refresh token too:
  localStorage.removeItem('refreshToken')

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
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-aurum/90">Treasury</p>
            <h1 className="mt-2 font-serif text-[2rem] font-medium tracking-tight text-pearl sm:text-[2.35rem]">Deposit</h1>
            <p className="mx-auto mt-3 max-w-xl text-[14px] font-light leading-relaxed text-mist/90">
              Choose an option to continue with your deposit action.
            </p>
          </header>

          <section className="mx-auto flex min-h-[54vh] max-w-xl items-center justify-center">
            <div className="relative w-full max-w-lg overflow-hidden rounded-[1.45rem] border border-white/12 bg-slate-elevated/45 p-6 backdrop-blur-2xl sm:p-8">
              <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => navigate('/deposit/receive-funds')} className="w-full rounded-xl bg-[linear-gradient(180deg,var(--color-aurum)_0%,var(--color-aurum-muted)_100%)] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink">
                  Receive Funds
                </button>
                <button type="button" onClick={() => navigate('/deposit/fund-gas-fee')} className="w-full rounded-xl border border-white/16 bg-white/5 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-frost">
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
