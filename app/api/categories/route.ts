import { NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongoose'
import Category from '@/models/Category'
import Product from '@/models/Product'

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function parseCategory(body: unknown) {
  if (!body || typeof body !== 'object') {
    return { error: 'Body must be a JSON object' }
  }

  const { name } = body as { name?: unknown }
  const parsedName = typeof name === 'string' ? name.trim() : ''

  if (!parsedName) {
    return { error: 'Category name is required' }
  }

  return { value: { name: parsedName } }
}

export async function GET(request: Request) {
  await connectMongoose()

  const { searchParams } = new URL(request.url)
  const activeParam = searchParams.get('active')

  const active =
    typeof activeParam === 'string'
      ? activeParam.trim().toLowerCase() === 'true'
        ? true
        : activeParam.trim().toLowerCase() === 'false'
          ? false
          : undefined
      : undefined

  const categories = await Category.find().sort({ name: 1 }).lean()

  const match: Record<string, unknown> = {}
  if (active !== undefined) {
    match.active = active
  }

  const counts = await Product.aggregate([
    { $match: match },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ])

  const countMap = new Map<string, number>()
  for (const entry of counts) {
    if (typeof entry?._id === 'string' && Number.isFinite(entry?.count)) {
      countMap.set(entry._id, Number(entry.count))
    }
  }

  let items = categories.map((category) => {
    const name = typeof category?.name === 'string' ? category.name : ''
    return {
      _id: String(category._id),
      name,
      count: countMap.get(name) ?? 0,
    }
  })

  if (active !== undefined) {
    items = items.filter((item) => item.count > 0)
  }

  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  await connectMongoose()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = parseCategory(body)
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const name = parsed.value.name
  const existing = await Category.findOne({
    name: { $regex: `^${escapeRegExp(name)}$`, $options: 'i' },
  }).lean()

  if (existing) {
    return NextResponse.json({ error: 'Category already exists' }, { status: 409 })
  }

  const category = await Category.create(parsed.value)
  return NextResponse.json(category, { status: 201 })
}
