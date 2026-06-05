/**
 * LOGIN PAGE (/login)
 *
 * Form fields: username, asset PIN, password.
 * Backend developer: connect login in handleSubmit (search "BACKEND INTEGRATION").
 */

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAccessToken, saveTokens } from '../api/auth.js'
import axios from 'axios'

const BRAND = 'ElevenCA'

const Mark = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M8 36V12L24 4l16 8v24L24 44 8 36Z"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinejoin="round"
      className="opacity-95"
    />
    <path
      d="M24 4v20M8 12l16 12 16-12M16 20v16M32 20v16"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      className="opacity-45"
    />
  </svg>
)

const BrandLockup = () => (
  <div className="absolute left-0 top-0 z-20 max-w-[min(18rem,calc(100vw-5.5rem))] px-4 pt-5 text-left sm:max-w-none sm:px-6 sm:pt-6">
    <div className="flex items-center gap-3 sm:gap-3.5">
      <Mark className="h-9 w-9 shrink-0 text-aurum drop-shadow-[0_0_20px_var(--color-aurum-glow)] sm:h-10 sm:w-10" />
      <div className="min-w-0 border-l border-aurum/35 pl-3 sm:pl-3.5">
        <p
          className="font-display text-[1.5625rem] font-semibold leading-[1.05] tracking-[-0.035em] text-pearl sm:text-[1.6875rem]"
          aria-label={BRAND}
        >
          <span className="text-pearl">Eleven</span>
          <span className="bg-[linear-gradient(135deg,var(--color-aurum)_0%,#e4d4b8_42%,var(--color-aurum-muted)_78%,var(--color-aurum)_100%)] bg-clip-text text-transparent">
            CA
          </span>
        </p>
        <p className="mt-1.5 max-w-[13rem] font-sans text-[9px] font-medium uppercase leading-relaxed tracking-[0.26em] text-mist/80 sm:mt-2 sm:max-w-[15rem] sm:text-[10px] sm:tracking-[0.28em]">
          <span className="text-mist/92">Reseves</span>
          <span className="mx-1.5 text-aurum/35 sm:mx-2" aria-hidden>
            ·
          </span>
          <span className="text-mist/92">Crypto</span>
          <span className="mx-1.5 text-aurum/35 sm:mx-2" aria-hidden>
            ·
          </span>
          <span className="text-mist/92">Investment</span>
        </p>
      </div>
    </div>
  </div>
)

const Spinner = () => (
  <svg
    className="h-[1.125rem] w-[1.125rem] animate-spin text-ink/80"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
    />
    <path
      className="opacity-90"
      d="M4 12a8 8 0 018-8"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
)

