/**
 * Profile screen — shows account fields (name, email, address, etc.).
 * API: GET profile detail (default same path as /auth/me) via fetchProfileDetail().
 */

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeFooter from '../components/home/HomeFooter.jsx'
import { PROFILE_MOCK_DATA, fetchProfileDetail, profileInitialLetter } from '../lib/api/profile.js'
import { getUserSnapshot } from '../lib/session.js'

/**
 * @typedef {{
 *   firstName: string
 *   lastName: string
 *   email: string
 *   gender: string
 *   age: string
 *   country: string
 *   residentialAddress: string
 * }} ProfileCard
 */

const IconChevronLeft = () => (
  <svg className="h-5 w-5 text-aurum" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** @param {{ label: string; value: string; multiline?: boolean; className?: string }} props */
function ProfileRow({ label, value, multiline, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-[linear-gradient(165deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_48%,rgba(0,0,0,0.06)_100%)] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition duration-200 hover:border-aurum/28 hover:shadow-[0_0_32px_-18px_rgba(201,171,122,0.35)] sm:px-6 sm:py-6 ${className}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-mist/80">{label}</p>
      <p
        className={`mt-2 text-pearl ${multiline ? 'font-serif text-[1.0625rem] leading-relaxed tracking-[0.015em] text-pearl/95' : 'font-serif text-lg tracking-tight sm:text-xl'}`}
      >
        {value}
      </p>
    </div>
  )
}

function ProfileTileSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-5 sm:px-6">
      <div className="h-2.5 w-20 animate-pulse rounded bg-white/[0.08]" />
      <div className="mt-4 h-5 w-full max-w-[14rem] animate-pulse rounded-md bg-white/[0.05]" />
    </div>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const snapshot = getUserSnapshot()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(/** @type {ProfileCard | null} */ (null))

  useEffect(() => {
    const ac = new AbortController()
    const run = async () => {
      try {
        // API: GET profile (default /auth/me, or VITE_PROFILE_DETAIL_PATH)
        const { profile: p } = await fetchProfileDetail(ac.signal)
        if (!ac.signal.aborted) setProfile(p)
      } finally {
        if (!ac.signal.aborted) setLoading(false)
      }
    }
    run()
    return () => ac.abort()
  }, [])

  const letter = profile ? profileInitialLetter(profile, snapshot?.displayName) : PROFILE_MOCK_DATA.firstName.charAt(0).toUpperCase()
  const fullName =
    profile && profile.firstName !== '—' && profile.lastName !== '—'
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : profile && profile.firstName !== '—'
        ? profile.firstName
        : snapshot?.displayName ?? `${PROFILE_MOCK_DATA.firstName} ${PROFILE_MOCK_DATA.lastName}`

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-ink text-pearl">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_48%_at_50%_-18%,rgba(201,171,122,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_50%_105%,rgba(95,115,175,0.06),transparent)]" />
        <div className="absolute -left-1/4 top-[10%] h-[min(92vw,44rem)] w-[min(92vw,44rem)] rounded-full bg-[radial-gradient(circle_at_center,rgba(201,171,122,0.1),transparent_68%)] blur-3xl motion-safe:animate-aurora" />
        <div className="absolute -right-1/3 bottom-0 h-[min(105vw,38rem)] w-[min(105vw,38rem)] rounded-full bg-[radial-gradient(circle_at_center,rgba(95,115,175,0.08),transparent_70%)] blur-3xl motion-safe:animate-aurora-reverse" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.017)_1px,transparent_1px)] bg-size-[72px_72px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,6,8,0.9)_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col">
        <main className="w-full flex-1 px-5 pb-12 pt-6 sm:px-10 sm:pb-14 sm:pt-8 lg:px-14 xl:px-20 2xl:px-24">
          <nav className="mb-10 shrink-0 sm:mb-12">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="group inline-flex items-center gap-2.5 rounded-2xl border border-white/[0.09] bg-white/[0.04] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-mist shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-aurum/38 hover:bg-aurum/[0.09] hover:text-pearl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurum/55"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-aurum/28 bg-aurum/[0.08] transition group-hover:border-aurum/48 group-hover:bg-aurum/[0.12]">
                <IconChevronLeft />
              </span>
              Overview
            </button>
          </nav>

          <div className="motion-safe:animate-fade-up flex w-full flex-col gap-12 sm:gap-14">
            <header className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
              <div className="relative">
                <div
                  className="pointer-events-none absolute inset-[-18px] rounded-full bg-[radial-gradient(circle_at_center,rgba(201,171,122,0.22),transparent_72%)] opacity-90 blur-xl"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-[-3px] rounded-full border border-aurum/20 shadow-[0_0_40px_-8px_rgba(201,171,122,0.35)]"
                  aria-hidden
                />
                <div
                  className="relative flex h-[7.75rem] w-[7.75rem] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(155deg,rgba(218,188,140,0.55)_0%,rgba(201,171,122,0.28)_38%,rgba(12,14,20,0.98)_100%)] text-[3rem] font-medium tracking-tight text-pearl shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_20px_56px_-24px_rgba(201,171,122,0.5),inset_0_2px_0_rgba(255,255,255,0.14)] ring-[3px] ring-aurum/30 sm:h-[8.5rem] sm:w-[8.5rem] sm:text-[3.25rem]"
                  aria-hidden
                >
                  <span className="font-serif drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">{letter}</span>
                  <span className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_-14px_32px_rgba(0,0,0,0.42)]" />
                </div>
              </div>

              <p className="mt-9 text-[10px] font-semibold uppercase tracking-[0.34em] text-aurum sm:mt-11">Your profile</p>
              <h1 className="mt-2.5 max-w-2xl font-serif text-[1.8125rem] font-medium tracking-[0.02em] text-pearl sm:text-[2.125rem] md:text-[2.25rem]">
                {loading ? <span className="mx-auto inline-block h-9 w-56 animate-pulse rounded-lg bg-white/[0.07]" aria-hidden /> : fullName}
              </h1>
              <p className="mx-auto mt-3 max-w-md font-serif text-[0.9375rem] font-normal italic leading-snug text-mist/85">
                Account credentials and residence on file.
              </p>

              <div className="mx-auto mt-9 flex w-full max-w-md items-center gap-4 sm:mt-10">
                <div className="h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(201,171,122,0.42))]" />
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-aurum/35 bg-aurum/[0.08] shadow-[0_0_24px_-8px_rgba(201,171,122,0.45)]">
                  <span className="h-1.5 w-1.5 rotate-45 rounded-[1px] bg-aurum/90 shadow-[0_0_10px_rgba(201,171,122,0.6)]" aria-hidden />
                </div>
                <div className="h-px flex-1 bg-[linear-gradient(270deg,transparent,rgba(201,171,122,0.42))]" />
              </div>
            </header>

            <div className="min-w-0 w-full">
              <div className="rounded-[1.25rem] bg-[linear-gradient(128deg,rgba(201,171,122,0.24)_0%,rgba(255,255,255,0.06)_42%,rgba(201,171,122,0.1)_100%)] p-[1px] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_40px_100px_-52px_rgba(0,0,0,0.92),0_0_140px_-52px_rgba(201,171,122,0.16)]">
                <section
                  className="relative overflow-hidden rounded-[1.1875rem] border border-white/[0.07] bg-slate-elevated/[0.42] px-5 py-8 backdrop-blur-2xl sm:px-9 sm:py-10 lg:px-11 lg:py-11"
                  aria-label="Account details"
                >
                  <div
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_48%_at_50%_-12%,rgba(201,171,122,0.09),transparent)]"
                    aria-hidden
                  />
                  <span className="pointer-events-none absolute left-6 top-6 block h-10 w-10 border-l border-t border-aurum/25 sm:left-8 sm:top-8" aria-hidden />
                  <span className="pointer-events-none absolute bottom-6 right-6 block h-10 w-10 border-b border-r border-aurum/25 sm:bottom-8 sm:right-8" aria-hidden />

                  <div className="relative mb-8 border-b border-white/[0.06] pb-8 sm:mb-9 sm:pb-9">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-aurum/95">Registry</p>
                    <h2 className="mt-2 font-serif text-xl font-medium tracking-tight text-pearl sm:text-2xl">Identity & contact</h2>
                    <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-mist/78">
                      Verified particulars associated with your vault session. Updates follow custodial policy.
                    </p>
                  </div>

                  {loading ? (
                    <div className="relative grid gap-4 sm:grid-cols-2 sm:gap-5">
                      {[1, 2, 3, 4, 5, 6, 7].map((k) => (
                        <ProfileTileSkeleton key={k} />
                      ))}
                    </div>
                  ) : profile ? (
                    <div className="relative grid gap-4 sm:grid-cols-2 sm:gap-5">
                      <ProfileRow label="First name" value={profile.firstName} />
                      <ProfileRow label="Last name" value={profile.lastName} />
                      <ProfileRow label="Email address" value={profile.email} className="sm:col-span-2" />
                      <ProfileRow label="Gender" value={profile.gender} />
                      <ProfileRow label="Age" value={profile.age} />
                      <ProfileRow label="Country" value={profile.country} className="sm:col-span-2" />
                      <ProfileRow label="Residential address" value={profile.residentialAddress} multiline className="sm:col-span-2" />
                    </div>
                  ) : null}
                </section>
              </div>
            </div>
          </div>
        </main>

        <HomeFooter />
      </div>
    </div>
  )
}
