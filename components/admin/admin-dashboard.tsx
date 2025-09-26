"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Edit, Trash2, Key, Shield, UserCheck, UserX, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth"

interface User {
  id: string
  username: string
  email: string
  fullName: string
  role: "user" | "admin"
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function AdminDashboard() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Edit user state
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    isActive: true,
  })

  // Reset password state
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState("")

  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/users")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Không thể tải danh sách người dùng")
      }

      setUsers(data.users)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Có lỗi xảy ra")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      isActive: user.isActive,
    })
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    try {
      setActionLoading("update")
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Không thể cập nhật người dùng")
      }

      setSuccess("Cập nhật người dùng thành công")
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Có lỗi xảy ra")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return

    try {
      setActionLoading(`delete-${userId}`)
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Không thể xóa người dùng")
      }

      setSuccess("Xóa người dùng thành công")
      fetchUsers()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Có lỗi xảy ra")
    } finally {
      setActionLoading(null)
    }
  }

  const handleResetPassword = async () => {
    if (!resetPasswordUser || !newPassword) return

    try {
      setActionLoading("reset-password")
      const response = await fetch(`/api/admin/users/${resetPasswordUser.id}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Không thể đặt lại mật khẩu")
      }

      setSuccess("Đặt lại mật khẩu thành công")
      setResetPasswordUser(null)
      setNewPassword("")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Có lỗi xảy ra")
    } finally {
      setActionLoading(null)
    }
  }

  const clearMessages = () => {
    setError("")
    setSuccess("")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Bảng điều khiển Admin
        </h1>
        <p className="text-muted-foreground mt-2">Chào mừng, {currentUser?.fullName}. Quản lý người dùng hệ thống.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
          <Button variant="outline" size="sm" onClick={clearMessages} className="mt-2 bg-transparent">
            Đóng
          </Button>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <AlertDescription>{success}</AlertDescription>
          <Button variant="outline" size="sm" onClick={clearMessages} className="mt-2 bg-transparent">
            Đóng
          </Button>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quản lý người dùng
          </CardTitle>
          <CardDescription>Danh sách tất cả người dùng trong hệ thống ({users.length} người dùng)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên đăng nhập</TableHead>
                <TableHead>Họ và tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" ? "Admin" : "Người dùng"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge variant="default" className="bg-green-500">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Hoạt động
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <UserX className="h-3 w-3 mr-1" />
                        Vô hiệu
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        disabled={!!actionLoading}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setResetPasswordUser(user)}
                            disabled={!!actionLoading}
                          >
                            <Key className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Đặt lại mật khẩu</DialogTitle>
                            <DialogDescription>Đặt lại mật khẩu cho người dùng: {user.fullName}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="newPassword">Mật khẩu mới</Label>
                              <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Nhập mật khẩu mới"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={handleResetPassword}
                                disabled={!newPassword || actionLoading === "reset-password"}
                              >
                                {actionLoading === "reset-password" && (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                )}
                                Đặt lại
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setResetPasswordUser(null)
                                  setNewPassword("")
                                }}
                              >
                                Hủy
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {user.id !== currentUser?.id && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={actionLoading === `delete-${user.id}`}
                        >
                          {actionLoading === `delete-${user.id}` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>Cập nhật thông tin cho: {editingUser?.username}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editFullName">Họ và tên</Label>
              <Input
                id="editFullName"
                value={editForm.fullName}
                onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="editIsActive"
                checked={editForm.isActive}
                onChange={(e) => setEditForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              />
              <Label htmlFor="editIsActive">Tài khoản hoạt động</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateUser} disabled={actionLoading === "update"}>
                {actionLoading === "update" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Cập nhật
              </Button>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
