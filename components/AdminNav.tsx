'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

type NavItem = {
  label: string
  href: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Products', href: '/admin/products' },
  
  { label: 'Order', href: '/admin/orders' },
  { label: 'Messages', href: '/admin/messages' },
  { label: 'Settings', href: '/admin/settings' },
]

export default function AdminNav({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('woodmax_token')
    window.dispatchEvent(new Event('local-storage'))
    onNavigate?.()
    router.replace('/login')
  }

  return (
    <nav className="flex h-full min-h-0 flex-col gap-4 text-zinc-100">
      <div className="px-2 pt-1">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-400">
          Admin
        </p>
      </div>

      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                onClick={onNavigate}
                className={
                  isActive
                    ? 'block rounded-xl bg-zinc-800 px-4 py-2 text-sm font-semibold text-white ring-1 ring-emerald-400/30'
                    : 'block rounded-xl px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800 hover:text-white'
                }
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-auto border-t border-zinc-800 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center rounded-xl border border-zinc-800 bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
