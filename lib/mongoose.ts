import mongoose from 'mongoose'

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseCache
}

const cached = globalWithMongoose.mongoose ?? { conn: null, promise: null }

globalWithMongoose.mongoose = cached

export async function connectMongoose() {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI in environment')
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri)
  }

  cached.conn = await cached.promise
  return cached.conn
}
