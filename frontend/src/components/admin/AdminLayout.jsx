import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

export default function AdminLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-[#0E0F11]">
      <AdminSidebar />
      <main className="ml-[240px] p-6 min-h-screen">
        <AdminHeader title={title} />
        {children}
      </main>
    </div>
  )
}
