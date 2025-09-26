import { type NextRequest, NextResponse } from "next/server"
import { SessionModel } from "@/lib/models/session"
import { UserModel } from "@/lib/models/user"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

async function verifyAdmin(request: NextRequest) {
  const sessionToken = request.cookies.get("session-token")?.value

  if (!sessionToken) {
    return null
  }

  try {
    const session = await SessionModel.findValidSession(sessionToken)

    if (!session) {
      return null
    }

    const user = await UserModel.findById(session.userId)

    if (!user || user.role !== "admin" || !user.isActive) {
      return null
    }

    return user
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 })
  }

  try {
    const users = await UserModel.getAllUsers()
    const sanitizedUsers = users.map((user) => ({
      id: user._id?.toString(),
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }))

    return NextResponse.json({ users: sanitizedUsers })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Có lỗi xảy ra khi lấy danh sách người dùng" }, { status: 500 })
  }
}
