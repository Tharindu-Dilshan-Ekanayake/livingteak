import { NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongoose'
import Order from '@/models/Order'

type OrderItemInput = {
  productId?: unknown
  name?: unknown
  price?: unknown
  quantity?: unknown
}

type OrderCustomerInput = {
  name?: unknown
  mobile?: unknown
  email?: unknown
  addressLine1?: unknown
  addressLine2?: unknown
  city?: unknown
}

function parseItems(items: unknown) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: 'Order must include at least one item' }
  }

  const parsed = items
    .map((item) => {
      const typed = item as OrderItemInput
      const productId = typeof typed.productId === 'string' ? typed.productId.trim() : ''
      const name = typeof typed.name === 'string' ? typed.name.trim() : ''
      const price =
        typeof typed.price === 'number'
          ? typed.price
          : typeof typed.price === 'string'
            ? Number(typed.price)
            : NaN
      const quantity =
        typeof typed.quantity === 'number'
          ? typed.quantity
          : typeof typed.quantity === 'string'
            ? Number(typed.quantity)
            : NaN

      if (!productId || !name || !Number.isFinite(price) || price < 0 || !Number.isFinite(quantity)) {
        return null
      }

      return {
        productId,
        name,
        price,
        quantity: Math.max(1, Math.floor(quantity)),
      }
    })
    .filter(Boolean) as Array<{ productId: string; name: string; price: number; quantity: number }>

  if (parsed.length === 0) {
    return { error: 'Order items are invalid' }
  }

  return { value: parsed }
}

function parseCustomer(customer: unknown) {
  if (!customer || typeof customer !== 'object') {
    return { error: 'Customer details are required' }
  }

  const typed = customer as OrderCustomerInput
  const name = typeof typed.name === 'string' ? typed.name.trim() : ''
  const mobile = typeof typed.mobile === 'string' ? typed.mobile.trim() : ''
  const email = typeof typed.email === 'string' ? typed.email.trim() : ''
  const addressLine1 = typeof typed.addressLine1 === 'string' ? typed.addressLine1.trim() : ''
  const addressLine2 = typeof typed.addressLine2 === 'string' ? typed.addressLine2.trim() : ''
  const city = typeof typed.city === 'string' ? typed.city.trim() : ''

  if (!name || !mobile || !addressLine1 || !city) {
    return { error: 'Name, mobile, address line 1, and city are required' }
  }

  return {
    value: {
      name,
      mobile,
      email: email || undefined,
      addressLine1,
      addressLine2: addressLine2 || undefined,
      city,
    },
  }
}

function buildSubtotal(items: Array<{ price: number; quantity: number }>) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function GET(request: Request) {
  await connectMongoose()

  const { searchParams } = new URL(request.url)
  const pageParam = searchParams.get('page')
  const limitParam = searchParams.get('limit')
  const qParam = searchParams.get('q')
  const statusParam = searchParams.get('status')

  const hasPaginationParams =
    pageParam !== null ||
    limitParam !== null ||
    (typeof qParam === 'string' && qParam.trim() !== '') ||
    (typeof statusParam === 'string' && statusParam.trim() !== '')

  if (!hasPaginationParams) {
    const orders = await Order.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json(orders)
  }

  const page = Math.max(1, Number(pageParam ?? '1') || 1)
  const limit = Math.min(50, Math.max(1, Number(limitParam ?? '10') || 10))
  const q = typeof qParam === 'string' ? qParam.trim() : ''
  const statusFilter = typeof statusParam === 'string' ? statusParam.trim().toLowerCase() : ''

  const filter: Record<string, unknown> = {}
  if (q) {
    filter['customer.name'] = { $regex: escapeRegExp(q), $options: 'i' }
  }
  if (statusFilter && statusFilter !== 'all') {
    filter.orderStatus = statusFilter
  }

  const skip = (page - 1) * limit
  const [items, totalItems] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
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

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Body must be a JSON object' }, { status: 400 })
  }

  const { customer, items } = body as { customer?: unknown; items?: unknown }

  const parsedCustomer = parseCustomer(customer)
  if ('error' in parsedCustomer) {
    return NextResponse.json({ error: parsedCustomer.error }, { status: 400 })
  }

  const parsedItems = parseItems(items)
  if ('error' in parsedItems) {
    return NextResponse.json({ error: parsedItems.error }, { status: 400 })
  }

  const subtotal = buildSubtotal(parsedItems.value)

  const order = await Order.create({
    customer: parsedCustomer.value,
    items: parsedItems.value,
    subtotal,
  })

  return NextResponse.json(order, { status: 201 })
}
