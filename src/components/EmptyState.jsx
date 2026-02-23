import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={24} className="text-zinc-400" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-700 mb-1">{title}</h3>
      {description && <p className="text-xs text-zinc-400 max-w-xs mt-1">{description}</p>}
    </div>
  )
}
