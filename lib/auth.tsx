"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

export interface User {
  id: string
  username: string
  email: string
  fullName: string
  role: "user" | "admin"
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (
    username: string,
    password: string,
    email: string,
    fullName: string,
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

class AuthService {
  async register(
    username: string,
    password: string,
    email: string,
    fullName: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, email, fullName }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || "Đăng ký thất bại" }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: "Có lỗi xảy ra trong quá trình đăng ký" }
    }
  }

  async login(username: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || "Đăng nhập thất bại" }
      }

      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, error: "Có lỗi xảy ra trong quá trình đăng nhập" }
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch("/api/auth/me")

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.user
    } catch (error) {
      return null
    }
  }
}

const authService = new AuthService()

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  const checkAuth = async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    const user = await authService.getCurrentUser()
    setAuthState({
      user,
      isLoading: false,
      isAuthenticated: !!user,
    })
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (username: string, password: string) => {
    const result = await authService.login(username, password)
    if (result.success && result.user) {
      setAuthState({
        user: result.user,
        isLoading: false,
        isAuthenticated: true,
      })
    }
    return result
  }

  const register = async (username: string, password: string, email: string, fullName: string) => {
    return await authService.register(username, password, email, fullName)
  }

  const logout = async () => {
    await authService.logout()
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
