'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'


const NAV_ITEMS = [
	{ id: 'home', href: '#home', label: 'Home' },
	{ id: 'products', href: '#products', label: 'Product' },
	{ id: 'about', href: '#about', label: 'About' },
	{ id: 'contact', href: '#contact', label: 'Contact us' },
] as const

type SectionId = (typeof NAV_ITEMS)[number]['id']

function getActiveSectionFromScroll(sectionIds: readonly SectionId[]) {
	const headerOffset = 90
	for (let i = sectionIds.length - 1; i >= 0; i--) {
		const id = sectionIds[i]
		const el = document.getElementById(id)
		if (!el) continue
		const top = el.getBoundingClientRect().top
		if (top <= headerOffset) return id
	}
	return sectionIds[0] ?? 'home'
}

export default function WebNav() {
	const sectionIds = useMemo(() => NAV_ITEMS.map((x) => x.id), [])
	const [activeId, setActiveId] = useState<SectionId>('home')
	const [isMobileOpen, setIsMobileOpen] = useState(false)

	useEffect(() => {
		if (!isMobileOpen) return

		const previousBodyOverflow = document.body.style.overflow
		const previousHtmlOverflow = document.documentElement.style.overflow
		document.body.style.overflow = 'hidden'
		document.documentElement.style.overflow = 'hidden'

		return () => {
			document.body.style.overflow = previousBodyOverflow
			document.documentElement.style.overflow = previousHtmlOverflow
		}
	}, [isMobileOpen])

	useEffect(() => {
		let rafId = 0
		const onScrollOrResize = () => {
			if (rafId) cancelAnimationFrame(rafId)
			rafId = requestAnimationFrame(() => {
				setActiveId(getActiveSectionFromScroll(sectionIds))
			})
		}

		const onHashChange = () => {
			const next = window.location.hash.replace('#', '') as SectionId
			if (sectionIds.includes(next)) setActiveId(next)
		}

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setIsMobileOpen(false)
		}

		window.addEventListener('scroll', onScrollOrResize, { passive: true })
		window.addEventListener('resize', onScrollOrResize)
		window.addEventListener('hashchange', onHashChange)
		window.addEventListener('keydown', onKeyDown)

		onScrollOrResize()
		return () => {
			if (rafId) cancelAnimationFrame(rafId)
			window.removeEventListener('scroll', onScrollOrResize)
			window.removeEventListener('resize', onScrollOrResize)
			window.removeEventListener('hashchange', onHashChange)
			window.removeEventListener('keydown', onKeyDown)
		}
	}, [sectionIds])

	const linkClass = (id: SectionId) =>
		[
			'rounded-md px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70',
			id === activeId
				? 'text-emerald-300'
				: 'text-white/90 hover:text-emerald-300',
		].join(' ')

	return (
		<>
			<header className="fixed inset-x-0 top-0 z-50 border-b border-emerald-500/30 bg-black/90 backdrop-blur">
			<nav className="flex h-16 w-full items-center justify-between px-4 sm:px-6">
				<Link
					href="#home"
					onClick={() => setIsMobileOpen(false)}
					className="font-semibold tracking-wide text-white"
				>
					<span className="text-emerald-400">Living</span>
					<span className="text-white">Teak</span>
				</Link>

				<div className="hidden items-center gap-1 text-sm md:flex">
					{NAV_ITEMS.map((item) => (
						<Link
							key={item.id}
							href={item.href}
							aria-current={item.id === activeId ? 'page' : undefined}
							className={linkClass(item.id)}
						>
							{item.label}
						</Link>
					))}
				</div>

				<button
					type="button"
					className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white md:hidden"
					aria-label="Toggle navigation"
					onClick={() => setIsMobileOpen((v) => !v)}
				>
					<span className="sr-only">Menu</span>
					<span className="flex flex-col gap-1">
						<span className="h-0.5 w-5 rounded bg-white" />
						<span className="h-0.5 w-5 rounded bg-white" />
						<span className="h-0.5 w-5 rounded bg-white" />
					</span>
				</button>
			</nav>

			</header>

			<div className={isMobileOpen ? 'md:hidden' : 'hidden'}>
			<button
				type="button"
				aria-label="Close navigation"
				className="fixed inset-0 z-40 bg-black/70"
				onClick={() => setIsMobileOpen(false)}
			/>
			<aside
				className={
					'fixed inset-y-0 left-0 z-50 w-full transform bg-black text-white transition-transform duration-200 ease-out ' +
					(isMobileOpen ? 'translate-x-0' : '-translate-x-full')
				}
			>
				<div className="flex h-16 items-center justify-between border-b border-emerald-500/20 px-4 sm:px-6">
					<p className="text-sm font-semibold">Menu</p>
					<button
						type="button"
						aria-label="Close navigation"
						className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10"
						onClick={() => setIsMobileOpen(false)}
					>
						<span className="text-xl">×</span>
					</button>
				</div>
				<div className="px-4 py-6 sm:px-6">
					<nav className="grid gap-3 text-base">
						{NAV_ITEMS.map((item) => (
							<Link
								key={item.id}
								href={item.href}
								aria-current={item.id === activeId ? 'page' : undefined}
								className={linkClass(item.id)}
								onClick={() => setIsMobileOpen(false)}
							>
								{item.label}
							</Link>
						))}
					</nav>
				</div>
			</aside>
			</div>
		</>
	)
}
