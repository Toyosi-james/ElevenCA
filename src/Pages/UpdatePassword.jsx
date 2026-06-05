/**
 * UPDATE PASSWORD PAGE (/settings/update-password)
 *
 * Form: new password + confirm.
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

export default function UpdatePassword() {
  const navigate = useNavigate()
  useEffect(() => {
    if (!getAccessToken()) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const [user] = useState(PLACEHOLDER_USER)

  // --- Form state ---
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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
    setLoading(true)  // Also missing loading state

    // Validation...

    try {
      const token = getAccessToken()
      if (!token) {
        navigate('/login', { replace: true })
        return
      }

      const response = await axios.post(
        'https://web3.elevenca.org/user_updatePassword',
        { newPassword, confirmPassword },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-csrf-token': getCsrfToken()
          },
          timeout: 15000
        }
      )

      if (!response.data) {
        throw new Error('Empty response from server')
      }

      setSuccess('Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login', { replace: true })
        return
      }
      setError(err.response?.data?.message || err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
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
            <h1 className="mt-2 font-serif text-[2rem] font-medium tracking-tight text-pearl sm:text-[2.35rem]">Update Password</h1>
            <p className="mx-auto mt-3 max-w-xl text-[14px] font-light leading-relaxed text-mist/90">
              Set a new password to protect access to your account.
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
                  <label htmlFor="new-password" className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-mist">
                    Enter your new password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/12 bg-ink/55 px-4 py-3.5 text-[15px] tracking-wide text-pearl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition placeholder:text-mist/40 focus:border-aurum/50 focus:ring-2 focus:ring-aurum/18"
                    placeholder="New password"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-mist">
                    Confirm password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/12 bg-ink/55 px-4 py-3.5 text-[15px] tracking-wide text-pearl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition placeholder:text-mist/40 focus:border-aurum/50 focus:ring-2 focus:ring-aurum/18"
                    placeholder="Confirm password"
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
                  Update Password
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