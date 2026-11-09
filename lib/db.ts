import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hipg_dtvs';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  isAvailable: boolean;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
  isAvailable: false,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<{ isConnected: boolean; mongooseInstance: typeof mongoose | null }> {
  if (cached.conn) {
    return { isConnected: true, mongooseInstance: cached.conn };
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2000, // Quick timeout to prevent blocking if Mongo is offline
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        cached.isAvailable = true;
        return mongoose;
      })
      .catch((err) => {
        // Log notice that MongoDB is unavailable and fallback persistence is active
        cached.isAvailable = false;
        return null as any;
      });
  }

  try {
    cached.conn = await cached.promise;
    return {
      isConnected: !!cached.conn && cached.isAvailable,
      mongooseInstance: cached.conn,
    };
  } catch (e) {
    cached.promise = null;
    return { isConnected: false, mongooseInstance: null };
  }
}

