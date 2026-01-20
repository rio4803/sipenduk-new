"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell, BellOff } from "lucide-react"
import { subscribeToPush, unsubscribeFromPush } from "@/lib/push-notifications"

export function NotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscription()
    }
  }, [])

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error("Error checking subscription:", error)
    }
  }

  async function handleSubscribe() {
    try {
      // Request notification permission
      const permission = await Notification.requestPermission()
      
      if (permission !== 'granted') {
        alert('Notifikasi ditolak. Silakan aktifkan notifikasi di pengaturan browser.')
        return
      }

      const success = await subscribeToPush()

      if (success) {
        setIsSubscribed(true)
        alert('Berhasil berlangganan notifikasi!')
      } else {
        alert('Gagal berlangganan notifikasi')
      }
    } catch (error) {
      console.error('Error subscribing:', error)
      alert('Terjadi kesalahan saat berlangganan notifikasi')
    }
  }

  async function handleUnsubscribe() {
    try {
      const success = await unsubscribeFromPush()
      if (success) {
        setIsSubscribed(false)
        alert('Berhasil berhenti berlangganan notifikasi')
      }
    } catch (error) {
      console.error('Error unsubscribing:', error)
      alert('Gagal berhenti berlangganan notifikasi')
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
    >
      {isSubscribed ? (
        <>
          <BellOff className="h-4 w-4 mr-2" />
          Nonaktifkan Notifikasi
        </>
      ) : (
        <>
          <Bell className="h-4 w-4 mr-2" />
          Aktifkan Notifikasi
        </>
      )}
    </Button>
  )
}
