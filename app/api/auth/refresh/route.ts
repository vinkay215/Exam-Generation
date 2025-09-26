import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { SessionModel } from "@/lib/models/session"
import { UserModel } from "@/lib/models/user"

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session-token")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "No session provided" }, { status: 401 })
    }

    const session = await SessionModel.findValidSession(sessionToken)

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Get fresh user data
    const user = await UserModel.findById(session.userId)

    if (!user || !user.isActive) {
      // Clean up invalid session
      await SessionModel.deleteSession(sessionToken)
      const response = NextResponse.json({ error: "User not found or inactive" }, { status: 401 })
      response.cookies.delete("session-token")
      return response
    }

    // Update last login
    await UserModel.updateLastLogin(user._id?.toString() || "")

    const userAgent = request.headers.get("user-agent") || undefined
    const ipAddress =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || request.ip || undefined

    // Delete old session and create new one
    await SessionModel.deleteSession(sessionToken)
    const newSessionToken = await SessionModel.createSession(user._id?.toString() || "", userAgent, ipAddress)

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id?.toString(),
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    })

    // Set new session cookie
    response.cookies.set("session-token", newSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Session refresh error:", error)
    const response = NextResponse.json({ error: "Session refresh failed" }, { status: 401 })
    response.cookies.delete("session-token")
    return response
  }
}
