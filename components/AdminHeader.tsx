import React from 'react'

export default function AdminHeader({label}: {label: string}) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-none border-x-0 border-y border-zinc-200 bg-white p-4 shadow-none md:gap-6 md:rounded-2xl md:border md:p-6 md:shadow-sm">
      <h1 className="text-2xl font-semibold">{label}</h1>
    </div>
  )
}
