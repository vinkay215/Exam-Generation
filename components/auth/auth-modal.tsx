"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login")

  const handleSuccess = () => {
    onClose()
    setMode("login") // Reset to login for next time
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">{mode === "login" ? "Đăng nhập" : "Đăng ký"}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center">
          {mode === "login" ? (
            <LoginForm onSuccess={handleSuccess} onSwitchToRegister={() => setMode("register")} />
          ) : (
            <RegisterForm onSuccess={() => setMode("login")} onSwitchToLogin={() => setMode("login")} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
