/**
 * UPDATE PASSWORD PAGE (/settings/update-password)
 *
 * Form: new password + confirm. Search "BACKEND INTEGRATION" in handleSubmit.
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeFooter from '../components/home/HomeFooter.jsx'
import HomeHeader from '../components/home/HomeHeader.jsx'

const SESSION_KEY = 'eleven_user'
const SETTINGS_NAV_LINKS = [{ to: '/settings', label: 'Settings' }]

function readLoggedInUser() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return { displayName: 'Client' }
}

export default function UpdatePassword() {
  const navigate = useNavigate()
  const [user] = useState(readLoggedInUser)

  // --- Form state ---
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    navigate('/login', { replace: true })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // --- Validation ---
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    // --- Payload sent to backend (see BACKEND INTEGRATION below) ---
    const updatePasswordPayload = {
      newPassword,
      confirmPassword,
    }

    /*
     * ┌─────────────────────────────────────────────────────────────────
     * │ BACKEND INTEGRATION — Update account password
     * ├─────────────────────────────────────────────────────────────────
     * │ Trigger:  form submit (handleSubmit)
     * │ Method:   PUT
     * │ URL:      /api/user/password
     * │ Auth:     Authorization: Bearer <accessToken>
     * │ Body:     { password: updatePasswordPayload.newPassword }
     * │           (confirmPassword is frontend-only validation — do not send)
     * │
     * │ Success:  204 No Content or { message: 'Password updated' }
     * │ On success: setSuccess('Password updated successfully'); clear form fields
     * │ On error:   setError(message from response)
     * │
     * │ DEMO ONLY below — shows success without calling the server
     * └─────────────────────────────────────────────────────────────────
     */
    setSuccess('Password updated successfully')
    setNewPassword('')
    setConfirmPassword('')
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
