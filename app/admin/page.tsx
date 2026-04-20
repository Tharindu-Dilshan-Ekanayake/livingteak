'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('woodmax_token')
    if (!stored) {
      router.push('/login')
      return
    }
    setToken(stored)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('woodmax_token')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
            Admin Dashboard
          </p>
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-zinc-500">You are logged in as an admin.</p>
        </header>

        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-xs text-zinc-500">
          Token present: {token ? 'yes' : 'no'}
        </div>

        <div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
