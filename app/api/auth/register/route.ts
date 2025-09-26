import { type NextRequest, NextResponse } from "next/server"
import { UserModel } from "@/lib/models/user"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, fullName } = await request.json()

    if (!username || !email || !password || !fullName) {
      return NextResponse.json({ error: "Tất cả các trường là bắt buộc" }, { status: 400 })
    }

    // Check if username already exists
    const existingUser = await UserModel.findByUsername(username)
    if (existingUser) {
      return NextResponse.json({ error: "Tên đăng nhập đã tồn tại" }, { status: 409 })
    }

    // Check if email already exists
    const existingEmail = await UserModel.findByEmail(email)
    if (existingEmail) {
      return NextResponse.json({ error: "Email đã được sử dụng" }, { status: 409 })
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ error: "Mật khẩu phải có ít nhất 6 ký tự" }, { status: 400 })
    }

    const user = await UserModel.createUser({
      username,
      email,
      password,
      fullName,
    })

    return NextResponse.json({
      success: true,
      message: "Đăng ký thành công",
      user: {
        id: user._id?.toString(),
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Có lỗi xảy ra trong quá trình đăng ký" }, { status: 500 })
  }
}
