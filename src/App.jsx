/**
 * App shell — maps URL paths (frontend routes) to page components.
 *
 * These are in-browser routes (React Router), NOT backend API paths.
 * Backend APIs are documented in src/lib/config.js and src/lib/api/*.js
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
        {/* Auth */}
        <Route path="/login" element={<Login />} /> {/* API: POST /auth/login */}

        {/* Treasury — deposit flows */}
        <Route path="/deposit" element={<Deposit />} /> {/* Hub only; no API */}
        <Route path="/deposit/fund-gas-fee" element={<FundGasFee />} /> {/* GET /wallet/gas-fee-address */}
        <Route path="/deposit/receive-funds" element={<ReceiveFunds />} /> {/* GET /wallet/deposit-address */}

        {/* Treasury — withdraw & exchange */}
        <Route path="/withdraw" element={<Withdraw />} /> {/* POST /wallet/withdraw */}
        <Route path="/exchange" element={<Exchange />} /> {/* POST quote + POST execute */}

        {/* Account */}
        <Route path="/profile" element={<Profile />} /> {/* GET profile (default /auth/me) */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/update-pin" element={<UpdatePin />} />
        <Route path="/settings/update-password" element={<UpdatePassword />} />

        {/* Dashboard */}
        <Route path="/notifications" element={<Notifications />} /> {/* GET rate-updates */}
        <Route path="/home" element={<Home />} /> {/* GET me, summary, transactions, flow */}

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
