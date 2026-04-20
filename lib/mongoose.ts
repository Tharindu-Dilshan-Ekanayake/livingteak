import mongoose from 'mongoose'

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI in environment')
}

const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseCache
}

const cached = globalWithMongoose.mongoose ?? { conn: null, promise: null }

globalWithMongoose.mongoose = cached

export async function connectMongoose() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI)
  }

  cached.conn = await cached.promise
  return cached.conn
}
