"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import { useAuth } from "@/lib/auth-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface ActivityFeedProps {
  adminView?: boolean
}

export function ActivityFeed({ adminView = false }: ActivityFeedProps) {
  const { user } = useAuth()
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchActivities() {
      if (!user) return

      try {
        const response = await fetch(`/api/activities${adminView ? "" : `?userId=${user.id}`}`)

        if (!response.ok) {
          throw new Error("Failed to fetch activities")
        }

        const data = await response.json()
        setActivities(data)
      } catch (err) {
        console.error("Error fetching activities:", err)
        setError("Gagal memuat aktivitas terkini")
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [user, adminView])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terkini</CardTitle>
          <CardDescription>Memuat aktivitas...</CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <LoadingSpinner size="sm" text="Memuat aktivitas..." />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terkini</CardTitle>
          <CardDescription>Aktivitas dalam sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-destructive text-center">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Terkini</CardTitle>
        <CardDescription>Aktivitas dalam sistem</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.created_at} className="flex items-start border-b pb-4 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.type}
                    {adminView && activity.username && (
                      <span className="ml-2 text-xs text-muted-foreground">oleh {activity.username}</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">Belum ada aktivitas</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

