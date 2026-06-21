import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  Car,
  Gift,
  HelpCircle,
  Home,
  ChevronDown,
  Bell,
  Settings,
  ShieldAlert
} from 'lucide-react'

const navItems = [
  { to: '/customer/home', label: 'Home / Book Ride', icon: Home, disabled: true },
  { to: '/customer/refer-earn', label: 'Refer & Earn', icon: Gift },
  { to: '/customer/support-help', label: 'Support & Help Center', icon: HelpCircle },
]

export default function CustomerLayout({ title, children }) {
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0E0F11]">
      {/* Customer Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-[240px] bg-[#111214] border-r border-white/5 flex flex-col z-40">
        {/* Logo */}
        <div className="px-5 py-6 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand-yellow rounded-lg flex items-center justify-center shadow-lg shadow-brand-yellow/10">
            <Car className="w-5 h-5 text-brand-black" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight tracking-wide">NQTAXI</h1>
            <p className="text-brand-yellow text-[9px] uppercase tracking-widest font-semibold">Rider Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, disabled }) => {
            if (disabled) {
              return (
                <div
                  key={to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/20 cursor-not-allowed select-none"
                  title="Coming Soon"
                >
                  <Icon className="w-[18px] h-[18px]" />
                  <span>{label}</span>
                  <span className="ml-auto text-[8px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded font-normal uppercase">Soon</span>
                </div>
              )
            }
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-yellow text-brand-black shadow-lg shadow-brand-yellow/10'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-[18px] h-[18px]" />
                {label}
              </NavLink>
            )
          })}
        </nav>

        {/* Admin Quick Switch Card */}
        <div className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-br from-brand-yellow/10 to-brand-yellow/0 border border-brand-yellow/10">
          <p className="text-white/70 text-[11px] mb-2 text-center font-medium">Demo View Switcher</p>
          <Link
            to="/admin/dashboard"
            className="w-full flex items-center justify-center gap-1.5 bg-brand-yellow text-brand-black text-xs font-semibold py-2 rounded-md hover:brightness-110 transition shadow-md"
          >
            <Settings className="w-3.5 h-3.5" />
            Switch to Admin Panel
          </Link>
        </div>

        {/* User profile */}
        <div 
          onClick={() => setProfileOpen(!profileOpen)}
          className="px-4 py-4 border-t border-white/5 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition relative"
        >
          <img
            src="https://i.pravatar.cc/40?img=33"
            alt="Customer"
            className="w-9 h-9 rounded-full object-cover border border-brand-yellow/20"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">Amit Sharma</p>
            <p className="text-white/40 text-xs">Premium Rider</p>
          </div>
          <ChevronDown className="w-4 h-4 text-white/40" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-[240px] p-6 min-h-screen flex flex-col">
        {/* Customer Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-white text-xl font-semibold">{title}</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick SOS button for rider security */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition rounded-xl text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              SOS Safety
            </button>

            <button className="relative p-2.5 rounded-xl bg-[#1A1D21] border border-white/10 hover:bg-white/5 transition">
              <Bell className="w-5 h-5 text-white/60" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-yellow text-brand-black text-[9px] font-bold rounded-full flex items-center justify-center">
                2
              </span>
            </button>

            <img
              src="https://i.pravatar.cc/40?img=33"
              alt="Customer"
              className="w-10 h-10 rounded-full object-cover border-2 border-brand-yellow/30"
            />
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  )
}
