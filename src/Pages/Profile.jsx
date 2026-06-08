/**
 * PROFILE PAGE (/profile)
 *
 * Read-only account details.
 */

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeFooter from '../components/home/HomeFooter.jsx'
import { getAccessToken, clearTokens } from '../api/auth.js'
import axios from 'axios'

const IconChevronLeft = () => (
  <svg className="h-5 w-5 text-aurum" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function ProfileRow({ label, value, multiline, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/[0.08] bg-[linear-gradient(165deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_48%,rgba(0,0,0,0.06)_100%)] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition duration-200 hover:border-aurum/28 hover:shadow-[0_0_32px_-18px_rgba(201,171,122,0.35)] sm:px-6 sm:py-6 ${className}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-mist/80">{label}</p>
      <p className={`mt-2 text-pearl ${multiline ? 'font-serif text-[1.0625rem] leading-relaxed tracking-[0.015em] text-pearl/95' : 'font-serif text-lg tracking-tight sm:text-xl'}`}>
        {value || <span className="text-mist/40 italic">Not provided</span>}
      </p>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(7)].map((_, i) => (
        <div key={i} className={`h-24 rounded-2xl bg-white/5 ${[2, 4, 6].includes(i) ? 'sm:col-span-2' : ''}`} />
      ))}
    </div>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const token = getAccessToken()
      
      if (!token) {
        navigate('/login', { replace: true })
        return
      }

      try {
      
        const response = await axios.get(
          'https://api.elevenca.org/elevenCA/client_profile',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              
            },
            timeout: 10000
          }
        )

        if (!response.data) {
          throw new Error('Empty response from server')
        }

        setProfile(response.data)
      } catch (err) {
        console.error('Profile fetch failed:', err)
        
        if (err.response?.status === 401) {
          clearTokens()
          navigate('/login', { replace: true })
          return
        }

        setError(err.response?.data?.message || err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  const letter = profile?.firstName?.charAt(0).toUpperCase() || '?'
  const fullName = profile 
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() 
    : 'Loading...'

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-ink text-pearl">
      {/* Background layers */}
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
                <div className="relative flex h-[7.75rem] w-[7.75rem] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(155deg,rgba(218,188,140,0.55)_0%,rgba(201,171,122,0.28)_38%,rgba(12,14,20,0.98)_100%)] text-[3rem] font-medium tracking-tight text-pearl shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_20px_56px_-24px_rgba(201,171,122,0.5),inset_0_2px_0_rgba(255,255,255,0.14)] ring-[3px] ring-aurum/30 sm:h-[8.5rem] sm:w-[8.5rem] sm:text-[3.25rem]">
                  <span className="font-serif drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">{letter}</span>
                </div>
              </div>

              <p className="mt-9 text-[10px] font-semibold uppercase tracking-[0.34em] text-aurum sm:mt-11">Your profile</p>
              <h1 className="mt-2.5 max-w-2xl font-serif text-[1.8125rem] font-medium tracking-[0.02em] text-pearl sm:text-[2.125rem] md:text-[2.25rem]">
                {fullName}
              </h1>
            </header>

            <div className="min-w-0 w-full">
              <div className="rounded-[1.25rem] bg-[linear-gradient(128deg,rgba(201,171,122,0.24)_0%,rgba(255,255,255,0.06)_42%,rgba(201,171,122,0.1)_100%)] p-[1px] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_40px_100px_-52px_rgba(0,0,0,0.92),0_0_140px_-52px_rgba(201,171,122,0.16)]">
                <section className="relative overflow-hidden rounded-[1.1875rem] border border-white/[0.07] bg-slate-elevated/[0.42] px-5 py-8 backdrop-blur-2xl sm:px-9 sm:py-10 lg:px-11 lg:py-11" aria-label="Account details">
                  <div className="relative mb-8 border-b border-white/[0.06] pb-8 sm:mb-9 sm:pb-9">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-aurum/95">Registry</p>
                    <h2 className="mt-2 font-serif text-xl font-medium tracking-tight text-pearl sm:text-2xl">Identity & contact</h2>
                  </div>

                  {loading ? (
                    <ProfileSkeleton />
                  ) : error ? (
                    <div className="rounded-xl border border-red-500/25 bg-red-500/[0.07] px-4 py-3 text-[13px] text-red-200/95">
                      {error}
                      <button 
                        onClick={() => window.location.reload()} 
                        className="ml-4 text-aurum underline"
                      >
                        Retry
                      </button>
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