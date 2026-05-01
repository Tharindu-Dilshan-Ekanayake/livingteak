import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectMongoose } from '@/lib/mongoose'
import Category from '@/models/Category'
import Product from '@/models/Product'

type RouteParams = { params: Promise<{ id: string }> }

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

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid category id' }, { status: 400 })
  }

  await connectMongoose()

  const category = await Category.findById(id).lean()
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  }

  return NextResponse.json(category)
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid category id' }, { status: 400 })
  }

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

  await connectMongoose()

  const existing = await Category.findById(id).lean()
  if (!existing) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  }

  const nextName = parsed.value.name

  const duplicate = await Category.findOne({
    _id: { $ne: id },
    name: { $regex: `^${escapeRegExp(nextName)}$`, $options: 'i' },
  }).lean()

  if (duplicate) {
    return NextResponse.json({ error: 'Category already exists' }, { status: 409 })
  }

  if (existing.name !== nextName) {
    await Product.updateMany({ category: existing.name }, { $set: { category: nextName } })
  }

  const updated = await Category.findByIdAndUpdate(
    id,
    { name: nextName },
    { new: true, runValidators: true }
  ).lean()

  if (!updated) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  }

  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid category id' }, { status: 400 })
  }

  await connectMongoose()

  const category = await Category.findById(id).lean()
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  }

  const count = await Product.countDocuments({ category: category.name })
  if (count > 0) {
    return NextResponse.json(
      { error: 'Category has products. Remove them first.' },
      { status: 400 }
    )
  }

  await Category.findByIdAndDelete(id).lean()
  return NextResponse.json({ ok: true })
}
