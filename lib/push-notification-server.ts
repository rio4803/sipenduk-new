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
        // Check if VAPID keys are configured
        if (!vapidPublicKey || !vapidPrivateKey) {
            console.error("VAPID keys not configured")
            return { success: false, error: "VAPID keys not configured" }
        }

        // Get all subscriptions
        const keys = await getRedisKeys("push_subscription:*")
        const subscriptionPromises = keys.map((key) => getRedisData(key))
        const subscriptions = await Promise.all(subscriptionPromises)
        const validSubscriptions = subscriptions.filter(Boolean)

        if (validSubscriptions.length === 0) {
            return { success: true, sent: 0, message: "No subscriptions found" }
        }

        // Notification payload
        const notificationPayload = JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            data: payload.data || { url: "/dashboard/notifikasi" },
        })

        // Send notifications to all subscribers
        let sentCount = 0
        let failedCount = 0

        const sendPromises = validSubscriptions.map(async (sub: any) => {
            try {
                await webpush.sendNotification(sub.subscription, notificationPayload)
                sentCount++
            } catch (error) {
                console.error("Error sending to subscription:", error)
                failedCount++
            }
        })

        await Promise.all(sendPromises)

        return {
            success: true,
            sent: sentCount,
            failed: failedCount
        }
    } catch (error) {
        console.error("Error sending push notifications:", error)
        return { success: false, error }
    }
}
