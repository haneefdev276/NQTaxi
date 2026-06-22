import AdminLayout from '../../layouts/AdminLayout';
import Avatar from '../../components/admin/Avatar';

const TICKETS = [
  {
    id: '#TKT-99120',
    user: 'Rahul Sharma',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
    issue: 'Fare discrepancy on ride #NQ123458',
    date: 'Today, 2:45 PM',
    status: 'open',
    category: 'Billing'
  },
  {
    id: '#TKT-99118',
    user: 'Priya Singh',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    issue: 'App crashed during payment check-out',
    date: 'Yesterday, 6:12 PM',
    status: 'resolved',
    category: 'Technical'
  },
  {
    id: '#TKT-99112',
    user: 'Vikram Rao (Driver)',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
    issue: 'GPS navigation lost connection in tunnel',
    date: '20 Jun, 11:30 AM',
    status: 'pending',
    category: 'App Bug'
  },
  {
    id: '#TKT-99105',
    user: 'Sandeep Yadav (Driver)',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
    issue: 'Delay in payout bank deposit reconciliation',
    date: '18 Jun, 4:20 PM',
    status: 'resolved',
    category: 'Payouts'
  }
];

const FAQS = [
  { q: 'How is the ride fare calculated?', a: 'Fares are calculated based on base fare + distance-rate + time-rate + peak pricing multiplier.' },
  { q: 'What payment options are supported?', a: 'We support UPI, credit/debit cards, NetBanking, and cash payments.' },
  { q: 'How can a driver submit documents?', a: 'Drivers can upload photos of license, registration, insurance directly on their onboarding profile.' }
];

const STATUS_BADGES = {
  open: 'text-[#F44336] bg-[#F44336]/10 border border-[#F44336]/20',
  pending: 'text-[#FFB300] bg-[#FFB300]/10 border border-[#FFB300]/20',
  resolved: 'text-[#4CAF50] bg-[#4CAF50]/10 border border-[#4CAF50]/20'
};

export default function SupportInboxPage({ email, onLogout, onNavigate }) {
  return (
    <AdminLayout
      activePage="support"
      onNavigate={onNavigate}
      onLogout={onLogout}
      variant="dark"
    >
      <main className="min-h-screen min-w-0 flex-1 bg-[#0D0D0D] px-6 py-5 text-white">
        
        {/* Search Bar Section */}
        <header className="mb-6 flex justify-end">
          {/* Quick ticket search */}
          <div className="flex w-full max-w-[280px] items-center gap-2 rounded-lg border border-white/[0.08] bg-[#1A1A1A] px-3.5 py-1.5 text-xs text-gray-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 text-gray-400">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search tickets..."
              className="w-full border-none bg-transparent outline-none text-xs text-white placeholder-gray-500"
            />
          </div>
        </header>

        {/* Stats Grid */}
        <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <article className="rounded-xl border border-white/[0.08] bg-[#1A1A1A] p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-500">Total Tickets</span>
            <strong className="mt-1 block text-xl font-extrabold">42</strong>
          </article>
          <article className="rounded-xl border border-white/[0.08] bg-[#1A1A1A] p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-[#F44336]">Open Requests</span>
            <strong className="mt-1 block text-xl font-extrabold text-[#F44336]">1</strong>
          </article>
          <article className="rounded-xl border border-white/[0.08] bg-[#1A1A1A] p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-[#FFB300]">Pending Action</span>
            <strong className="mt-1 block text-xl font-extrabold text-[#FFB300]">5</strong>
          </article>
          <article className="rounded-xl border border-white/[0.08] bg-[#1A1A1A] p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-[#4CAF50]">Resolved Today</span>
            <strong className="mt-1 block text-xl font-extrabold text-[#4CAF50]">36</strong>
          </article>
        </section>

        {/* Double Column Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* Active Tickets List */}
          <section className="lg:col-span-8 rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5 shadow-lg">
            <h2 className="mb-4 text-sm font-bold text-white">Active Support Inbox</h2>
            <div className="flex flex-col gap-3">
              {TICKETS.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex flex-col gap-3 rounded-xl border border-white/[0.04] bg-[#242424] p-4 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar
                        label={ticket.user[0]}
                        seed={ticket.user}
                        src={ticket.avatar}
                        className="h-7 w-7"
                      />
                      <div>
                        <strong className="text-xs text-white block">{ticket.user}</strong>
                        <span className="text-[9px] text-gray-500">{ticket.date}</span>
                      </div>
                    </div>
                    <span className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${STATUS_BADGES[ticket.status]}`}>
                      {ticket.status}
                    </span>
                  </div>

                  <div className="border-t border-white/[0.04] pt-2 flex items-center justify-between gap-4">
                    <div>
                      <span className="inline-block rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[9px] text-[#F5C518] font-bold mr-2 uppercase tracking-wide">
                        {ticket.category}
                      </span>
                      <span className="text-xs text-gray-300 font-medium">{ticket.issue}</span>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 text-[10px] font-bold text-[#F5C518] hover:text-[#D4A80E] hover:underline"
                    >
                      Reply Chat →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQs & Resources Sidebar */}
          <section className="lg:col-span-4 flex flex-col gap-6">
            
            {/* FAQ Accordions */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5 shadow-lg">
              <h2 className="mb-4 text-sm font-bold text-white">Frequent Questions</h2>
              <div className="flex flex-col gap-4">
                {FAQS.map((faq, i) => (
                  <div key={i} className="border-b border-white/[0.04] pb-3 last:border-0 last:pb-0">
                    <h3 className="text-xs font-bold text-[#F5C518] mb-1.5">{faq.q}</h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-medium">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Contacts */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-5 shadow-lg">
              <h2 className="mb-3 text-sm font-bold text-white">Direct Assistance</h2>
              <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">Need urgent supervisor support? Contact operational leads directly:</p>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                  <span className="font-semibold text-gray-300">Operations Phone</span>
                  <span className="font-bold text-white">+91 98765 43210</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-300">Admin Support Email</span>
                  <span className="font-bold text-[#F5C518]">ops@nqtaxi.com</span>
                </div>
              </div>
            </div>

          </section>

        </div>

      </main>
    </AdminLayout>
  );
}
