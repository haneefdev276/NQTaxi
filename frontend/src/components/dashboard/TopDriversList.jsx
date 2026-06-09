import { Star } from 'lucide-react'
import { topDrivers } from '@data/mockData'

export default function TopDriversList() {
  return (
    <div className="bg-[#1A1D21] rounded-2xl border border-white/5 p-5">
      <h3 className="text-white font-semibold mb-4">Top Drivers</h3>
      <div className="space-y-3">
        {topDrivers.map((driver) => (
          <div key={driver.rank} className="flex items-center gap-3">
            <span className="text-white/30 text-sm font-medium w-4 text-center">{driver.rank}</span>
            <img src={driver.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{driver.name}</p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-brand-yellow fill-brand-yellow" />
                <span className="text-white/50 text-xs">{driver.rating}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs">{driver.rides} rides</p>
              <p className="text-brand-yellow text-xs font-medium">{driver.earnings}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
