const colorMap = {
  teal:   'bg-brand-50 text-brand-700',
  green:  'bg-emerald-50 text-emerald-700',
  red:    'bg-red-50 text-red-600',
  amber:  'bg-amber-50 text-amber-700',
  violet: 'bg-violet-50 text-violet-700',
}

export default function StatCard({ label, value, icon: Icon, color = 'teal', sub }) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
        {Icon && <Icon size={20} />}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide truncate">{label}</p>
        <p className="text-2xl font-bold text-zinc-900 leading-tight mt-0.5">{value}</p>
        {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
