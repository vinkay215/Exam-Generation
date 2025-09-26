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

// Update user
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 })
  }

  try {
    const { fullName, email, isActive } = await request.json()
    const { id } = params

    const success = await UserModel.updateUser(id, {
      fullName,
      email,
      isActive,
    })

    if (!success) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Cập nhật thành công" })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Có lỗi xảy ra khi cập nhật người dùng" }, { status: 500 })
  }
}

// Delete user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifyAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 })
  }

  try {
    const { id } = params

    // Prevent admin from deleting themselves
    if (admin._id?.toString() === id) {
      return NextResponse.json({ error: "Không thể xóa tài khoản của chính mình" }, { status: 400 })
    }

    const success = await UserModel.deleteUser(id)

    if (!success) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Xóa người dùng thành công" })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Có lỗi xảy ra khi xóa người dùng" }, { status: 500 })
  }
}
