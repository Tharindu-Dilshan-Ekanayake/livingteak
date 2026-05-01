import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectMongoose } from '@/lib/mongoose'
import Category from '@/models/Category'
import Product from '@/models/Product'

type RouteParams = { params: Promise<{ id: string }> }

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

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })
  }

  await connectMongoose()

  const product = await Product.findById(id).lean()
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json(product)
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })
  }

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

  await connectMongoose()

  const product = await Product.findByIdAndUpdate(id, parsed.value, {
    new: true,
    runValidators: true,
  }).lean()

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json(product)
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })
  }

  await connectMongoose()

  const product = await Product.findByIdAndDelete(id).lean()
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
