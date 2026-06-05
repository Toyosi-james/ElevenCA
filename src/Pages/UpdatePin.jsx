/**
 * UPDATE PIN PAGE (/settings/update-pin)
 *
 * Form: new PIN + confirm.
 * Backend developer: search "BACKEND INTEGRATION" in handleSubmit.
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeFooter from '../components/home/HomeFooter.jsx'
import HomeHeader from '../components/home/HomeHeader.jsx'
import { getAccessToken, getCsrfToken } from '../api/auth.js'
import axios from 'axios'

const SETTINGS_NAV_LINKS = [{ to: '/settings', label: 'Settings' }]

/** Static UI placeholder — replace via backend user fetch if needed for header */
const PLACEHOLDER_USER = { displayName: 'Client' }

export default function UpdatePin() {
  const navigate = useNavigate()
  useEffect(() => {
    if (!getAccessToken()) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const [user] = useState(PLACEHOLDER_USER)

  // --- Form state ---
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onLogout = () => {
    /*
     * BACKEND INTEGRATION — Logout
     * Optional: call backend logout endpoint here if required.
     * Then clear stored tokens: import { clearTokens } from '../api/auth.js'
     * clearTokens()
     */
    navigate('/login', { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // --- Validation ---
    if (!newPin || !confirmPin) {
      setError('Please fill in both PIN fields.')
      return
    }
    if (newPin !== confirmPin) {
      setError('PIN values do not match.')
      return
    }
    if (newPin.length < 4) {
      setError('PIN must be at least 4 characters.')
      return
    }

    // --- Payload sent to backend (see BACKEND INTEGRATION below) ---
    const updatePinPayload = {
      newPin,
      confirmPin,
    }

    // ======= CALL
    const token = getAccessToken()
    const csrfToken = getCsrfToken()
    const url = 'https://web3.elevenca.org/user_updatePIN'
    const updatePass = await axios.post(url, updatePinPayload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-csrf-token': `${csrfToken}`
      }
    })
    if (!updatePass.data) {
      throw new Error('Response Data Not Found')
    }
    setSuccess('PIN updated successfully')

    /*
     * ┌─────────────────────────────────────────────────────────────────
     * │ BACKEND INTEGRATION — Update PIN Mutation
     * ├─────────────────────────────────────────────────────────────────
     * │ Trigger:  form submit (handleSubmit), after validation passes
     * │ Input:    updatePinPayload  →  { newPin, confirmPin }
     * │           (confirmPin is frontend-only — do not send unless backend requires it)
     * │
     * │ Connect your backend PIN-update call here.
     * │ Read stored tokens from src/api/auth.js (getAccessToken, getCsrfToken)
     * │ if your backend requires them on the request.
     * │
     * │ On error:   setError(message from backend)
     * └─────────────────────────────────────────────────────────────────
     */
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-ink">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(201,171,122,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.014)_1px,transparent_1px)] bg-size-[80px_80px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,6,8,0.88)_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <HomeHeader displayName={user.displayName} avatarUrl={user.avatarUrl} onLogout={onLogout} navLinks={SETTINGS_NAV_LINKS} showActions={false} />

        <main className="w-full flex-1 px-4 pb-14 pt-8 sm:px-6 sm:pt-10 lg:px-10 lg:pt-12 xl:px-14">
          <header className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-aurum/90">Security</p>
            <h1 className="mt-2 font-serif text-[2rem] font-medium tracking-tight text-pearl sm:text-[2.35rem]">Update Pin</h1>
            <p className="mx-auto mt-3 max-w-xl text-[14px] font-light leading-relaxed text-mist/90">
              Change your transaction PIN to keep payments and transfers protected.
            </p>
            <div className="mx-auto mt-6 h-px w-full max-w-sm bg-[linear-gradient(90deg,transparent,rgba(201,171,122,0.45),transparent)]" />
          </header>

          <section className="mx-auto flex min-h-[54vh] max-w-xl items-center justify-center">
            <form
              onSubmit={handleSubmit}
              className="relative w-full max-w-md overflow-hidden rounded-[1.35rem] border border-white/12 bg-slate-elevated/45 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_45px_110px_-55px_rgba(0,0,0,0.92),0_0_90px_-42px_rgba(201,171,122,0.2)] backdrop-blur-2xl sm:p-8"
            >
              <div className="relative space-y-4">
                <div className="space-y-2">
                  <label htmlFor="new-pin" className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-mist">
                    Enter your new pin
                  </label>
                  <input
                    id="new-pin"
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full rounded-xl border border-white/12 bg-ink/55 px-4 py-3.5 text-[15px] tracking-wide text-pearl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition placeholder:text-mist/40 focus:border-aurum/50 focus:ring-2 focus:ring-aurum/18"
                    placeholder="New pin"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm-pin" className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-mist">
                    Confirm pin
                  </label>
                  <input
                    id="confirm-pin"
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    className="w-full rounded-xl border border-white/12 bg-ink/55 px-4 py-3.5 text-[15px] tracking-wide text-pearl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition placeholder:text-mist/40 focus:border-aurum/50 focus:ring-2 focus:ring-aurum/18"
                    placeholder="Confirm pin"
                  />
                </div>

                {error ? (
                  <p className="rounded-xl border border-red-500/25 bg-red-500/[0.07] px-4 py-3 text-[13px] text-red-200/95">{error}</p>
                ) : null}

                {success ? (
                  <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/9 px-4 py-3 text-[13px] text-emerald-100">{success}</p>
                ) : null}

                <button
                  type="submit"
                  className="w-full rounded-xl border border-transparent bg-[linear-gradient(180deg,var(--color-aurum)_0%,var(--color-aurum-muted)_100%)] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_16px_46px_-18px_rgba(201,171,122,0.4)] transition hover:brightness-[1.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurum/70"
                >
                  Update Pin
                </button>
              </div>
            </form>
          </section>
        </main>

        <HomeFooter />
      </div>
    </div>
  )
}
