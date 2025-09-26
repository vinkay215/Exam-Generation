import { cookies } from "next/headers"
import { UserModel } from "./models/user"
import { SessionModel } from "./models/session"

export interface SessionUser {
  id: string
  username: string
  email: string
  fullName: string
  role: "user" | "admin"
}

export async function getServerSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session-token")?.value

    if (!sessionToken) {
      return null
    }

    const session = await SessionModel.findValidSession(sessionToken)

    if (!session) {
      return null
    }

    // Get fresh user data from database
    const user = await UserModel.findById(session.userId)

    if (!user || !user.isActive) {
      // Clean up invalid session
      await SessionModel.deleteSession(sessionToken)
      return null
    }

    return {
      id: user._id?.toString() || "",
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    }
  } catch (error) {
    console.error("Session verification error:", error)
    return null
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getServerSession()

  if (!session) {
    throw new Error("Authentication required")
  }

  return session
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth()

  if (session.role !== "admin") {
    throw new Error("Admin access required")
  }

  return session
}
