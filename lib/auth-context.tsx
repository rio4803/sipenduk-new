"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

export type User = {
  id: string
  name: string
  username: string
  role: "admin" | "penduduk"
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    async function validateUser(){
      const storedUser = localStorage.getItem("user")
      if(storedUser){
        setUser(JSON.parse(storedUser))
        const validate = await fetch("/api/auth/validate", {
          method: "POST",
          body: storedUser
        })
        const result = await validate.json()
        if(result.valid){
          setUser(JSON.parse(storedUser))
        } else {
          localStorage.removeItem("user")
        }
      }
    }
    

    validateUser()
    setIsLoading(false)
  }, [])

  // Handle redirects based on auth state
  useEffect(() => {
    if (isLoading) return

    // If no user and on protected route, redirect to login
    if (!user && (pathname.startsWith("/admin") || pathname.startsWith("/dashboard"))) {
      router.push("/login")
      return
    }

    // If user exists and on login page, redirect to appropriate dashboard
    if (user && pathname === "/login") {
      if (user.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/dashboard")
      }
      return
    }

    // If user is not admin but on admin route, redirect to dashboard
    if (user && user.role !== "admin" && pathname.startsWith("/admin")) {
      router.push("/dashboard")
      return
    }
  }, [user, isLoading, pathname, router])

  const login = async (username: string, password: string) => {
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
        return { success: false, error: data.error || "Login gagal" }
      }

      // Save user to state and localStorage
      setUser(data.user)
      localStorage.setItem("user", JSON.stringify(data.user))

      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Terjadi kesalahan saat login" }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

