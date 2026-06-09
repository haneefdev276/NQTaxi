import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Headphones, ChevronDown, Map, Car,
} from 'lucide-react'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/support', label: 'Support', icon: Headphones },
  { to: '/admin/live-map', label: 'Live Map', icon: Map },
]

export default function AdminSidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-[#111214] border-r border-white/5 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-2.5">
        <div className="w-9 h-9 bg-brand-yellow rounded-lg flex items-center justify-center">
          <Car className="w-5 h-5 text-brand-black" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight tracking-wide">NQTAXI</h1>
          <p className="text-white/40 text-[10px]">Safe Rides, Anytime.</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-yellow text-brand-black'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon className="w-[18px] h-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Promo card */}
      <div className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-br from-brand-yellow/20 to-brand-yellow/5 border border-brand-yellow/20">
        <div className="flex items-center gap-2 mb-2">
          <Car className="w-8 h-8 text-brand-yellow" />
          <div>
            <p className="text-white text-xs font-semibold leading-tight">Drive more,</p>
            <p className="text-white text-xs font-semibold leading-tight">Earn more</p>
          </div>
        </div>
        <button className="w-full bg-brand-yellow text-brand-black text-[10px] font-semibold py-1.5 rounded-md hover:brightness-110 transition">
          Learn More
        </button>
      </div>

      {/* User profile */}
      <div className="px-4 py-4 border-t border-white/5 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition">
        <img
          src="https://i.pravatar.cc/40?img=12"
          alt="Admin"
          className="w-9 h-9 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">Admin User</p>
          <p className="text-white/40 text-xs">Super Admin</p>
        </div>
        <ChevronDown className="w-4 h-4 text-white/40" />
      </div>
    </aside>
  )
}
