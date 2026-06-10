import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import AdminLoginPage  from '@pages/admin/AdminLoginPage'
import DashboardPage   from '@pages/admin/DashboardPage'
import SupportInboxPage from '@pages/admin/SupportInboxPage'
import SupportChatPage from '@pages/admin/SupportChatPage'
import LiveMapPage     from '@pages/admin/LiveMapPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/support" element={<SupportInboxPage />} />
        <Route path="/admin/support/chat" element={<SupportChatPage />} />
        <Route path="/admin/live-map" element={<LiveMapPage />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
