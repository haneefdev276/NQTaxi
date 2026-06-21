import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import AdminLoginPage  from '@pages/admin/AdminLoginPage'
import DashboardPage   from '@pages/admin/DashboardPage'
import SupportInboxPage from '@pages/admin/SupportInboxPage'
import SupportChatPage from '@pages/admin/SupportChatPage'
import LiveMapPage     from '@pages/admin/LiveMapPage'

// Customer Pages & Layout
import CustomerLayout  from '@components/customer/CustomerLayout'
import SupportHelpPage from '@pages/customer/SupportHelpPage'
import ReferEarnPage   from '@pages/customer/ReferEarnPage'

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
        
        {/* Customer Routes */}
        <Route 
          path="/customer/support-help" 
          element={
            <CustomerLayout title="Support & Help Center">
              <SupportHelpPage />
            </CustomerLayout>
          } 
        />
        <Route 
          path="/customer/refer-earn" 
          element={
            <CustomerLayout title="Refer & Earn">
              <ReferEarnPage />
            </CustomerLayout>
          } 
        />

        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
