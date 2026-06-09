import { Menu, Calendar, Bell } from 'lucide-react'

export default function AdminHeader({ title = 'Dashboard' }) {
  return (
    <header className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <button className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-white/60">
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-white text-xl font-semibold">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#1A1D21] border border-white/10 rounded-xl px-4 py-2 text-sm text-white/70">
          <Calendar className="w-4 h-4 text-white/40" />
          <span>20 May 2025 - 26 May 2025</span>
        </div>

        <button className="relative p-2.5 rounded-xl bg-[#1A1D21] border border-white/10 hover:bg-white/5 transition">
          <Bell className="w-5 h-5 text-white/60" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-yellow text-brand-black text-[10px] font-bold rounded-full flex items-center justify-center">
            4
          </span>
        </button>

        <img
          src="https://i.pravatar.cc/40?img=12"
          alt="Admin"
          className="w-10 h-10 rounded-full object-cover border-2 border-brand-yellow/30"
        />
      </div>
    </header>
  )
}
