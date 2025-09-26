import type { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb"

export interface Session {
  _id?: ObjectId
  userId: string
  sessionToken: string
  expiresAt: Date
  createdAt: Date
  userAgent?: string
  ipAddress?: string
}

export class SessionModel {
  private static collection = "sessions"

  private static async safeGetDatabase() {
    try {
      return await getDatabase()
    } catch (error) {
      if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "production") {
        throw new Error("Database not available during build time")
      }
      throw error
    }
  }

  static async createSession(userId: string, userAgent?: string, ipAddress?: string): Promise<string> {
    const db = await this.safeGetDatabase()

    // Generate a random session token
    const sessionToken = this.generateSessionToken()

    // Session expires in 24 hours
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const session: Omit<Session, "_id"> = {
      userId,
      sessionToken,
      expiresAt,
      createdAt: new Date(),
      userAgent,
      ipAddress,
    }

    await db.collection(this.collection).insertOne(session)
    return sessionToken
  }

  static async findValidSession(sessionToken: string): Promise<Session | null> {
    const db = await this.safeGetDatabase()

    const session = await db.collection<Session>(this.collection).findOne({
      sessionToken,
      expiresAt: { $gt: new Date() },
    })

    return session
  }

  static async deleteSession(sessionToken: string): Promise<boolean> {
    const db = await this.safeGetDatabase()
    const result = await db.collection(this.collection).deleteOne({ sessionToken })
    return result.deletedCount > 0
  }

  static async deleteUserSessions(userId: string): Promise<boolean> {
    const db = await this.safeGetDatabase()
    const result = await db.collection(this.collection).deleteMany({ userId })
    return result.deletedCount > 0
  }

  static async cleanExpiredSessions(): Promise<number> {
    const db = await this.safeGetDatabase()
    const result = await db.collection(this.collection).deleteMany({
      expiresAt: { $lt: new Date() },
    })
    return result.deletedCount || 0
  }

  private static generateSessionToken(): string {
    // Generate a secure random token
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}
