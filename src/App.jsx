/**
 * App shell — frontend routes only (no backend).
 * Demo data lives in src/lib/payloads/*.js
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
        <Route path="/login" element={<Login />} />
        <Route path="/deposit" element={<Deposit />} />
        <Route path="/deposit/fund-gas-fee" element={<FundGasFee />} />
        <Route path="/deposit/receive-funds" element={<ReceiveFunds />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/exchange" element={<Exchange />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/update-pin" element={<UpdatePin />} />
        <Route path="/settings/update-password" element={<UpdatePassword />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
