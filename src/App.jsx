/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ElevenCA — FRONTEND HANDOFF / API INTEGRATION GUIDE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This app is UI-only. Every backend hook is marked with:
 *   "BACKEND INTEGRATION"  (search the repo for this string)
 *
 * ─── AUTH & SESSION (used on every protected page) ───────────────────────────
 * Demo storage key: sessionStorage['eleven_user']  →  { displayName, email?, avatarUrl? }
 * Production:       store accessToken from POST /api/auth/login; send on every request:
 *                   Authorization: Bearer <accessToken>
 *
 * ─── API ENDPOINT MAP ─────────────────────────────────────────────────────────
 *
 *  Route                      File                         Method  Endpoint
 *  ─────────────────────────  ───────────────────────────  ──────  ─────────────────────────────────────
 *  /login                     Pages/Login.jsx                POST    /api/auth/login
 *  /home                      Pages/Home.jsx                 GET     /api/auth/me
 *                                                            GET     /api/wallet/summary
 *                                                            GET     /api/markets/flow?range=1d|7d|30d
 *                                                            GET     /api/wallet/transactions?page=&limit=
 *  /exchange                  Pages/Exchange.jsx             GET     /api/wallet/summary
 *                                                            POST    /api/wallet/exchange/quote
 *                                                            POST    /api/wallet/exchange
 *  /withdraw                  Pages/Withdraw.jsx             POST    /api/wallet/withdraw
 *  /deposit/receive-funds     Pages/ReceiveFunds.jsx         GET     /api/wallet/deposit-address
 *  /deposit/fund-gas-fee      Pages/FundGasFee.jsx           GET     /api/wallet/gas-fee-address
 *  /profile                   Pages/Profile.jsx              GET     /api/profile
 *  /notifications             Pages/Notifications.jsx      GET     /api/wallet/notifications/rate-updates
 *  /settings/update-pin       Pages/UpdatePin.jsx            PUT     /api/user/pin
 *  /settings/update-password  Pages/UpdatePassword.jsx     PUT     /api/user/password
 *  /deposit, /settings        Pages/Deposit.jsx, Settings  —       (navigation only, no API)
 *
 * Logout (all pages with HomeHeader): optional POST /api/auth/logout, then clear token storage.
 *
 * ─── HOW TO WIRE UP ───────────────────────────────────────────────────────────
 * 1. Search: BACKEND INTEGRATION
 * 2. Each block lists: trigger, method, URL, request body, expected response, state to update
 * 3. Replace lines marked // DEMO ONLY with real fetch() calls
 * 4. Remove hardcoded SAMPLE_* constants once live data works
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Deposit from './Pages/Deposit.jsx'
import Exchange from './Pages/Exchange.jsx'
import FundGasFee from './Pages/FundGasFee.jsx'
import Home from './Pages/Home.jsx'
import Notifications from './Pages/Notifications.jsx'
import Login from './Pages/Login.jsx'
import Profile from './Pages/Profile.jsx'
import ReceiveFunds from './Pages/ReceiveFunds.jsx'
import Settings from './Pages/Settings.jsx'
import UpdatePin from './Pages/UpdatePin.jsx'
import UpdatePassword from './Pages/UpdatePassword.jsx'
import Withdraw from './Pages/Withdraw.jsx'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* POST /api/auth/login — see Login.jsx */}
        <Route path="/login" element={<Login />} />

        {/* No API — navigation hub only */}
        <Route path="/deposit" element={<Deposit />} />

        {/* GET /api/wallet/gas-fee-address — see FundGasFee.jsx */}
        <Route path="/deposit/fund-gas-fee" element={<FundGasFee />} />

        {/* GET /api/wallet/deposit-address — see ReceiveFunds.jsx */}
        <Route path="/deposit/receive-funds" element={<ReceiveFunds />} />

        {/* POST /api/wallet/withdraw — see Withdraw.jsx */}
        <Route path="/withdraw" element={<Withdraw />} />

        {/* POST /api/wallet/exchange — see Exchange.jsx */}
        <Route path="/exchange" element={<Exchange />} />

        {/* GET /api/profile — see Profile.jsx */}
        <Route path="/profile" element={<Profile />} />

        {/* No API — links to security forms */}
        <Route path="/settings" element={<Settings />} />

        {/* PUT /api/user/pin — see UpdatePin.jsx */}
        <Route path="/settings/update-pin" element={<UpdatePin />} />

        {/* PUT /api/user/password — see UpdatePassword.jsx */}
        <Route path="/settings/update-password" element={<UpdatePassword />} />

        {/* GET /api/wallet/notifications/rate-updates — see Notifications.jsx */}
        <Route path="/notifications" element={<Notifications />} />

        {/* GET /api/auth/me, /wallet/summary, /markets/flow, /wallet/transactions — see Home.jsx */}
        <Route path="/home" element={<Home />} />

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
