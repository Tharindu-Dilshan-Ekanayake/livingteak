import { NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongoose'
import Category from '@/models/Category'
import Product from '@/models/Product'

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function parseProduct(body: unknown) {
  if (!body || typeof body !== 'object') {
    return { error: 'Body must be a JSON object' }
  }

  const { name, description, price, category, images, active } = body as {
    name?: unknown
    description?: unknown
    category?: unknown
    price?: unknown
    images?: unknown
    active?: unknown
  }
  const parsedName = typeof name === 'string' ? name.trim() : ''
  const parsedDescription = typeof description === 'string' ? description.trim() : ''
  const parsedCategory = typeof category === 'string' ? category.trim() : ''
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

  if (!parsedDescription) {
    return { error: 'Product description is required' }
  }

  if (!parsedCategory) {
    return { error: 'Product category is required' }
  }

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return { error: 'Product price must be a number greater than or equal to 0' }
  }

  const value: Record<string, unknown> = {
    name: parsedName,
    description: parsedDescription,
    category: parsedCategory,
    price: parsedPrice,
  }
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
  const activeParam = searchParams.get('active')
  const categoryParam = searchParams.get('category')
  const distinctParam = searchParams.get('distinct')

  const hasPaginationParams =
    pageParam !== null ||
    limitParam !== null ||
    (typeof qParam === 'string' && qParam.trim() !== '') ||
    (typeof activeParam === 'string' && activeParam.trim() !== '') ||
    (typeof categoryParam === 'string' && categoryParam.trim() !== '') ||
    (typeof distinctParam === 'string' && distinctParam.trim() !== '')

  if (!hasPaginationParams) {
    const products = await Product.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json(products)
  }

  const active =
    typeof activeParam === 'string'
      ? activeParam.trim().toLowerCase() === 'true'
        ? true
        : activeParam.trim().toLowerCase() === 'false'
          ? false
          : undefined
      : undefined

  const category = typeof categoryParam === 'string' ? categoryParam.trim() : ''

  if (distinctParam?.trim() === 'category') {
    const distinctFilter: Record<string, unknown> = {}
    if (active !== undefined) {
      distinctFilter.active = active
    }
    const categories = await Product.distinct('category', distinctFilter)
    const cleaned = categories
      .filter((value): value is string => typeof value === 'string')
      .map((value) => value.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
    return NextResponse.json({ categories: cleaned })
  }

  const page = Math.max(1, Number(pageParam ?? '1') || 1)
  const limit = Math.min(50, Math.max(1, Number(limitParam ?? '9') || 9))
  const q = typeof qParam === 'string' ? qParam.trim() : ''
  const filter: Record<string, unknown> = {}
  if (q) {
    filter.name = { $regex: escapeRegExp(q), $options: 'i' }
  }
  if (category) {
    filter.category = category
  }
  if (active !== undefined) {
    filter.active = active
  }

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

  const categoryName = (parsed.value as { category?: string }).category
  if (typeof categoryName === 'string') {
    const category = await Category.findOne({
      name: { $regex: `^${escapeRegExp(categoryName)}$`, $options: 'i' },
    }).lean()
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 })
    }
  }

  const product = await Product.create(parsed.value)
  return NextResponse.json(product, { status: 201 })
}
