import { type NextRequest, NextResponse } from "next/server"
import { SessionModel } from "@/lib/models/session"

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session-token")?.value

    if (sessionToken) {
      await SessionModel.deleteSession(sessionToken)
    }

    const response = NextResponse.json({ success: true })

    response.cookies.set("session-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    const response = NextResponse.json({ success: true })

    // Clear cookie even if database operation fails
    response.cookies.set("session-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
    })

    return response
  }
}
