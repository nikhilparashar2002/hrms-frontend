import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
        <AlertTriangle size={22} className="text-red-500" />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold text-zinc-800 mb-1">Something went wrong</h3>
        <p className="text-xs text-zinc-500 max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-xs gap-1.5">
          <RefreshCw size={13} /> Try again
        </button>
      )}
    </div>
  )
}
