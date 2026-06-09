/**
 * FUND GAS FEE PAGE (/deposit/fund-gas-fee)
 *
 * Shows QR code + wallet address for gas fee payments (linked from Withdraw flow).
 * Search "BACKEND INTEGRATION" for GET /api/wallet/gas-fee-address.
 */

import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useNavigate } from 'react-router-dom'
import HomeFooter from '../components/home/HomeFooter.jsx'
import HomeHeader from '../components/home/HomeHeader.jsx'
import { useEffect } from 'react'
import { getAccessToken } from '../api/auth.js'


const SESSION_KEY = 'eleven_user'
const FUND_GAS_FEE_NAV_LINKS = [{ to: '/deposit', label: 'Deposit' }]

const envAddress = import.meta.env.VITE_DEPOSIT_WALLET_ADDRESS
const DEFAULT_WALLET = '1HSfux5PjEEzLW1wPb5FUAJSzKCsFhxcKr'

/*
 * ┌─────────────────────────────────────────────────────────────────
 * │ BACKEND INTEGRATION — Gas fee funding address
 * ├─────────────────────────────────────────────────────────────────
 * │ Trigger:  page mount (useEffect) — may include ?requestId= from withdraw flow
 * │ Method:   GET
 * │ URL:      /api/wallet/gas-fee-address
 * │ Auth:     Authorization: Bearer <accessToken>
 * │
 * │ Response: { address: string, network: string, label: string }
 * │ Wire to:  setGasFeeAddress(data) — replace SAMPLE_GAS_FEE_ADDRESS below
 * │
 * │ Related:  POST /api/wallet/withdraw (Withdraw.jsx) returns requestId + requiredGasFeeUsd
 * │
 * │ DEMO ONLY: hardcoded SAMPLE_GAS_FEE_ADDRESS
 * └─────────────────────────────────────────────────────────────────
 */
const SAMPLE_GAS_FEE_ADDRESS = {
  address: envAddress && String(envAddress).trim() !== '' ? String(envAddress).trim() : DEFAULT_WALLET,
  network: 'Bitcoin',
  label: 'Gas fee funding address',
}

function readLoggedInUser() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return { displayName: 'Client' }
}

const IconCopy = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d="M8 7h11v11M8 7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V9a2 2 0 00-2-2M8 7V5a2 2 0 012-2h11a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconCheck = () => (
  <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false)
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return Promise.resolve(ok)
  } catch {
    return Promise.resolve(false)
  }
}

export default function FundGasFee() {
  const navigate = useNavigate()
  // 
  useEffect(() => {
    if (!getAccessToken()) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const [user] = useState(readLoggedInUser)
  const [copied, setCopied] = useState(false)

  const address = SAMPLE_GAS_FEE_ADDRESS.address

  const handleCopy = () => {
    if (!address) return
    copyToClipboard(address).then((ok) => {
      if (!ok) return
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    })
  }

  const onLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
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
        <HomeHeader displayName={user.displayName} avatarUrl={user.avatarUrl} onLogout={onLogout} navLinks={FUND_GAS_FEE_NAV_LINKS} showActions={false} />

        <main className="w-full flex-1 px-4 pb-10 pt-14 sm:px-6 sm:pb-12 sm:pt-17 lg:px-10 lg:pt-20 xl:px-14">
          <div className="mx-auto max-w-lg">
            <div className="mb-10 text-center sm:mb-12">
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-aurum/90">Treasury</p>
              <h1 className="mt-3 font-serif text-[2rem] font-medium tracking-tight text-pearl sm:text-[2.35rem]">Fund gas fee</h1>
              <p className="mx-auto mt-4 max-w-md text-[14px] font-light leading-relaxed text-mist/90">
                Send funds to this wallet address to cover your required network gas fee.
              </p>
            </div>

            <section className="relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-slate-elevated/45 p-px shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_50px_120px_-50px_rgba(0,0,0,0.82),0_0_120px_-48px_rgba(201,171,122,0.14)] backdrop-blur-2xl">
              <div className="relative overflow-hidden rounded-[calc(1.35rem-1px)] bg-[linear-gradient(155deg,rgba(255,255,255,0.055)_0%,transparent_40%,rgba(201,171,122,0.05)_100%)] px-6 py-10 sm:px-10 sm:py-12">
                <div className="relative flex flex-col items-center">
                  <div className="mb-6 flex flex-wrap justify-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-frost/90">
                      {SAMPLE_GAS_FEE_ADDRESS.network}
                    </span>
                    <span className="rounded-full border border-aurum/25 bg-aurum/6 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-aurum/95">
                      {SAMPLE_GAS_FEE_ADDRESS.label}
                    </span>
                  </div>

                  <div className="relative rounded-[1.35rem] border border-white/20 bg-white p-5 shadow-[0_24px_80px_-28px_rgba(0,0,0,0.85)] sm:p-6">
                    <QRCodeSVG value={address} size={248} level="M" includeMargin={false} bgColor="#ffffff" fgColor="#0f172a" />
                  </div>

                  <p className="mt-6 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-mist/75">Scan to fund gas fee</p>

                  <div className="mt-8 w-full max-w-md">
                    <label htmlFor="fund-gas-fee-address-readonly" className="sr-only">Gas fee wallet address</label>
                    <div className="flex items-start justify-center gap-3 rounded-2xl border border-white/10 bg-ink/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-5">
                      <output id="fund-gas-fee-address-readonly" className="min-w-0 flex-1 break-all text-center font-mono text-[13px] leading-relaxed text-pearl sm:text-[14px]">
                        {address}
                      </output>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-aurum/40 bg-[linear-gradient(180deg,rgba(201,171,122,0.18)_0%,rgba(201,171,122,0.06)_100%)] text-aurum shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition hover:border-aurum/60 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurum/55"
                        aria-label={copied ? 'Copied' : 'Copy gas fee wallet address'}
                      >
                        {copied ? <IconCheck /> : <IconCopy />}
                      </button>
                    </div>
                    {copied ? (
                      <p className="mt-3 text-center text-[12px] font-medium tracking-wide text-emerald-300/95">Copied to clipboard</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>

        <HomeFooter />
      </div>
    </div>
  )
}
