"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, User, Shield, Database } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { AuthModal } from "./auth/auth-modal"
import { UserMenu } from "./auth/user-menu"
import { useRouter } from "next/navigation"

interface HeaderProps {
  onNavigationChange?: (view: "home" | "guide" | "database") => void
  currentView?: "home" | "guide" | "database"
}

export function Header({ onNavigationChange, currentView = "home" }: HeaderProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const router = useRouter()

  const handleNavigation = (view: "home" | "guide" | "database") => {
    if (onNavigationChange) {
      onNavigationChange(view)
    }
  }

  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigation("home")}>
              <BookOpen className="h-6 w-6" />
              <span className="text-xl font-semibold">QuizKey</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => handleNavigation("home")}
                className={`text-sm transition-colors ${
                  currentView === "home" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Trang chủ
              </button>
              <button
                onClick={() => handleNavigation("guide")}
                className={`text-sm transition-colors ${
                  currentView === "guide"
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Hướng dẫn
              </button>
              {isAuthenticated && (
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Lịch sử
                </a>
              )}
              {user?.role === "admin" && (
                <>
                  <button
                    onClick={() => router.push("/admin")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <Shield className="h-3 w-3" />
                    Quản trị
                  </button>
                  <button
                    onClick={() => handleNavigation("database")}
                    className={`text-sm transition-colors flex items-center gap-1 ${
                      currentView === "database"
                        ? "text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Database className="h-3 w-3" />
                    Database
                  </button>
                </>
              )}
            </nav>

            <div className="flex items-center gap-2">
              {isLoading ? (
                <div className="h-8 w-8 rounded-full bg-secondary animate-pulse" />
              ) : isAuthenticated ? (
                <UserMenu />
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setShowAuthModal(true)}>
                  <User className="h-4 w-4 mr-2" />
                  Đăng nhập
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}
