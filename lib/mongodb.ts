import { MongoClient, type Db } from "mongodb"

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

function getMongoClient(): Promise<MongoClient> {
  // Return early if we're in build time and no MONGODB_URI
  if (!process.env.MONGODB_URI) {
    if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "production") {
      // During build time, return a mock promise that will never be used
      return Promise.reject(new Error("MongoDB not available during build"))
    }
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
  }

  if (clientPromise) {
    return clientPromise
  }

  const uri = process.env.MONGODB_URI
  const options = {}

  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }

  return clientPromise
}

export async function getDatabase(): Promise<Db> {
  const client = await getMongoClient()
  return client.db("exam_generator")
}

export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    if (!process.env.MONGODB_URI) {
      return {
        success: false,
        message: "Biến môi trường MONGODB_URI không tồn tại",
      }
    }

    const client = await getMongoClient()

    // Test the connection by pinging the database
    await client.db("admin").command({ ping: 1 })

    return {
      success: true,
      message: "Kết nối database thành công",
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định"
    return {
      success: false,
      message: `Lỗi kết nối database: ${errorMessage}`,
    }
  }
}

export default getMongoClient
