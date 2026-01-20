"use client"

import { useState, useEffect } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  const [defaultAdmin, setDefaultAdmin] = useState<{ username: string; password: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      try {
        const response = await fetch("/api/auth/check-admin")
        const generatedAdmin = await response.json()

        if (Object.keys(generatedAdmin).length > 0) {
          setDefaultAdmin(generatedAdmin)
        }
      } catch (err) {
        console.error("Error checking admin:", err)
        setError("Terjadi kesalahan saat menyiapkan halaman login. Silakan coba lagi nanti.")
      } finally {
        setIsLoading(false)
      }
    }

    checkAdmin()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="absolute right-4 top-4">
          <ModeToggle />
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        {error ? (
          <div className="bg-destructive/10 p-4 rounded-md text-destructive">
            <h2 className="font-bold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        ) : (
          <LoginForm defaultAdmin={defaultAdmin} />
        )}
      </div>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} SIPENDUK. Hak Cipta Dilindungi.
      </footer>
    </div>
  )
}

