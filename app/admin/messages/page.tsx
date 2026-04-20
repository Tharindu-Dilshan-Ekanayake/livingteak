export default function AdminMessagesPage() {
  return (
    <div className="flex w-full flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
        Messages
      </p>
      <h1 className="text-2xl font-semibold">Messages</h1>
      <p className="text-sm text-zinc-500">Read and respond to messages here.</p>
    </div>
  )
}
