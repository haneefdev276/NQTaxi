import { useState } from 'react'
import {
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  Award,
  Wallet,
  Clock,
  Send,
  MessageCircle,
  Mail,
  ArrowRight
} from 'lucide-react'

const initialReferrals = [
  { id: 1, name: 'Rohan Deshmukh', date: '18 June 2026', status: 'Completed', reward: '₹150' },
  { id: 2, name: 'Ananya Sen', date: '14 June 2026', status: 'Completed', reward: '₹150' },
  { id: 3, name: 'Kabir Mehta', date: '10 June 2026', status: 'Completed', reward: '₹150' },
  { id: 4, name: 'Preeti Sharma', date: '21 June 2026', status: 'Pending', reward: '₹150 (Pending)' },
  { id: 5, name: 'Vikram Malhotra', date: '20 June 2026', status: 'Signed Up', reward: '₹0' },
]

export default function ReferEarnPage() {
  const [referralCode] = useState('NQTAXI150')
  const [copied, setCopied] = useState(false)
  const [shareSuccess, setShareSuccess] = useState('')

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const triggerShare = (platform) => {
    setShareSuccess(`Sharing code via ${platform}...`)
    setTimeout(() => {
      setShareSuccess('')
      alert(`Mock: Shared code ${referralCode} successfully via ${platform}!`)
    }, 1200)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Banner Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-yellow/15 via-brand-yellow/5 to-brand-black border border-brand-yellow/20 p-8 md:p-12">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 md:opacity-20 flex items-center justify-center pointer-events-none">
          <Gift className="w-48 h-48 text-brand-yellow" />
        </div>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-yellow/20 border border-brand-yellow/30 rounded-full text-brand-yellow text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            Special Invitation
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            Share NQ Taxi,<br />
            <span className="text-brand-yellow">Earn Free Ride Wallet Credits!</span>
          </h1>
          <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-lg">
            Invite your friends to sign up using your referral code. They receive an instant <strong className="text-white">₹100 discount</strong> on their first ride, and you earn <strong className="text-brand-yellow">₹150</strong> added to your NQ Wallet as soon as they complete their first trip!
          </p>
        </div>
      </div>

      {/* Refer Container & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Code Sharing Box */}
        <div className="lg:col-span-1 bg-[#111214] border border-white/5 rounded-3xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Your Referral Code</h2>
            <p className="text-white/40 text-xs leading-relaxed">Share this code with friends via SMS, social chat apps, or email. There is no limit on invite earnings!</p>
            
            {/* Promo Code Box */}
            <div className="bg-brand-black/40 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <span className="font-mono text-xl font-bold tracking-widest text-brand-yellow pl-2">{referralCode}</span>
              <button 
                onClick={handleCopyCode}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-yellow hover:brightness-110 text-brand-black text-xs font-bold rounded-xl transition-all duration-200"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Icons row */}
          <div className="space-y-3">
            <label className="text-[10px] text-white/50 uppercase font-semibold tracking-wider">Quick Share Link</label>
            <div className="grid grid-cols-4 gap-2">
              <button 
                onClick={() => triggerShare('WhatsApp')}
                className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl hover:bg-green-500/20 transition flex items-center justify-center"
                title="Share to WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <button 
                onClick={() => triggerShare('Telegram')}
                className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/20 transition flex items-center justify-center"
                title="Share to Telegram"
              >
                <Send className="w-5 h-5" />
              </button>
              <button 
                onClick={() => triggerShare('Email')}
                className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition flex items-center justify-center"
                title="Share via Email"
              >
                <Mail className="w-5 h-5" />
              </button>
              <button 
                onClick={() => triggerShare('System Share')}
                className="p-3 bg-white/5 border border-white/10 text-white/70 rounded-xl hover:bg-white/10 transition flex items-center justify-center"
                title="Share link"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            {shareSuccess && (
              <p className="text-center text-[10px] text-brand-yellow font-medium animate-pulse mt-2">{shareSuccess}</p>
            )}
          </div>
        </div>

        {/* Right Side: Referral Statistics Dashboard */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stat Item 1 */}
          <div className="bg-[#111214] border border-white/5 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Total Referred</p>
              <h2 className="text-3xl font-extrabold text-white mt-1">12 <span className="text-xs text-white/40 font-normal">friends</span></h2>
            </div>
            <p className="text-white/40 text-[10px] border-t border-white/5 pt-2">8 completed rides</p>
          </div>

          {/* Stat Item 2 */}
          <div className="bg-[#111214] border border-white/5 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Total Earned</p>
              <h2 className="text-3xl font-extrabold text-green-400 mt-1">₹1,200</h2>
            </div>
            <p className="text-white/40 text-[10px] border-t border-white/5 pt-2">Redeemed to NQ Wallet</p>
          </div>

          {/* Stat Item 3 */}
          <div className="bg-[#111214] border border-white/5 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 flex items-center justify-center text-brand-yellow">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Pending Rewards</p>
              <h2 className="text-3xl font-extrabold text-brand-yellow mt-1">₹300</h2>
            </div>
            <p className="text-white/40 text-[10px] border-t border-white/5 pt-2">2 pending first ride</p>
          </div>
        </div>
      </div>

      {/* Referral History Ledger Table */}
      <div className="bg-[#111214] border border-white/5 rounded-3xl p-6 overflow-hidden">
        <h3 className="font-bold text-white text-base mb-4">Referral Invitation History</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/50 text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Friend's Name</th>
                <th className="py-3 px-4 font-semibold">Joined Date</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Earned Reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {initialReferrals.map((ref) => (
                <tr key={ref.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 font-medium text-white">{ref.name}</td>
                  <td className="py-4 px-4 text-white/60">{ref.date}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      ref.status === 'Completed' 
                        ? 'bg-green-500/20 text-green-400' 
                        : ref.status === 'Pending' 
                        ? 'bg-brand-yellow/20 text-brand-yellow' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {ref.status}
                    </span>
                  </td>
                  <td className={`py-4 px-4 text-right font-bold ${
                    ref.status === 'Completed' ? 'text-green-400' : 'text-white/40'
                  }`}>{ref.reward}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Referral Program Guidelines Accordion Info */}
      <div className="bg-[#111214]/50 border border-white/5 rounded-3xl p-6">
        <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">How it works</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-white/50 leading-relaxed">
          <div className="space-y-1">
            <span className="text-brand-yellow font-bold">01. Send Invite Link</span>
            <p>Send your promo code to your friends and ask them to sign up on the NQTaxi app.</p>
          </div>
          <div className="space-y-1">
            <span className="text-brand-yellow font-bold">02. Friend books first ride</span>
            <p>Your friend receives ₹100 discount coupon which they apply on their initial booking.</p>
          </div>
          <div className="space-y-1">
            <span className="text-brand-yellow font-bold">03. Both get rewarded!</span>
            <p>Upon completion of their trip, ₹150 credit will be automatically deposited in your wallet.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
