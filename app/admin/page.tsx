"use client"

import { useAuth } from "@/lib/auth"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Shield } from "lucide-react"

export default function AdminPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/")
        return
      }

      if (user?.role !== "admin") {
        router.push("/")
        return
      }

      setIsAuthorized(true)
    }
  }, [user, isLoading, isAuthenticated, router])

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Kiểm tra quyền truy cập
            </CardTitle>
            <CardDescription>Đang xác thực quyền quản trị...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminDashboard />
    </div>
  )
}
