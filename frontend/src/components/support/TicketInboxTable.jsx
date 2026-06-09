import { useState } from 'react'
import { Search, Filter, MessageSquare, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supportTickets } from '@data/mockData'

const statusStyles = {
  Open: 'badge-danger',
  'In Progress': 'badge-warning',
  Resolved: 'badge-success',
}

const priorityStyles = {
  High: 'text-red-400 bg-red-500/10',
  Medium: 'text-brand-yellow bg-brand-yellow/10',
  Low: 'text-blue-400 bg-blue-500/10',
}

export default function TicketInboxTable() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = supportTickets.filter((t) => {
    const matchFilter = filter === 'All' || t.status === filter
    const matchSearch =
      !search ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.user.name.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const counts = {
    All: supportTickets.length,
    Open: supportTickets.filter((t) => t.status === 'Open').length,
    'In Progress': supportTickets.filter((t) => t.status === 'In Progress').length,
    Resolved: supportTickets.filter((t) => t.status === 'Resolved').length,
  }

  return (
    <div className="bg-[#1A1D21] rounded-2xl border border-white/5 overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-white/5 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111214] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-yellow/50"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#111214] border border-white/10 rounded-xl text-white/60 text-sm hover:bg-white/5 transition">
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <Link
          to="/admin/support/chat"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-yellow text-brand-black rounded-xl text-sm font-semibold hover:brightness-110 transition"
        >
          <MessageSquare className="w-4 h-4" />
          Open Chat
        </Link>
      </div>

      {/* Status tabs */}
      <div className="px-5 py-3 border-b border-white/5 flex gap-2">
        {['All', 'Open', 'In Progress', 'Resolved'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === tab
                ? 'bg-brand-yellow text-brand-black'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-white/40 text-xs uppercase tracking-wider">
              <th className="text-left px-5 py-3 font-medium">Ticket ID</th>
              <th className="text-left px-5 py-3 font-medium">Subject</th>
              <th className="text-left px-5 py-3 font-medium">User</th>
              <th className="text-left px-5 py-3 font-medium">Category</th>
              <th className="text-left px-5 py-3 font-medium">Priority</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-left px-5 py-3 font-medium">Created</th>
              <th className="text-left px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ticket) => (
              <tr key={ticket.id} className="border-t border-white/5 hover:bg-white/[0.02] transition">
                <td className="px-5 py-3.5 text-brand-yellow text-sm font-mono">{ticket.id}</td>
                <td className="px-5 py-3.5 text-white text-sm max-w-[200px] truncate">{ticket.subject}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <img src={ticket.user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-white text-sm">{ticket.user.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-white/50 text-sm">{ticket.category}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${priorityStyles[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={statusStyles[ticket.status]}>{ticket.status}</span>
                </td>
                <td className="px-5 py-3.5 text-white/40 text-xs whitespace-nowrap">{ticket.created}</td>
                <td className="px-5 py-3.5">
                  <Link
                    to="/admin/support/chat"
                    className="inline-flex items-center gap-1 text-brand-yellow text-xs font-medium hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
