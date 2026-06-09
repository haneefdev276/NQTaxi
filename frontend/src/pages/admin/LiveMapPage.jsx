import AdminLayout from '@components/admin/AdminLayout'
import ActiveMapTracking from '@components/map/ActiveMapTracking'

export default function LiveMapPage() {
  return (
    <AdminLayout title="Live Map">
      <ActiveMapTracking />
    </AdminLayout>
  )
}
