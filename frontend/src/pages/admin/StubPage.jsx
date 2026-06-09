import AdminLayout from '@components/admin/AdminLayout'

export default function StubPage({ title }) {
  return (
    <AdminLayout title={title}>
      <div className="card text-center py-20">
        <p className="text-white/40">{title} — coming soon</p>
      </div>
    </AdminLayout>
  )
}
