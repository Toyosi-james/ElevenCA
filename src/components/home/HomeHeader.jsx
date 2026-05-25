/**
 * Top bar on dashboard-style pages: greeting, nav links, profile / notifications / settings / logout.
 * Logout clears sessionStorage and sends user to /login (no API call unless you add one).
 */

import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

function greetingForHour(date) {
  const h = date.getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

/** @param {{ onLogout: () => void; onProfile: () => void; onNotifications: () => void; onSettings: () => void }} props */
function HeaderActions({ onLogout, onProfile, onNotifications, onSettings }) {
  return (
    <>
      <button
        type="button"
        onClick={onProfile}
        className="hidden items-center gap-2 rounded-xl border border-aurum/35 bg-aurum/[0.08] px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-pearl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-aurum/55 hover:bg-aurum/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurum/60 sm:flex"
        aria-label="Profile"
      >
        <svg className="h-4 w-4 text-aurum" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Profile
      </button>

      <button
        type="button"
        onClick={onProfile}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-aurum/30 bg-aurum/[0.07] text-aurum transition hover:border-aurum/50 hover:bg-aurum/[0.11] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurum/60 sm:hidden"
        aria-label="Profile"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>

      <button
        type="button"
        onClick={onNotifications}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-mist transition hover:border-white/18 hover:bg-white/[0.06] hover:text-pearl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurum/50"
        aria-label="Open notifications"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0h6Z" strokeLinejoin="round" />
        </svg>
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-aurum shadow-[0_0_10px_rgba(201,171,122,0.75)]" aria-hidden />
      </button>

      <button
        type="button"
        onClick={onSettings}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-mist transition hover:border-white/18 hover:bg-white/[0.06] hover:text-pearl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurum/50"
        aria-label="Open settings"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.723 6.723 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.248a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        type="button"
        onClick={onLogout}
        className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-mist transition hover:border-white/18 hover:bg-white/[0.06] hover:text-pearl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurum/55 sm:px-4"
      >
        <svg className="h-4 w-4 text-aurum/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="hidden sm:inline">Log out</span>
      </button>
    </>
  )
}

/**
 * @param {{
 *   displayName: string
 *   avatarUrl?: string
 *   onLogout: () => void
 *   navLinks?: { to: string; label: string }[]
 *   showActions?: boolean
 * }} props
 */
export default function HomeHeader({ displayName, avatarUrl, onLogout, navLinks, showActions = true }) {
  const navigate = useNavigate()
  const goProfile = () => navigate('/profile')
  const goNotifications = () => navigate('/notifications')
  const goSettings = () => navigate('/settings')
  const greeting = greetingForHour(new Date())
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 2) || '•'

  const navClass = ({ isActive }) =>
    `group relative overflow-hidden rounded-xl px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurum/55 ${
      isActive
        ? 'border border-aurum/45 bg-[linear-gradient(180deg,rgba(201,171,122,0.2)_0%,rgba(201,171,122,0.08)_100%)] text-pearl shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_18px_50px_-22px_rgba(201,171,122,0.5)]'
        : 'border border-white/[0.08] bg-white/[0.03] text-mist hover:border-aurum/30 hover:bg-white/[0.07] hover:text-pearl'
    }`

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/6 bg-ink/80 backdrop-blur-2xl">
      <div className="flex w-full flex-col gap-3 px-4 py-3.5 sm:px-6 sm:py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-10 xl:px-14">
        <div className="flex items-center justify-between gap-3 lg:min-w-0 lg:max-w-md lg:flex-initial">
          <button
            type="button"
            onClick={goProfile}
            className="group flex min-w-0 max-w-[65%] flex-1 items-center gap-3 rounded-2xl py-1.5 pl-1.5 pr-3 text-left transition hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurum/55 sm:max-w-none sm:flex-initial sm:gap-4 sm:pl-2 sm:pr-4"
            aria-label="Open profile"
          >
            <div className="relative shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-12 w-12 rounded-full border-2 border-aurum/35 object-cover shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_12px_40px_-12px_rgba(201,171,122,0.35)] ring-2 ring-aurum/15 transition group-hover:border-aurum/55 sm:h-14 sm:w-14"
                />
              ) : (
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-aurum/40 bg-[linear-gradient(145deg,rgba(201,171,122,0.42),rgba(12,14,20,0.96))] text-sm font-semibold tracking-wide text-pearl shadow-[0_0_32px_rgba(201,171,122,0.2)] ring-2 ring-aurum/20 transition group-hover:border-aurum/60 sm:h-14 sm:w-14 sm:text-base"
                  aria-hidden
                >
                  {initials}
                </div>
              )}
              <span
                className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-ink bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                title="Session active"
                aria-hidden
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-aurum/90">Profile</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-mist/85">{greeting}</p>
              <p className="truncate font-serif text-lg font-medium tracking-tight text-pearl sm:text-xl">{displayName}</p>
            </div>
          </button>

          {showActions ? (
            <div className="flex shrink-0 items-center gap-2 sm:gap-2.5 lg:hidden">
              <HeaderActions
                onLogout={onLogout}
                onProfile={goProfile}
                onNotifications={goNotifications}
                onSettings={goSettings}
              />
            </div>
          ) : null}
        </div>

        {navLinks && navLinks.length > 0 ? (
          <nav
            className={`ml-auto flex w-full flex-wrap justify-end gap-2 border-t border-white/[0.07] pt-3 lg:w-auto lg:border-t-0 lg:pt-0 ${
              showActions ? 'lg:flex-1' : ''
            }`}
            aria-label="Primary navigation"
          >
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} className={navClass} end={to === '/home'}>
                {label}
              </NavLink>
            ))}
          </nav>
        ) : null}

        {showActions ? (
          <div className="hidden shrink-0 items-center gap-2 sm:gap-2.5 lg:flex">
            <HeaderActions
              onLogout={onLogout}
              onProfile={goProfile}
              onNotifications={goNotifications}
              onSettings={goSettings}
            />
          </div>
        ) : null}
      </div>
    </header>
  )
}
