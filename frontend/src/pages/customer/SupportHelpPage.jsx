import { useState } from 'react'
import {
  Search,
  BookOpen,
  User,
  CreditCard,
  Shield,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Mail,
  Phone,
  Send,
  X,
  CheckCircle2
} from 'lucide-react'

const initialFaqs = [
  {
    id: 1,
    question: 'How do I request an NQ Taxi ride?',
    answer: 'To request a ride, enter your pickup location and destination in the app home screen. Choose your preferred ride category (Mini, Sedan, SUV, or Lux), select your payment method, and tap "Request Ride". We will immediately connect you with the nearest driver.',
    category: 'rides'
  },
  {
    id: 2,
    question: 'What payment options are supported?',
    answer: 'NQ Taxi supports a wide range of payment methods including UPI (Google Pay, PhonePe, Paytm), Credit/Debit cards (Visa, MasterCard, RuPay), Net Banking, and NQ Wallet. You can also pay in cash directly to the driver at the end of the trip.',
    category: 'payments'
  },
  {
    id: 3,
    question: 'How are fares calculated?',
    answer: 'Fares are calculated based on base fare, total distance travelled, ride duration, and current demand (surge pricing). An estimate is shown to you before booking. Toll fees and taxes may be added to the final invoice if applicable during the route.',
    category: 'rides'
  },
  {
    id: 4,
    question: 'How do I report a lost item in the taxi?',
    answer: 'If you left an item in the taxi, go to Support in your app, select "Ride History", find the ride, and tap "Contact Driver". If the ride was completed more than 24 hours ago, submit a ticket below with the Ride ID, description of the item, and we will assist you.',
    category: 'safety'
  },
  {
    id: 5,
    question: 'How do I update my mobile number or email?',
    answer: 'Go to your Profile tab, click "Edit Profile", and update your email or phone number. A verification OTP will be sent to confirm and complete the change to ensure your account security.',
    category: 'account'
  },
  {
    id: 6,
    question: 'What is NQ Taxi Premium, and how do I join?',
    answer: 'NQ Taxi Premium is our loyalty program. Riders who complete more than 15 rides a month are automatically upgraded, unlocking benefits like zero surge pricing, priority support, and vehicle upgrades at no extra cost.',
    category: 'account'
  }
]

const categories = [
  { id: 'rides', label: 'Rides & Fares', icon: BookOpen, count: 12 },
  { id: 'account', label: 'Account & Security', icon: User, count: 8 },
  { id: 'payments', label: 'Payment & Wallet', icon: CreditCard, count: 15 },
  { id: 'safety', label: 'Safety & Help', icon: Shield, count: 6 },
]

