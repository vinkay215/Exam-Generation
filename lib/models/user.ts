import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export interface User {
  _id?: ObjectId
  username: string
  email: string
  password: string
  fullName: string
  role: "user" | "admin"
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  lastLoginAt?: Date
}

export class UserModel {
  private static collection = "users"

  private static async safeGetDatabase() {
    try {
      return await getDatabase()
    } catch (error) {
      if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "production") {
        // During build time, throw a more specific error
        throw new Error("Database not available during build time")
      }
      throw error
    }
  }

  static async createUser(
    userData: Omit<User, "_id" | "createdAt" | "updatedAt" | "role" | "isActive">,
  ): Promise<User> {
    const db = await this.safeGetDatabase()
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    const user: Omit<User, "_id"> = {
      ...userData,
      password: hashedPassword,
      role: "user",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection(this.collection).insertOne(user)
    return { ...user, _id: result.insertedId }
  }

  static async findByUsername(username: string): Promise<User | null> {
    const db = await this.safeGetDatabase()
    return await db.collection<User>(this.collection).findOne({ username })
  }

  static async findByEmail(email: string): Promise<User | null> {
    const db = await this.safeGetDatabase()
    return await db.collection<User>(this.collection).findOne({ email })
  }

  static async findById(id: string): Promise<User | null> {
    const db = await this.safeGetDatabase()
    return await db.collection<User>(this.collection).findOne({ _id: new ObjectId(id) })
  }

  static async getAllUsers(): Promise<User[]> {
    const db = await this.safeGetDatabase()
    return await db.collection<User>(this.collection).find({}).toArray()
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<boolean> {
    const db = await this.safeGetDatabase()
    const result = await db.collection(this.collection).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    )
    return result.modifiedCount > 0
  }

  static async deleteUser(id: string): Promise<boolean> {
    const db = await this.safeGetDatabase()
    const result = await db.collection(this.collection).deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  static async resetPassword(id: string, newPassword: string): Promise<boolean> {
    const db = await this.safeGetDatabase()
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    const result = await db.collection(this.collection).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      },
    )
    return result.modifiedCount > 0
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  static async initializeAdmin(): Promise<void> {
    try {
      const db = await this.safeGetDatabase()
      const adminExists = await db.collection<User>(this.collection).findOne({ username: "Haiyen" })

      if (!adminExists) {
        const hashedPassword = await bcrypt.hash("Yen2025@", 12)
        await db.collection(this.collection).insertOne({
          username: "Haiyen",
          email: "admin@examgenerator.com",
          password: hashedPassword,
          fullName: "Administrator",
          role: "admin",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    } catch (error) {
      if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "production") {
        console.log("Skipping admin initialization during build")
        return
      }
      throw error
    }
  }

  static async updateLastLogin(userId: string): Promise<boolean> {
    try {
      const db = await this.safeGetDatabase()
      const result = await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            updatedAt: new Date(),
            lastLoginAt: new Date(),
          },
        },
      )
      return result.modifiedCount > 0
    } catch (error) {
      console.error("Update last login error:", error)
      return false
    }
  }
}
