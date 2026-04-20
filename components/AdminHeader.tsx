import React from 'react'

export default function AdminHeader({label}: {label: string}) {
  return (
    <div  className="flex w-full flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">{label}</h1>
    </div>
  )
}
