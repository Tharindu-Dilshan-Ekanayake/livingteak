import { NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongoose'
import Order from '@/models/Order'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(
  _request: Request,
  { params }: RouteParams
) {
  try {
    await connectMongoose()
    const { id } = await params
    const order = await Order.findById(id).lean()
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
  }
}

export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  try {
    await connectMongoose()
    const { id } = await params
    
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Body must be a JSON object' }, { status: 400 })
    }

    const typedBody = body as {
      orderStatus?: unknown
      paymentStatus?: unknown
    }

    const updateData: { orderStatus?: unknown; paymentStatus?: unknown } = {}
    if (typedBody.orderStatus !== undefined) updateData.orderStatus = typedBody.orderStatus
    if (typedBody.paymentStatus !== undefined) updateData.paymentStatus = typedBody.paymentStatus

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating order'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteParams
) {
  try {
    await connectMongoose()
    const { id } = await params
    const order = await Order.findByIdAndDelete(id)
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Order deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Error deleting order' }, { status: 400 })
  }
}
