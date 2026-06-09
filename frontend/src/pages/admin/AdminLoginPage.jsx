import { Link } from 'react-router-dom'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-black">
      <div className="card w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-brand-yellow mb-6">Admin Login</h1>
        <Link to="/admin/dashboard" className="btn-primary w-full block">Enter Dashboard</Link>
      </div>
    </div>
  )
}
