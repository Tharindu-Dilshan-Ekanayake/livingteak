'use client'

import useLocalStorageValue from '@/lib/useLocalStorageValue'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter()
  const token = useLocalStorageValue('woodmax_token')

  const handleLogout = () => {
    localStorage.removeItem('woodmax_token')
    router.push('/login')
  }

  return (
    <div className="flex w-full flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      

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
  )
}
