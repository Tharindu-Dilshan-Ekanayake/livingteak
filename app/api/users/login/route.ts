import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { connectMongoose } from '@/lib/mongoose'
import User from '@/models/User'

type LoginPayload = {
  email: string
}

function parseLoginBody(body: unknown) {
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

  if (!parsedPassword) {
    return { error: 'Password is required' }
  }

  return { value: { email: parsedEmail, password: parsedPassword } }
}

function signToken(payload: LoginPayload & { id: string; role: string }) {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('Missing JWT_SECRET in environment')
  }

  return jwt.sign(
    { sub: payload.id, email: payload.email, role: payload.role },
    secret,
    { expiresIn: '7d' }
  )
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = parseLoginBody(body)
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  await connectMongoose()

  const user = await User.findOne({ email: parsed.value.email })
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const passwordOk = await bcrypt.compare(parsed.value.password, user.passwordHash)
  if (!passwordOk) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  let token: string
  try {
    token = signToken({
      id: String(user._id),
      email: user.email,
      role: user.role,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sign token' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  })
}
