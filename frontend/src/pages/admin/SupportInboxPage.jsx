import AdminLayout from '@components/admin/AdminLayout'
import TicketInboxTable from '@components/support/TicketInboxTable'

export default function SupportInboxPage() {
  return (
    <AdminLayout title="Support Tickets">
      <TicketInboxTable />
    </AdminLayout>
  )
}
