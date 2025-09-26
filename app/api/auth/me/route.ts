import { type NextRequest, NextResponse } from "next/server"
import { SessionModel } from "@/lib/models/session"
import { UserModel } from "@/lib/models/user"

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session-token")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Không có session" }, { status: 401 })
    }

    const session = await SessionModel.findValidSession(sessionToken)

    if (!session) {
      return NextResponse.json({ error: "Session không hợp lệ" }, { status: 401 })
    }

    const user = await UserModel.findById(session.userId)

    if (!user || !user.isActive) {
      // Clean up invalid session
      await SessionModel.deleteSession(sessionToken)
      return NextResponse.json({ error: "Người dùng không tồn tại" }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user._id?.toString(),
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 })
  }
}
