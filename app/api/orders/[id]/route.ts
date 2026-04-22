import { NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongoose'
import Order from '@/models/Order'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoose()
    const { id } = await params
    const order = await Order.findById(id).lean()
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoose()
    const { id } = await params
    
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const updateData: any = {}
    if (body.orderStatus) updateData.orderStatus = body.orderStatus
    if (body.paymentStatus !== undefined) updateData.paymentStatus = body.paymentStatus

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating order' }, { status: 400 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoose()
    const { id } = await params
    const order = await Order.findByIdAndDelete(id)
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Order deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting order' }, { status: 400 })
  }
}
