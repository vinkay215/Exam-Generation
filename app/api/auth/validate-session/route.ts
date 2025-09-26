import { type NextRequest, NextResponse } from "next/server"
import { SessionModel } from "@/lib/models/session"
import { UserModel } from "@/lib/models/user"

export async function POST(request: NextRequest) {
  try {
    const { sessionToken } = await request.json()

    if (!sessionToken) {
      return NextResponse.json({ error: "No session token provided" }, { status: 401 })
    }

    // Find valid session
    const session = await SessionModel.findValidSession(sessionToken)

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Get user data
    const user = await UserModel.findById(session.userId)

    if (!user || !user.isActive) {
      // Clean up invalid session
      await SessionModel.deleteSession(sessionToken)
      return NextResponse.json({ error: "User not found or inactive" }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    })
  } catch (error) {
    console.error("Session validation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