export default function SupportHelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaqId, setExpandedFaqId] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [ticketForm, setTicketForm] = useState({ name: '', email: '', category: 'Payment Issue', subject: '', message: '' })
  const [ticketSuccess, setTicketSuccess] = useState(false)
  const [chatMessage, setChatMessage] = useState('')

  const handleToggleFaq = (id) => {
    setExpandedFaqId(expandedFaqId === id ? null : id)
  }

  const handleFormChange = (e) => {
    setTicketForm({
      ...ticketForm,
      [e.target.name]: e.target.value
    })
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    // Simulated ticket creation
    setTicketSuccess(true)
    setTimeout(() => {
      setIsModalOpen(false)
      setTicketSuccess(false)
      setTicketForm({ name: '', email: '', category: 'Payment Issue', subject: '', message: '' })
    }, 2500)
  }

  const triggerLiveChat = () => {
    setChatMessage('Initiating Live Chat... Connecting to a Support executive.')
    setTimeout(() => {
      setChatMessage('')
      alert('Mock: Live chat initiated! In a production build, this would launch the web socket support client.')
    }, 1500)
  }

  // Filter FAQs based on search query and category
  const filteredFaqs = initialFaqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory ? faq.category === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Search Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-yellow/10 via-brand-yellow/5 to-transparent border border-white/5 p-8 md:p-12 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,197,24,0.1),transparent_50%)]"></div>
        <div className="relative z-10 space-y-4 max-w-xl mx-auto">
          <h3 className="text-brand-yellow text-sm font-semibold uppercase tracking-wider">Help Center</h3>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">How can we help you today?</h1>
          <p className="text-white/60 text-sm">Search our database for ride setup, payments, cancellation policies, or get in touch with our live support.</p>
          
          <div className="relative mt-6 max-w-lg mx-auto">
            <span className="absolute inset-y-0 left-4 flex items-center text-white/40">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Search FAQs, issues, billing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#16171B] border border-white/10 text-white placeholder-white/30 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-brand-yellow/50 focus:ring-1 focus:ring-brand-yellow/30 shadow-2xl transition duration-200"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-4 flex items-center text-white/40 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon
          const isSelected = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
              className={`p-5 rounded-2xl border text-left transition-all duration-300 ${
                isSelected 
                  ? 'bg-brand-yellow/10 border-brand-yellow shadow-md shadow-brand-yellow/5' 
                  : 'bg-[#111214] border-white/5 hover:border-white/15'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                isSelected ? 'bg-brand-yellow text-brand-black' : 'bg-white/5 text-brand-yellow'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white text-sm">{cat.label}</h3>
              <p className="text-white/40 text-xs mt-1">{cat.count} articles</p>
            </button>
          )
        })}
      </div>

      {/* FAQ Accordion Section */}
      <div className="bg-[#111214] border border-white/5 rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Frequently Asked Questions</h2>
            {selectedCategory && (
              <p className="text-xs text-brand-yellow mt-1">
                Showing FAQs for category: <span className="capitalize font-semibold">{selectedCategory}</span>
              </p>
            )}
          </div>
          {selectedCategory && (
            <button 
              onClick={() => setSelectedCategory(null)}
              className="text-xs text-white/50 hover:text-white underline"
            >
              Clear Filter
            </button>
          )}
        </div>

        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id
              return (
                <div 
                  key={faq.id} 
                  className={`border-b border-white/5 pb-4 last:border-b-0 last:pb-0 transition-colors duration-200`}
                >
                  <button
                    onClick={() => handleToggleFaq(faq.id)}
                    className="w-full flex items-center justify-between py-3 text-left hover:text-brand-yellow transition"
                  >
                    <span className="font-medium text-white text-sm md:text-base pr-4">{faq.question}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="pt-2 pb-3 text-white/60 text-xs md:text-sm leading-relaxed animate-slide-up">
                      {faq.answer}
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-white/40">No FAQs match your search or filter.</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                className="mt-2 text-brand-yellow text-xs font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Support Actions Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Support Option 1 */}
        <div className="bg-[#111214] border border-white/5 rounded-3xl p-6 flex flex-col justify-between hover:border-white/10 transition">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white">Live Chat Support</h3>
            <p className="text-white/50 text-xs leading-relaxed">Speak directly with one of our user-support executives for quick ride-related resolutions.</p>
          </div>
          <button 
            onClick={triggerLiveChat}
            className="mt-5 w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold py-2.5 rounded-xl transition"
          >
            {chatMessage ? chatMessage : 'Start Live Chat'}
          </button>
        </div>

        {/* Support Option 2 */}
        <div className="bg-[#111214] border border-white/5 rounded-3xl p-6 flex flex-col justify-between hover:border-white/10 transition">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 flex items-center justify-center text-brand-yellow">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white">Email Ticket</h3>
            <p className="text-white/50 text-xs leading-relaxed">Submit a ticket detailing complex booking glitches, driver complaints, or wallet refund queries.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-5 w-full bg-brand-yellow text-brand-black hover:brightness-110 font-bold text-xs py-2.5 rounded-xl transition shadow-md shadow-brand-yellow/5"
          >
            Submit Help Ticket
          </button>
        </div>

        {/* Support Option 3 */}
        <div className="bg-[#111214] border border-white/5 rounded-3xl p-6 flex flex-col justify-between hover:border-white/10 transition">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white">Call Support</h3>
            <p className="text-white/50 text-xs leading-relaxed">Dedicated toll-free number for emergency calls, physical ride safety assistance, or severe issues.</p>
          </div>
          <a 
            href="tel:18005556677"
            className="mt-5 text-center block w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold py-2.5 rounded-xl transition"
          >
            1800-555-6677
          </a>
        </div>
      </div>

      {/* Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/85 backdrop-blur-sm transition-all duration-300">
          <div className="bg-[#111214] border border-white/10 rounded-3xl w-full max-w-lg p-6 relative shadow-2xl animate-slide-up">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white p-1 rounded-full hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {ticketSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/15 text-green-400 mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Ticket Submitted Successfully!</h3>
                <p className="text-white/60 text-xs max-w-sm mx-auto">Thank you, your support ticket has been logged. Our help desk agent will review and reply via email within 2-4 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Submit a Support Ticket</h2>
                  <p className="text-white/40 text-xs">Fill out the details below and we will contact you immediately.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-white/60 text-[10px] uppercase font-semibold">Your Name</label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={ticketForm.name}
                      onChange={handleFormChange}
                      placeholder="e.g. Amit Sharma"
                      className="w-full bg-[#18191E] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-yellow/50 transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/60 text-[10px] uppercase font-semibold">Email Address</label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={ticketForm.email}
                      onChange={handleFormChange}
                      placeholder="e.g. amit@example.com"
                      className="w-full bg-[#18191E] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-yellow/50 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-white/60 text-[10px] uppercase font-semibold">Ticket Category</label>
                  <select
                    name="category"
                    value={ticketForm.category}
                    onChange={handleFormChange}
                    className="w-full bg-[#18191E] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-yellow/50 transition"
                  >
                    <option value="Payment Issue">Payment & Wallet Issue</option>
                    <option value="Driver Dispute">Driver Dispute / Complaint</option>
                    <option value="Refund Request">Refund Request</option>
                    <option value="App Bug">App Crashing or Technical Glitch</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-white/60 text-[10px] uppercase font-semibold">Subject / Title</label>
                  <input
                    required
                    type="text"
                    name="subject"
                    value={ticketForm.subject}
                    onChange={handleFormChange}
                    placeholder="Brief summary of the problem"
                    className="w-full bg-[#18191E] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-yellow/50 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-white/60 text-[10px] uppercase font-semibold">Detailed Description</label>
                  <textarea
                    required
                    rows="4"
                    name="message"
                    value={ticketForm.message}
                    onChange={handleFormChange}
                    placeholder="Provide details like Ride ID, timings, amount or driver name if possible..."
                    className="w-full bg-[#18191E] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-yellow/50 transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-brand-yellow text-brand-black hover:brightness-110 font-bold py-3 rounded-xl transition text-sm shadow-md"
                >
                  <Send className="w-4 h-4" />
                  Submit Ticket
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
