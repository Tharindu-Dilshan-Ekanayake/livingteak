
'use client'

import { useEffect, useMemo, useState } from 'react'
import InputField from '@/components/InputField'

type Product = {
  _id: string
  name: string
  price: number
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isEditing = useMemo(() => Boolean(editingId), [editingId])

  const loadProducts = async () => {
    setLoading(true)
    setStatus(null)
    try {
      const response = await fetch('/api/products', { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error ?? 'Failed to load products')
      }
      setProducts(data)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadProducts()
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [])

  const resetForm = () => {
    setName('')
    setPrice('')
    setEditingId(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload = {
      name: name.trim(),
      price: Number(price),
    }

    if (!payload.name) {
      setStatus('Product name is required')
      return
    }

    if (!Number.isFinite(payload.price) || payload.price < 0) {
      setStatus('Product price must be a number greater than or equal to 0')
      return
    }

    try {
      const response = await fetch(
        editingId ? `/api/products/${editingId}` : '/api/products',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error ?? 'Failed to save product')
      }
      setStatus(editingId ? 'Product updated' : 'Product added')
      resetForm()
      await loadProducts()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to save product')
    }
  }

  const handleDelete = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error ?? 'Failed to delete product')
      }
      setStatus('Product deleted')
      await loadProducts()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to delete product')
    }
  }

  const startEdit = (product: Product) => {
    setName(product.name)
    setPrice(String(product.price))
    setEditingId(product._id)
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
            Woodmax Inventory
          </p>
          <h1 className="text-3xl font-semibold">Product CRUD</h1>
          <p className="text-sm text-zinc-500">
            Create, update, and delete products with a serverless API.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <InputField
                label="Product name"
                name="name"
                placeholder="Oak table"
                value={name}
                onChange={setName}
              />
            </div>
            <div className="flex flex-col gap-2">
              <InputField
                label="Price"
                name="price"
                type="number"
                placeholder="1200"
                value={price}
                onChange={setPrice}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              {isEditing ? 'Update product' : 'Add product'}
            </button>
            {isEditing ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300"
              >
                Cancel edit
              </button>
            ) : null}
          </div>
          {status ? <p className="text-sm text-zinc-600">{status}</p> : null}
        </form>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Current products</h2>
            <button
              type="button"
              onClick={loadProducts}
              className="rounded-full border border-zinc-200 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            {loading ? (
              <p className="px-6 py-8 text-sm text-zinc-500">Loading products...</p>
            ) : products.length === 0 ? (
              <p className="px-6 py-8 text-sm text-zinc-500">
                No products yet. Add one above.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-200">
                {products.map((product) => (
                  <li key={product._id} className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{product.name}</p>
                      <p className="text-xs text-zinc-500">${product.price.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(product)}
                        className="rounded-full border border-emerald-200 px-4 py-1 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product._id)}
                        className="rounded-full border border-rose-200 px-4 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-300"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
