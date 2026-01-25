"use client"

import Link from "next/link"
import { MainNav } from "@/components/layout/main-nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { UserNav } from "@/components/layout/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import { subscribeToPush } from "@/lib/push-notifications"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = user?.role === "admin"
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Sistem Informasi Kependudukan"

  useEffect(() => {
    async function checkNotifications() {
      if (!user) return

      try {
        const response = await fetch(`/api/notifications?userId=${user.id}`)
        if (response.ok) {
           const data = await response.json()
           
           // Check for new notifications to show toast
           // We do this by checking if the latest notification ID is different from what we had
           // (Simple logic, can be improved)
           if (notifications.length > 0 && data.length > notifications.length) {
              const latest = data[0]
               // Only show if it's new (created recently) - simple check
              if (new Date(latest.created_at).getTime() > Date.now() - 60000) {
                 toast(latest.title, {
                   description: latest.message,
                   action: {
                     label: "Lihat",
                     onClick: () => router.push(isAdmin ? "/admin/pengumuman" : "/dashboard"),
                   },
                 })
              }
           }
           
           setNotifications(data)
           const unread = data.filter((notif: any) => notif.read_by && !notif.read_by.includes(user.id.toString()))
           setUnreadCount(unread.length)
        }
      } catch (error) {
        console.error("Error checking notifications:", error)
      }
    }

    // checkNotifications()

    // const interval = setInterval(checkNotifications, 30000) // Check every 30s
    // return () => clearInterval(interval)
  }, [user, notifications.length]) // Add notifications.length to deps to compare

  const notificationPath = isAdmin ? "/admin/notifikasi" : "/dashboard/notifikasi"

  // Auto-subscribe to notifications if permission is granted but not subscribed
  useEffect(() => {
    if (!user) return

    async function autoSubscribe() {
      if ('Notification' in window && 'serviceWorker' in navigator) {
        // If permission is default (not asked yet), ask for it
        if (Notification.permission === 'default') {
           try {
             const permission = await Notification.requestPermission()
             if (permission === 'granted') {
               await subscribeToPush(user?.id.toString())
               toast.success("Notifikasi diaktifkan")
             }
           } catch (err) {
             console.error("Error auto-subscribing:", err)
           }
        } 
      }
    }
    
    // Small delay to not block initial render
    const timer = setTimeout(autoSubscribe, 3000)
    return () => clearTimeout(timer)
  }, [user])

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="hidden md:block font-bold mr-6">
          {appName}
        </Link>
        {/* ... rest of header ... */}
        <div className="ml-auto flex items-center space-x-4">
            {/* ... */}
        </div>
        <MainNav />
        <MobileNav />

        <div className="ml-auto flex items-center space-x-4">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />

                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>

                {unreadCount === 0 && (
                  <DropdownMenuItem disabled className="text-muted-foreground">
                    Tidak ada notifikasi baru
                  </DropdownMenuItem>
                )}

                {notifications
                  .filter((n) => !n.read_by.includes(user.id.toString()))
                  .slice(0, 5)
                  .map((notif) => (
                    <DropdownMenuItem
                      key={notif.id}
                      onClick={() => router.push(notificationPath)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{notif.title}</span>
                        <span className="text-xs text-muted-foreground">{notif.message}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}

                <DropdownMenuItem onClick={() => router.push(notificationPath)}>
                  Lihat semua notifikasi →
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
}
