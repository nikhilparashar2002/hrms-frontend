import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p className="text-8xl font-bold text-slate-100 select-none">404</p>
      <h1 className="text-xl font-semibold text-slate-800 mt-4">Page not found</h1>
      <p className="text-sm text-slate-500 mt-2 mb-8">
        The page you're looking for doesn't exist or was moved.
      </p>
      <Link to="/" className="btn-primary">
        ← Back to dashboard
      </Link>
    </div>
  )
}
