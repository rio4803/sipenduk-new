"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell, BellOff } from "lucide-react"
import { checkSubscription, subscribeToPush, unsubscribeFromPush } from "@/lib/push-notifications"
import { getToken } from "firebase/messaging"
import { getFirebaseMessaging } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"

export function NotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const {user} = useAuth()

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true)
      checkSubs()
    }
  }, [])

  async function checkSubs(){
    if(!user) return
    const subsStatus = await checkSubscription(user.id)
    setIsSubscribed(subsStatus)
  }

  async function handleSubscribe() {
    if(!user) return
    try {
      // Request notification permission
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      const messaging = await getFirebaseMessaging();
      const permission = await Notification.requestPermission()
      
      if(!messaging){
        alert("FCM belum siap untuk notifikasi!")
        return
      }

      if (permission == 'granted') {
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });
  
        const success = await subscribeToPush(user.id, token) 
        if(success){
          setIsSubscribed(true)
          alert('Berhasil berlangganan notifikasi!')
        } else {
          alert('Gagal berlangganan notifikasi')
        }
        return
      } 
      
      alert('Notifikasi ditolak. Silakan aktifkan notifikasi di pengaturan browser.')
      return
    } catch (error) {
      console.error('Error subscribing:', error)
      alert('Terjadi kesalahan saat berlangganan notifikasi')
    }
  }

  async function handleUnsubscribe() {
    if(!user) return
    try {
      const success = await unsubscribeFromPush(user.id)
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
