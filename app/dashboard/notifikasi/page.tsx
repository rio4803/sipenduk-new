"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import Link from "next/link"

export default function DashboardNotifikasiPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNotifications() {
      if (!user) return
      
      try {
        const response = await fetch(`/api/notifications?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setNotifications(data)
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [user])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Notifikasi</h2>
      </div>

      <div className="grid gap-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <Bell className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Tidak ada notifikasi saat ini</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notif: any) => (
            <Link key={notif.id} href={`/dashboard/notifikasi/${notif.id}`} className="block">
              <Card className={`hover:shadow-md transition-shadow cursor-pointer ${notif.read_by?.includes(user?.id) ? "bg-background" : "bg-muted/30 border-primary/20"}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                       <CardTitle className="text-lg font-medium">{notif.title}</CardTitle>
                       <CardDescription>{format(new Date(notif.created_at), "dd MMMM yyyy HH:mm", { locale: id })}</CardDescription>
                    </div>
                    <span className="text-xs text-primary font-medium flex items-center gap-1">
                      Balas Pesan &rarr;
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80">{notif.message}</p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
