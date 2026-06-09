import { TrendingUp, CalendarCheck, IndianRupee, Car, Users } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'

const iconMap = {
  bookings: CalendarCheck,
  revenue: IndianRupee,
  drivers: Car,
  users: Users,
}

const colorMap = {
  yellow: { bg: 'bg-brand-yellow/15', text: 'text-brand-yellow', stroke: '#F5C518' },
  green:  { bg: 'bg-green-500/15', text: 'text-green-400', stroke: '#22C55E' },
  purple: { bg: 'bg-purple-500/15', text: 'text-purple-400', stroke: '#A855F7' },
  blue:   { bg: 'bg-blue-500/15', text: 'text-blue-400', stroke: '#3B82F6' },
}

export default function KpiCard({ title, value, change, trend, icon, color, sparkline }) {
  const Icon = iconMap[icon]
  const colors = colorMap[color]
  const chartData = sparkline.map((v, i) => ({ v, i }))

  return (
    <div className="bg-[#1A1D21] rounded-2xl p-5 border border-white/5 relative overflow-hidden">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white/50 text-sm mb-1">{title}</p>
          <p className="text-white text-2xl font-bold">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
      </div>

      <div className="flex items-center gap-1 mb-3">
        <TrendingUp className="w-3.5 h-3.5 text-green-400" />
        <span className="text-green-400 text-xs font-medium">{change}</span>
        <span className="text-white/30 text-xs">vs last week</span>
      </div>

      <div className="h-[50px] -mx-1 -mb-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.stroke} stopOpacity={0.3} />
                <stop offset="100%" stopColor={colors.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={colors.stroke}
              strokeWidth={2}
              fill={`url(#grad-${color})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
