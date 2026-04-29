'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import useLocalStorageValue from '@/lib/useLocalStorageValue'

const NAV_ITEMS = [
	{ id: 'home', href: '#home', label: 'Home' },
	{ id: 'products', href: '#products', label: 'Product' },
	{ id: 'about', href: '#about', label: 'About' },
	{ id: 'contact', href: '#contact', label: 'Contact us' },
] as const

type SectionId = (typeof NAV_ITEMS)[number]['id']

type CartItem = {
	id: string
	name: string
	price: number
	quantity: number
}

const CART_KEY = 'woodmax_cart'

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
	const [isCartOpen, setIsCartOpen] = useState(false)
	const [isOrderFormOpen, setIsOrderFormOpen] = useState(false)
	const [orderName, setOrderName] = useState('')
	const [orderMobile, setOrderMobile] = useState('')
	const [orderEmail, setOrderEmail] = useState('')
	const [orderAddress1, setOrderAddress1] = useState('')
	const [orderAddress2, setOrderAddress2] = useState('')
	const [orderCity, setOrderCity] = useState('')
	const [orderMessage, setOrderMessage] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const orderFormRef = useRef<HTMLDivElement | null>(null)
	const cartRaw = useLocalStorageValue(CART_KEY)
	const cartItems = useMemo(() => {
		if (!cartRaw) return [] as CartItem[]
		try {
			const parsed = JSON.parse(cartRaw) as CartItem[]
			return Array.isArray(parsed) ? parsed : []
		} catch {
			return [] as CartItem[]
		}
	}, [cartRaw])
	const cartCount = useMemo(
		() => cartItems.reduce((sum, item) => sum + item.quantity, 0),
		[cartItems]
	)
	const cartTotal = useMemo(
		() => cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0),
		[cartItems]
	)

	const writeCart = (nextItems: CartItem[]) => {
		localStorage.setItem(CART_KEY, JSON.stringify(nextItems))
		window.dispatchEvent(new Event('local-storage'))
	}

	const setItemQuantity = (id: string, nextQuantity: number) => {
		const updated = cartItems.map((item) =>
			item.id === id
				? { ...item, quantity: Math.max(1, nextQuantity) }
				: item
		)
		writeCart(updated)
	}

	const removeItem = (id: string) => {
		const nextItems = cartItems.filter((item) => item.id !== id)
		writeCart(nextItems)
	}

	const clearCart = () => {
		localStorage.removeItem(CART_KEY)
		window.dispatchEvent(new Event('local-storage'))
	}

	const resetOrderForm = () => {
		setOrderName('')
		setOrderMobile('')
		setOrderEmail('')
		setOrderAddress1('')
		setOrderAddress2('')
		setOrderCity('')
	}

	const handleConfirmOrder = async () => {
		setOrderMessage('')
		if (!orderName.trim() || !orderMobile.trim() || !orderAddress1.trim() || !orderCity.trim()) {
			setOrderMessage('Please fill in name, mobile, address line 1, and city.')
			return
		}
		if (cartItems.length === 0) {
			setOrderMessage('Your cart is empty.')
			return
		}

		setIsSubmitting(true)
		try {
			const response = await fetch('/api/orders', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					customer: {
						name: orderName.trim(),
						mobile: orderMobile.trim(),
						email: orderEmail.trim() || undefined,
						addressLine1: orderAddress1.trim(),
						addressLine2: orderAddress2.trim() || undefined,
						city: orderCity.trim(),
					},
					items: cartItems.map((item) => ({
						productId: item.id,
						name: item.name,
						price: item.price,
						quantity: item.quantity,
					})),
				}),
			})

			const data = (await response.json().catch(() => null)) as { error?: string } | null
			if (!response.ok) {
				setOrderMessage(data?.error ?? 'Unable to place order. Please try again.')
				return
			}

			clearCart()
			resetOrderForm()
			setIsOrderFormOpen(false)
			setIsCartOpen(false)
			toast.success('Order placed successfully')
		} catch {
			setOrderMessage('Unable to place order. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleOpenOrderForm = () => {
		if (cartItems.length === 0) return
		setIsOrderFormOpen(true)
		setOrderMessage('')
		requestAnimationFrame(() => {
			orderFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
		})
	}

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
		if (!isCartOpen) return
		queueMicrotask(() => setIsOrderFormOpen(false))

		const previousBodyOverflow = document.body.style.overflow
		const previousHtmlOverflow = document.documentElement.style.overflow
		document.body.style.overflow = 'hidden'
		document.documentElement.style.overflow = 'hidden'

		return () => {
			document.body.style.overflow = previousBodyOverflow
			document.documentElement.style.overflow = previousHtmlOverflow
		}
	}, [isCartOpen])

	useEffect(() => {
		if (cartItems.length > 0) return
		queueMicrotask(() => setIsOrderFormOpen(false))
	}, [cartItems.length])

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
			if (e.key === 'Escape') setIsCartOpen(false)
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
			<header className="fixed inset-x-0 top-0 z-50  bg-black/90 backdrop-blur">
				<nav className="flex h-20 w-full items-center justify-between px-4 sm:px-6">
					<div className="flex items-center gap-3">
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
						<Link
							href="#home"
							onClick={() => setIsMobileOpen(false)}
							className="font-semibold tracking-wide text-white"
						>
							<span className="text-emerald-400">Living</span>
							<span className="text-white">Teak</span>
						</Link>
					</div>

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
						className="relative inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 text-sm font-semibold text-white"
						aria-label="Open cart"
						onClick={() => {
							setOrderMessage('')
							setIsOrderFormOpen(false)
							setIsCartOpen(true)
						}}
					>
						<svg
							viewBox="0 0 24 24"
							className="h-5 w-5"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.6"
						>
							<path
								d="M6 7h13l-1.2 7.2a2 2 0 0 1-2 1.7H9.3a2 2 0 0 1-2-1.5L5.2 3H3"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<circle cx="10" cy="20" r="1.4" />
							<circle cx="17" cy="20" r="1.4" />
						</svg>
						<span className="hidden sm:inline">Cart</span>
						{cartCount > 0 ? (
							<span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-400 px-1 text-[10px] font-semibold text-black">
								{cartCount}
							</span>
						) : null}
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

			{isCartOpen ? (
				<div className="fixed inset-0 z-60 flex items-center justify-center p-4">
					<button
						type="button"
						aria-label="Close cart"
						className="fixed inset-0 bg-black/70"
						onClick={() => setIsCartOpen(false)}
					/>
					<div className="relative z-10 w-full max-w-2xl rounded-2xl border border-emerald-500/40 bg-black text-white shadow-lg">
						<div className="flex max-h-[85vh] flex-col overflow-y-auto p-6">
							<div className="flex items-start justify-between gap-4">
							<div>
								<h3 className="text-lg font-semibold">Your cart</h3>
								<p className="mt-1 text-sm text-white/70">
									{cartCount} item{cartCount === 1 ? '' : 's'}
								</p>
							</div>
							<button
								type="button"
								onClick={() => setIsCartOpen(false)}
								className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70"
							>
								×
							</button>
						</div>

							{cartItems.length === 0 ? (
								<p className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-white/60">
									Your cart is empty.
								</p>
							) : (
								<div className="mt-6 flex flex-col gap-4">
									{cartItems.map((item) => (
										<div
											key={item.id}
											className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
										>
											<div className="flex items-start justify-between gap-3">
												<div>
													<p className="text-sm font-semibold text-white">{item.name}</p>
													<p className="text-xs text-white/60">LKR {item.price.toFixed(2)}</p>
												</div>
												<button
													type="button"
													className="text-xs text-white/60 hover:text-emerald-300"
													onClick={() => removeItem(item.id)}
												>
													Remove
												</button>
											</div>
											<div className="flex items-center justify-between gap-3">
												<div className="flex items-center gap-2">
													<button
														type="button"
														onClick={() => setItemQuantity(item.id, item.quantity - 1)}
														className="h-8 w-8 rounded-full border border-white/10 text-white"
													>
														-
													</button>
													<input
														type="number"
														min={1}
														value={item.quantity}
														aria-label={`Quantity for ${item.name}`}
														onChange={(event) => {
															const next = Math.max(1, Number(event.target.value) || 1)
															setItemQuantity(item.id, next)
														}}
														className="h-8 w-16 rounded-lg border border-white/10 bg-black/60 text-center text-sm text-white"
													/>
													<button
														type="button"
														onClick={() => setItemQuantity(item.id, item.quantity + 1)}
														className="h-8 w-8 rounded-full border border-white/10 text-white"
													>
														+
													</button>
												</div>
												<p className="text-sm font-semibold text-emerald-300">
													LKR {(item.price * item.quantity).toFixed(2)}
												</p>
											</div>
									</div>
								))}

								<div className="mt-2 flex items-center justify-between text-sm text-white/70">
									<span>Total</span>
									<span className="text-emerald-300">LKR {cartTotal.toFixed(2)}</span>
								</div>
							</div>
							)}

							<div className="mt-6 flex flex-wrap items-center justify-between gap-3">
								<button
									type="button"
									onClick={clearCart}
									className="rounded-lg border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 hover:bg-red-400"
								>
									Clear cart
								</button>
								<button
									type="button"
									onClick={handleOpenOrderForm}
									disabled={cartItems.length === 0}
									className={
										'rounded-lg border border-emerald-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 transition hover:border-emerald-400/70 hover:text-emerald-200 ' +
										(cartItems.length === 0
											? 'cursor-not-allowed opacity-50'
											: '')
									}
								>
									Confirm order
								</button>
							</div>

							{isOrderFormOpen ? (
								<div
									ref={orderFormRef}
									className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4"
								>
									<p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
										Order details
									</p>
									<div className="mt-4 grid gap-3 sm:grid-cols-2">
										<div className="sm:col-span-2">
											<label className="text-xs text-white/60">Name</label>
											<input
												value={orderName}
												onChange={(event) => setOrderName(event.target.value)}
												className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
											/>
										</div>
										<div>
											<label className="text-xs text-white/60">Mobile number</label>
											<input
												value={orderMobile}
												onChange={(event) => setOrderMobile(event.target.value)}
												className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
											/>
										</div>
										<div>
											<label className="text-xs text-white/60">Email (optional)</label>
											<input
												value={orderEmail}
												onChange={(event) => setOrderEmail(event.target.value)}
												className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
											/>
										</div>
										<div className="sm:col-span-2">
											<label className="text-xs text-white/60">Address line 1</label>
											<input
												value={orderAddress1}
												onChange={(event) => setOrderAddress1(event.target.value)}
												className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
											/>
										</div>
										<div className="sm:col-span-2">
											<label className="text-xs text-white/60">Address line 2</label>
											<input
												value={orderAddress2}
												onChange={(event) => setOrderAddress2(event.target.value)}
												className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
											/>
										</div>
										<div>
											<label className="text-xs text-white/60">City</label>
											<input
												value={orderCity}
												onChange={(event) => setOrderCity(event.target.value)}
												className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
											/>
										</div>
									</div>

									{orderMessage ? (
										<p className="mt-3 text-xs text-amber-300">{orderMessage}</p>
									) : null}

									<button
										type="button"
										onClick={handleConfirmOrder}
										disabled={isSubmitting}
										className={
											'mt-4 inline-flex w-full items-center justify-center rounded-lg border border-emerald-500/40 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:border-emerald-400/70 hover:text-emerald-200 ' +
											(isSubmitting ? 'cursor-not-allowed opacity-60' : '')
										}
									>
										{isSubmitting ? 'Placing order...' : 'Place order'}
									</button>
								</div>
							) : null}
						</div>
					</div>
				</div>
			) : null}
		</>
	)
}
