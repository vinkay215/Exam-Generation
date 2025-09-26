import { type NextRequest, NextResponse } from "next/server"
import { SessionModel } from "@/lib/models/session"
import { UserModel } from "@/lib/models/user"

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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 })
  }

  try {
    const { newPassword } = await request.json()
    const { id } = params

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Mật khẩu phải có ít nhất 6 ký tự" }, { status: 400 })
    }

    const success = await UserModel.resetPassword(id, newPassword)

    if (!success) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Đặt lại mật khẩu thành công" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Có lỗi xảy ra khi đặt lại mật khẩu" }, { status: 500 })
  }
}
