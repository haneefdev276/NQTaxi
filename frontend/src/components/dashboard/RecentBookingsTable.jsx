import { ArrowRight } from 'lucide-react'
import { recentBookings } from '@data/mockData'

const statusStyles = {
  Completed: 'badge-success',
  Ongoing: 'badge-warning',
  Cancelled: 'badge-danger',
}

export default function RecentBookingsTable() {
  return (
    <div className="bg-[#1A1D21] rounded-2xl border border-white/5 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5">
        <h3 className="text-white font-semibold">Recent Bookings</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-white/40 text-xs uppercase tracking-wider">
              <th className="text-left px-5 py-3 font-medium">Booking ID</th>
              <th className="text-left px-5 py-3 font-medium">User</th>
              <th className="text-left px-5 py-3 font-medium">Pickup - Drop</th>
              <th className="text-left px-5 py-3 font-medium">Driver</th>
              <th className="text-left px-5 py-3 font-medium">Fare</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.map((booking) => (
              <tr key={booking.id} className="border-t border-white/5 hover:bg-white/[0.02] transition">
                <td className="px-5 py-3.5 text-white/70 text-sm font-mono">{booking.id}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <img src={booking.user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-white text-sm">{booking.user.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="text-white/70">{booking.pickup}</span>
                    <ArrowRight className="w-3 h-3 text-white/30 flex-shrink-0" />
                    <span className="text-white/70">{booking.drop}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <img src={booking.driver.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-white text-sm">{booking.driver.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-white text-sm font-medium">{booking.fare}</td>
                <td className="px-5 py-3.5">
                  <span className={statusStyles[booking.status]}>{booking.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
