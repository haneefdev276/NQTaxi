import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import { earningsData } from '@data/mockData'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1A1D21] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-white/50 text-xs">{label} 2025</p>
      <p className="text-brand-yellow font-semibold text-sm">
        ₹ {payload[0].value.toLocaleString('en-IN')}
      </p>
    </div>
  )
}

export default function EarningsOverviewChart() {
  return (
    <div className="bg-[#1A1D21] rounded-2xl border border-white/5 p-5">
      <h3 className="text-white font-semibold mb-4">Earnings Overview</h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={earningsData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F5C518" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#F5C518" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#F5C518"
              strokeWidth={2.5}
              fill="url(#earningsGrad)"
              dot={false}
              activeDot={{ r: 5, fill: '#F5C518', stroke: '#0E0F11', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
