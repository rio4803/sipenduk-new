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
