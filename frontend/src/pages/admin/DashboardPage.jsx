import AdminLayout from '@components/admin/AdminLayout'
import KpiCardsRow from '@components/dashboard/KpiCardsRow'
import RecentBookingsTable from '@components/dashboard/RecentBookingsTable'
import LiveTrackingWidget from '@components/dashboard/LiveTrackingWidget'
import EarningsOverviewChart from '@components/dashboard/EarningsOverviewChart'
import TopDriversList from '@components/dashboard/TopDriversList'
import BookingStatusDonut from '@components/dashboard/BookingStatusDonut'

export default function DashboardPage() {
  return (
    <AdminLayout title="Dashboard">
      <KpiCardsRow />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <div className="xl:col-span-2">
          <RecentBookingsTable />
        </div>
        <div>
          <LiveTrackingWidget />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <EarningsOverviewChart />
        <TopDriversList />
        <BookingStatusDonut />
      </div>
    </AdminLayout>
  )
}
