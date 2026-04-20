'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import useLocalStorageValue from '@/lib/useLocalStorageValue'

type AdminShellProps = {
  children: React.ReactNode
}

export default function AdminShell({ children }: AdminShellProps) {
  const router = useRouter()
  const token = useLocalStorageValue('woodmax_token')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (token === null) {
      router.replace('/login')
      return
    }
  }, [router, token])

  if (token === undefined) return null
  if (token === null) return null

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="flex min-h-screen w-full">
        <aside className="hidden w-64 shrink-0 bg-zinc-900 text-zinc-100 md:block">
          <div className="h-full border-r border-zinc-800 p-4">
            <AdminNav />
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3 md:hidden">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-700"
              aria-label="Open admin navigation"
            >
              <span className="sr-only">Open menu</span>
              <span className="flex flex-col gap-1">
                <span className="h-0.5 w-5 rounded bg-zinc-700" />
                <span className="h-0.5 w-5 rounded bg-zinc-700" />
                <span className="h-0.5 w-5 rounded bg-zinc-700" />
              </span>
            </button>
            <p className="text-sm font-semibold text-zinc-900">Admin</p>
          </header>

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>

      <div className={isSidebarOpen ? 'md:hidden' : 'hidden'}>
        <button
          type="button"
          aria-label="Close admin navigation"
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setIsSidebarOpen(false)}
        />
        <aside
          className={
            'fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] transform bg-zinc-900 text-zinc-100 transition-transform duration-200 ease-out ' +
            (isSidebarOpen ? 'translate-x-0' : '-translate-x-full')
          }
        >
          <div className="h-full border-r border-zinc-800 p-4">
            <AdminNav onNavigate={() => setIsSidebarOpen(false)} />
          </div>
        </aside>
      </div>
    </div>
  )
}
