"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, RefreshCw, Database } from "lucide-react"

interface ConnectionStatus {
  success: boolean
  message: string
  details?: {
    mongoUri: boolean
    connectionTest: boolean
    error?: string
  }
}

export function DatabaseStatus() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-db", {
        method: "POST",
      })
      const result = await response.json()
      setStatus(result)
    } catch (error) {
      setStatus({
        success: false,
        message: "Không thể kiểm tra kết nối database",
        details: {
          mongoUri: false,
          connectionTest: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Trạng thái kết nối Database
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Trạng thái kết nối:</span>
          {status === null ? (
            <Badge variant="secondary">Đang kiểm tra...</Badge>
          ) : status.success ? (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Kết nối thành công
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              Kết nối thất bại
            </Badge>
          )}
        </div>

        {status && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              <strong>Chi tiết:</strong> {status.message}
            </div>

            {status.details && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>MONGODB_URI có tồn tại:</span>
                  <Badge variant={status.details.mongoUri ? "default" : "destructive"}>
                    {status.details.mongoUri ? "Có" : "Không"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span>Test kết nối:</span>
                  <Badge variant={status.details.connectionTest ? "default" : "destructive"}>
                    {status.details.connectionTest ? "Thành công" : "Thất bại"}
                  </Badge>
                </div>

                {status.details.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="text-red-800 font-medium">Lỗi chi tiết:</div>
                    <div className="text-red-700 text-xs mt-1 font-mono">{status.details.error}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <Button onClick={testConnection} disabled={loading} className="w-full">
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Đang kiểm tra...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Kiểm tra lại kết nối
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <div>
            <strong>Hướng dẫn khắc phục:</strong>
          </div>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Kiểm tra biến môi trường MONGODB_URI trong Project Settings</li>
            <li>Đảm bảo MongoDB cluster đang hoạt động</li>
            <li>Kiểm tra Network Access List trong MongoDB Atlas</li>
            <li>Xác minh username/password trong connection string</li>
            <li>Kiểm tra firewall và kết nối mạng</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
