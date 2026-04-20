import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectMongoose } from '@/lib/mongoose'
import User from '@/models/User'

function parseRegisterBody(body: unknown) {
  if (!body || typeof body !== 'object') {
    return { error: 'Body must be a JSON object' }
  }

  const { email, password } = body as { email?: unknown; password?: unknown }
  const parsedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
  const parsedPassword = typeof password === 'string' ? password : ''

  if (!parsedEmail) {
    return { error: 'Email is required' }
  }

  if (!parsedEmail.includes('@')) {
    return { error: 'Email is invalid' }
  }

  if (!parsedPassword || parsedPassword.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  return { value: { email: parsedEmail, password: parsedPassword } }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = parseRegisterBody(body)
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  await connectMongoose()

  const existing = await User.findOne({ email: parsed.value.email }).lean()
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(parsed.value.password, 10)

  const user = await User.create({
    email: parsed.value.email,
    passwordHash,
    role: 'admin',
  })

  return NextResponse.json({
    id: user._id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  }, { status: 201 })
}

