import { NextResponse } from "next/server"
import { testConnection } from "@/lib/mongodb"

export async function POST() {
  try {
    console.log("[v0] Testing database connection...")

    // Check if MONGODB_URI exists
    const hasMongoUri = !!process.env.MONGODB_URI
    console.log("[v0] MONGODB_URI exists:", hasMongoUri)

    if (!hasMongoUri) {
      return NextResponse.json({
        success: false,
        message: "Biến môi trường MONGODB_URI không tồn tại",
        details: {
          mongoUri: false,
          connectionTest: false,
          error: "Thiếu biến môi trường MONGODB_URI. Vui lòng thêm vào Project Settings.",
        },
      })
    }

    // Test actual connection
    const connectionResult = await testConnection()
    console.log("[v0] Connection test result:", connectionResult)

    return NextResponse.json({
      success: connectionResult.success,
      message: connectionResult.message,
      details: {
        mongoUri: true,
        connectionTest: connectionResult.success,
        error: connectionResult.success ? undefined : connectionResult.message,
      },
    })
  } catch (error) {
    console.error("[v0] Database test error:", error)

    const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định"

    return NextResponse.json({
      success: false,
      message: "Lỗi khi kiểm tra kết nối database",
      details: {
        mongoUri: !!process.env.MONGODB_URI,
        connectionTest: false,
        error: errorMessage,
      },
    })
  }
}
