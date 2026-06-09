import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-black">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-brand-yellow mb-4">NQTAXI</h1>
        <p className="text-white/60 mb-8">Safe Rides, Anytime.</p>
        <Link to="/admin/dashboard" className="btn-primary">Admin Dashboard</Link>
      </div>
    </div>
  )
}
