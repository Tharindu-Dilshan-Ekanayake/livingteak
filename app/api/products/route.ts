import { NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongoose'
import Product from '@/models/Product'

function parseProduct(body: unknown) {
  if (!body || typeof body !== 'object') {
    return { error: 'Body must be a JSON object' }
  }

  const { name, price } = body as { name?: unknown; price?: unknown }
  const parsedName = typeof name === 'string' ? name.trim() : ''
  const parsedPrice =
    typeof price === 'number' ? price : typeof price === 'string' ? Number(price) : NaN

  if (!parsedName) {
    return { error: 'Product name is required' }
  }

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return { error: 'Product price must be a number greater than or equal to 0' }
  }

  return { value: { name: parsedName, price: parsedPrice } }
}

export async function GET() {
  await connectMongoose()

  const products = await Product.find().sort({ createdAt: -1 }).lean()
  return NextResponse.json(products)
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
