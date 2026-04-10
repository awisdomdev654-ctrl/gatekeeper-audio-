import mongoose from 'mongoose'
import { getEnv } from './env'

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined
}

const cache: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
}

if (!global.mongooseCache) {
  global.mongooseCache = cache
}

export async function connectDB(): Promise<typeof mongoose | null> {
  const { MONGODB_URI } = getEnv()
  if (!MONGODB_URI) {
    return null
  }

  if (cache.conn) {
    return cache.conn
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
  }

  try {
    cache.conn = await cache.promise
  } catch (e) {
    cache.promise = null
    throw e
  }

  return cache.conn
}

export function isMongoConfigured(): boolean {
  return Boolean(getEnv().MONGODB_URI)
}
