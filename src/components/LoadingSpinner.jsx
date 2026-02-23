export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-400">
      <div className="w-9 h-9 border-[3px] border-zinc-200 border-t-brand-600 rounded-full animate-spin" />
      <p className="text-sm">{text}</p>
    </div>
  )
}
