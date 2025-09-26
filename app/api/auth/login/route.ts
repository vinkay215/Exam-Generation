import { type NextRequest, NextResponse } from "next/server"
import { UserModel } from "@/lib/models/user"
import { SessionModel } from "@/lib/models/session"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Tên đăng nhập và mật khẩu là bắt buộc" }, { status: 400 })
    }

    // Initialize admin account if not exists
    try {
      await UserModel.initializeAdmin()
    } catch (error) {
      console.error("Failed to initialize admin:", error)
      // Continue with login attempt even if admin initialization fails
    }

    const user = await UserModel.findByUsername(username)
    if (!user) {
      return NextResponse.json({ error: "Tên đăng nhập hoặc mật khẩu không đúng" }, { status: 401 })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Tài khoản đã bị vô hiệu hóa" }, { status: 401 })
    }

    const isValidPassword = await UserModel.verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Tên đăng nhập hoặc mật khẩu không đúng" }, { status: 401 })
    }

    const userAgent = request.headers.get("user-agent") || undefined
    const ipAddress =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || request.ip || undefined

    const sessionToken = await SessionModel.createSession(user._id?.toString() || "", userAgent, ipAddress)

    // Update last login
    await UserModel.updateLastLogin(user._id?.toString() || "")

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

    response.cookies.set("session-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Có lỗi xảy ra trong quá trình đăng nhập" }, { status: 500 })
  }
}
