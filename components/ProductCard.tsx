"use client"

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react"

type ProductCardProps = {
  id: string
  name: string
  price: number
  description?: string
  imageUrl?: string
  active?: boolean
  currencyLabel?: string
}

type ProductDetails = {
  _id: string
  name: string
  price: number
  description?: string
  images?: string[]
}

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
}

const CART_KEY = "woodmax_cart"

export default function ProductCard({
  id,
  name,
  price,
  description,
  imageUrl,
  active = true,
  currencyLabel = 'LKR',
}: ProductCardProps) {
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [details, setDetails] = useState<ProductDetails | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const displayImage = imageUrl ?? details?.images?.[0] ?? ""

  const priceLabel = useMemo(() => {
    return `${currencyLabel} ${price.toFixed(2)}`
  }, [currencyLabel, price])

  const loadDetails = async () => {
    if (details || isLoading) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/products/${id}`, { cache: "no-store" })
      const data = (await response.json()) as ProductDetails
      if (!response.ok) throw new Error("Failed to load product")
      setDetails(data)
    } finally {
      setIsLoading(false)
    }
  }

  const openView = async () => {
    setIsViewOpen(true)
    await loadDetails()
  }

  const openCart = async () => {
    setIsCartOpen(true)
    setQuantity(1)
    await loadDetails()
  }

  const updateCart = () => {
    const stored = localStorage.getItem(CART_KEY)
    const parsed: CartItem[] = stored ? JSON.parse(stored) : []
    const existingIndex = parsed.findIndex((item) => item.id === id)
    if (existingIndex >= 0) {
      parsed[existingIndex].quantity += quantity
    } else {
      parsed.push({ id, name, price, quantity })
    }
    localStorage.setItem(CART_KEY, JSON.stringify(parsed))
    window.dispatchEvent(new Event('local-storage'))
    setIsCartOpen(false)
  }

  return (
    <article className="group flex h-full min-h-55 flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-emerald-500/40">
      <div className="relative h-38 w-full overflow-hidden bg-black/40 sm:h-60">
        {displayImage ? (
          <img src={displayImage} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-white/40">
            No Image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-tight text-white sm:text-base">{name}</h3>
          
        </div>

        <p className="text-xs text-white/80 sm:text-sm">
          <span className="text-[10px] font-semibold text-emerald-300 sm:text-xs">{currencyLabel} </span>
          {price.toFixed(2)}
        </p>

       

        <div className="mt-auto flex gap-2">
          <button
            type="button"
            onClick={openView}
            className="inline-flex w-full items-center justify-center rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-emerald-500/40 hover:text-emerald-200"
          >
            View more
          </button>
          <button
            type="button"
            onClick={openCart}
            className="inline-flex w-full items-center justify-center rounded-lg border border-emerald-500/40 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:border-emerald-400/70 hover:text-emerald-200"
          >
            Add to cart
          </button>
        </div>
      </div>

      {isViewOpen ? (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close product details"
            className="fixed inset-0 bg-black/70"
            onClick={() => setIsViewOpen(false)}
          />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl border-1 border-emerald-500 bg-black p-6 text-white shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">{details?.name ?? name}</h3>
                <p className="mt-1 text-sm text-emerald-300">{priceLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70"
              >
                ×
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="overflow-hidden rounded-xl border border-white/20 bg-black/40">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={details?.name ?? name}
                      className="h-56 w-full object-cover"
                      onClick={() => setImagePreview(displayImage)}
                    />
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(details?.images ?? []).map((url) => (
                    <button
                      type="button"
                      key={url}
                      onClick={() => setImagePreview(url)}
                      className="h-12 w-12 overflow-hidden rounded-lg border border-white/10"
                    >
                      <img src={url} alt="Product" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-white/70">
                  {details?.description ?? description ?? "No description"}
                </p>
                <button
                  type="button"
                  onClick={openCart}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-emerald-500/40 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:border-emerald-400/70 hover:text-emerald-200"
                >
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isCartOpen ? (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 ">
          <button
            type="button"
            aria-label="Close cart"
            className="fixed inset-0 bg-black/70"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-emerald-500/40 bg-black p-6 text-white shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Add to cart</h3>
                <p className="mt-1 text-sm text-white/70">{details?.name ?? name}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70"
              >
                ×
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="text-sm font-semibold text-white/80">Quantity</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="h-8 w-8 rounded-full border border-white/10 text-white"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  aria-label="Quantity"
                  onChange={(event) => {
                    const next = Math.max(1, Number(event.target.value) || 1)
                    setQuantity(next)
                  }}
                  className="h-8 w-16 rounded-lg border border-white/10 bg-black/60 text-center text-sm text-white"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="h-8 w-8 rounded-full border border-white/10 text-white"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-white/70">
              <span>Total</span>
              <span className="text-emerald-300">{currencyLabel} {(price * quantity).toFixed(2)}</span>
            </div>

            <button
              type="button"
              onClick={updateCart}
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-emerald-500/40 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:border-emerald-400/70 hover:text-emerald-200"
            >
              Add to cart
            </button>
          </div>
        </div>
      ) : null}

      {imagePreview ? (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close image"
            className="fixed inset-0 bg-black/70"
            onClick={() => setImagePreview(null)}
          />
          <div className="relative z-10 w-full max-w-5xl">
            <button
              type="button"
              aria-label="Close"
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-zinc-700 backdrop-blur"
              onClick={() => setImagePreview(null)}
            >
              ×
            </button>
            <img src={imagePreview} alt="Product" className="max-h-[85vh] w-full rounded-2xl object-contain" />
          </div>
        </div>
      ) : null}
    </article>
  )
}
