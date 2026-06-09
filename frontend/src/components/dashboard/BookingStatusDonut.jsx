import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { bookingStatusData } from '@data/mockData'

const total = bookingStatusData.reduce((sum, d) => sum + d.value, 0)

export default function BookingStatusDonut() {
  return (
    <div className="bg-[#1A1D21] rounded-2xl border border-white/5 p-5">
      <h3 className="text-white font-semibold mb-4">Booking Status</h3>
      <div className="flex items-center gap-4">
        <div className="relative w-[140px] h-[140px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={bookingStatusData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {bookingStatusData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white text-lg font-bold">{total.toLocaleString()}</span>
            <span className="text-white/40 text-[10px]">Total</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {bookingStatusData.map((item) => {
            const pct = ((item.value / total) * 100).toFixed(1)
            return (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-white/60 text-sm">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-white text-sm font-medium">{item.value.toLocaleString()}</span>
                  <span className="text-white/30 text-xs ml-1">({pct}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
