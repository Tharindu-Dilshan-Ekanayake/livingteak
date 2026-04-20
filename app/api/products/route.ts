import { NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongoose'
import Product from '@/models/Product'

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function parseProduct(body: unknown) {
  if (!body || typeof body !== 'object') {
    return { error: 'Body must be a JSON object' }
  }

  const { name, price, images, active } = body as {
    name?: unknown
    price?: unknown
    images?: unknown
    active?: unknown
  }
  const parsedName = typeof name === 'string' ? name.trim() : ''
  const parsedPrice =
    typeof price === 'number' ? price : typeof price === 'string' ? Number(price) : NaN

  const parsedImages = Array.isArray(images)
    ? images
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.trim())
        .filter(Boolean)
    : undefined

  const parsedActive = typeof active === 'boolean' ? active : undefined

  if (!parsedName) {
    return { error: 'Product name is required' }
  }

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return { error: 'Product price must be a number greater than or equal to 0' }
  }

  const value: Record<string, unknown> = { name: parsedName, price: parsedPrice }
  if (parsedImages) value.images = parsedImages
  if (parsedActive !== undefined) value.active = parsedActive
  return { value }
}

export async function GET(request: Request) {
  await connectMongoose()

  const { searchParams } = new URL(request.url)
  const pageParam = searchParams.get('page')
  const limitParam = searchParams.get('limit')
  const qParam = searchParams.get('q')

  const hasPaginationParams =
    pageParam !== null || limitParam !== null || (typeof qParam === 'string' && qParam.trim() !== '')

  if (!hasPaginationParams) {
    const products = await Product.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json(products)
  }

  const page = Math.max(1, Number(pageParam ?? '1') || 1)
  const limit = Math.min(50, Math.max(1, Number(limitParam ?? '9') || 9))
  const q = typeof qParam === 'string' ? qParam.trim() : ''

  const filter = q ? { name: { $regex: escapeRegExp(q), $options: 'i' } } : {}

  const skip = (page - 1) * limit
  const [items, totalItems] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ])

  const totalPages = Math.max(1, Math.ceil(totalItems / limit))
  return NextResponse.json({ items, page, limit, totalItems, totalPages })
}

export async function POST(request: Request) {
  await connectMongoose()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = parseProduct(body)
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const product = await Product.create(parsed.value)
  return NextResponse.json(product, { status: 201 })
}
