import webpush from "web-push"
import { getRedisKeys, getRedisData } from "@/lib/redis-service"

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!
const vapidEmail = process.env.VAPID_EMAIL || "mailto:admin@sipenduk.com"

if (vapidPublicKey && vapidPrivateKey) {
    // Ensure email has mailto: prefix if not a URL
    const validSubject = vapidEmail.startsWith('http') || vapidEmail.startsWith('mailto:')
        ? vapidEmail
        : `mailto:${vapidEmail}`

    webpush.setVapidDetails(validSubject, vapidPublicKey, vapidPrivateKey)
}

interface PushNotificationPayload {
    title: string
    body: string
    data?: any
}

export async function sendPushNotificationToAll(payload: PushNotificationPayload) {
    try {
        // Notification payload
        const notificationPayload = JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            data: payload.data || { url: "/dashboard/notifikasi" },
        })

        const request = await fetch("/api/notification/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: notificationPayload,
        })
        const response = await request.json()

        if(response.success){
            return {success: true}
        }
        return {error: "terjadi masalah saat mengirim notifikasi"}
    } catch (error) {
        console.error("Error sending push notifications:", error)
        return { success: false, error }
    }
}