const Login = () => {
  const navigate = useNavigate()
  // --- Form state → assembled into loginPayload on submit ---
  const [assetPin, setAssetPin] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showAssetPin, setShowAssetPin] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  /** @type {[string | null, React.Dispatch<React.SetStateAction<string | null>>]} */
  const [formError, setFormError] = useState(null)
  /** @type {[Record<string, string>, React.Dispatch<React.SetStateAction<Record<string, string>>>]} */
  const [fieldErrors, setFieldErrors] = useState({})

  // Skip login screen when an access token is already stored
  useEffect(() => {
    if (getAccessToken()) {
      navigate('/home', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    const previous = document.title
    document.title = `Sign in · ${BRAND}`
    return () => {
      document.title = previous
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    setFieldErrors({})

    const trimmedPin = assetPin.trim()
    const trimmedUser = username.trim()

    // --- Validation ---
    if (!trimmedUser) {
      setFieldErrors((prev) => ({ ...prev, username: 'Username is required.' }))
      return
    }
    if (!trimmedPin) {
      setFieldErrors((prev) => ({ ...prev, assetPin: 'Asset PIN is required.' }))
      return
    }
    if (!password) {
      setFieldErrors((prev) => ({ ...prev, password: 'Password is required.' }))
      return
    }

    const loginPayload = {
      username: trimmedUser,
      assetPin: trimmedPin,
      password,
    }

    setLoading(true)

    try {
      // ====
       const url = 'https://web3.elevenca.org/client_login'
      const loginUser = await axios.post(url, loginPayload, {headers: {
        'Content-Type': 'application/json'
      }})
      if(!loginUser.data){throw new Error('No Login Response Found')}
      
      saveTokens({
        accessToken: loginUser.data.accessToken,
        csrfToken: loginUser.data.csrfToken,
      })
       
      // ====
       
      navigate('/home', { replace: true })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 sm:px-6"
      role="main"
      aria-label={`${BRAND} client sign-in`}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-25%,rgba(201,171,122,0.16),transparent)]" />
        <div className="absolute -left-1/3 top-[18%] h-[min(92vw,44rem)] w-[min(92vw,44rem)] rounded-full bg-[radial-gradient(circle_at_center,rgba(201,171,122,0.11),transparent_68%)] blur-3xl motion-safe:animate-aurora" />
        <div className="absolute -right-1/4 bottom-[-8%] h-[min(105vw,38rem)] w-[min(105vw,38rem)] rounded-full bg-[radial-gradient(circle_at_center,rgba(95,115,175,0.09),transparent_72%)] blur-3xl motion-safe:animate-aurora-reverse" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-size-[80px_80px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,6,8,0.82)_100%)]" />
      </div>

      <BrandLockup />

      <div
        className="relative z-10 w-full max-w-md pt-12 motion-safe:animate-fade-up sm:pt-14"
        style={{ animationDelay: '40ms' }}
      >
        <header className="mb-6 text-center sm:mb-7">
          <h1 className="font-display text-[1.5rem] font-semibold tracking-[-0.03em] text-pearl sm:text-[1.625rem]">
            Welcome back
          </h1>
          <p className="mx-auto mt-2 max-w-[21rem] font-sans text-[0.9375rem] font-normal leading-relaxed text-mist/88 sm:text-[1rem]">
            Enter your username, asset PIN, and password to continue.
          </p>
          <div className="mx-auto mt-6 flex max-w-[17rem] items-center gap-3 sm:mt-7">
            <div className="h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(201,171,122,0.38))]" />
            <div className="h-1 w-1 shrink-0 rotate-45 border border-aurum/35 bg-ink/30 shadow-[0_0_14px_rgba(201,171,122,0.22)]" />
            <div className="h-px flex-1 bg-[linear-gradient(270deg,transparent,rgba(201,171,122,0.38))]" />
          </div>
        </header>

        <div className="rounded-[1.125rem] bg-[linear-gradient(135deg,rgba(201,171,122,0.22),rgba(255,255,255,0.05)_45%,rgba(201,171,122,0.1))] p-px shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_40px_100px_-48px_rgba(0,0,0,0.9),0_0_140px_-50px_rgba(201,171,122,0.12)]">
          <form
            onSubmit={handleSubmit}
            aria-busy={loading}
            aria-label={`${BRAND} sign-in form`}
            className="relative overflow-hidden rounded-[1.0625rem] border border-white/[0.06] bg-slate-elevated/[0.42] px-8 py-9 backdrop-blur-2xl sm:px-10 sm:py-10"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_40%_at_50%_-10%,rgba(201,171,122,0.06),transparent)]"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute left-5 top-5 block h-9 w-9 border-l border-t border-aurum/20"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute bottom-5 right-5 block h-9 w-9 border-b border-r border-aurum/20"
              aria-hidden
            />

            <div className="relative space-y-5">
              {formError ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/25 bg-red-500/[0.07] px-4 py-3 text-[13px] leading-snug text-red-200/95"
                >
                  {formError}
                </div>
              ) : null}

              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-mist"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  disabled={loading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.username)}
                  aria-describedby={fieldErrors.username ? 'username-error' : undefined}
                  className="w-full rounded-xl border border-white/10 bg-ink/55 px-4 py-3.5 text-[15px] tracking-wide text-pearl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition placeholder:text-mist/40 focus:border-aurum/50 focus:ring-2 focus:ring-aurum/18 disabled:cursor-not-allowed disabled:opacity-55"
                  placeholder="Username"
                />
                {fieldErrors.username ? (
                  <p id="username-error" className="text-[12px] text-red-300/90">
                    {fieldErrors.username}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="assetPin"
                  className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-mist"
                >
                  Asset PIN
                </label>
                <div className="relative">
                  <input
                    id="assetPin"
                    name="assetPin"
                    type={showAssetPin ? 'text' : 'password'}
                    autoComplete="off"
                    disabled={loading}
                    value={assetPin}
                    onChange={(e) => setAssetPin(e.target.value)}
                    aria-invalid={Boolean(fieldErrors.assetPin)}
                    aria-describedby={fieldErrors.assetPin ? 'assetPin-error' : undefined}
                    className="w-full rounded-xl border border-white/10 bg-ink/55 py-3.5 pl-4 pr-12 text-[15px] tracking-wide text-pearl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition placeholder:text-mist/40 focus:border-aurum/50 focus:ring-2 focus:ring-aurum/18 disabled:cursor-not-allowed disabled:opacity-55"
                    placeholder="••••••"
                  />
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShowAssetPin((s) => !s)}
                    className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-mist transition hover:bg-white/[0.04] hover:text-pearl disabled:pointer-events-none"
                    aria-label={showAssetPin ? 'Hide asset PIN' : 'Show asset PIN'}
                  >
                    {showAssetPin ? (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                        <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A10.4 10.4 0 0112 5c4.5 0 8.2 3 10 7a10.7 10.7 0 01-4.1 5.1M6.2 6.2C4.3 7.7 3 9.7 2 12c1.8 4 5.5 7 10 7 1.1 0 2.2-.2 3.2-.5" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.assetPin ? (
                  <p id="assetPin-error" className="text-[12px] text-red-300/90">
                    {fieldErrors.assetPin}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-mist"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    className="w-full rounded-xl border border-white/10 bg-ink/55 py-3.5 pl-4 pr-12 text-[15px] tracking-wide text-pearl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition placeholder:text-mist/40 focus:border-aurum/50 focus:ring-2 focus:ring-aurum/18 disabled:cursor-not-allowed disabled:opacity-55"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-mist transition hover:bg-white/[0.04] hover:text-pearl disabled:pointer-events-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                        <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A10.4 10.4 0 0112 5c4.5 0 8.2 3 10 7a10.7 10.7 0 01-4.1 5.1M6.2 6.2C4.3 7.7 3 9.7 2 12c1.8 4 5.5 7 10 7 1.1 0 2.2-.2 3.2-.5" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.password ? (
                  <p id="password-error" className="text-[12px] text-red-300/90">
                    {fieldErrors.password}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative mt-1 w-full overflow-hidden rounded-xl bg-[linear-gradient(180deg,var(--color-aurum)_0%,var(--color-aurum-muted)_100%)] py-3.5 text-[14px] font-semibold uppercase tracking-[0.2em] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] transition hover:brightness-[1.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurum/70 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-65"
              >
                <span className="relative z-10 inline-flex items-center justify-center gap-2.5">
                  {loading ? (
                    <>
                      <Spinner />
                      Signing in
                    </>
                  ) : (
                    'Continue'
                  )}
                </span>
                <span
                  className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 group-disabled:opacity-0"
                  aria-hidden
                >
                  <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] motion-safe:group-hover:translate-x-full motion-safe:transition-transform motion-safe:duration-700" />
                </span>
              </button>

              <p className="pt-1 text-center">
                <a
                  href="#"
                  onClick={(ev) => ev.preventDefault()}
                  className="text-[12px] font-medium tracking-wide text-mist/85 underline-offset-4 transition hover:text-aurum hover:underline"
                >
                  Forgot password
                </a>
              </p>
            </div>
          </form>
        </div>

        <p className="mx-auto mt-8 max-w-sm text-center text-[10px] font-normal uppercase tracking-[0.18em] text-mist/60 sm:mt-9">
          {BRAND} · TLS 1.3 · Passkeys · Device alerts
        </p>
      </div>
    </div>
  )
}

export default Login
