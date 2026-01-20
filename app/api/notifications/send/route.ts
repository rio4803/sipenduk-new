import { NextRequest, NextResponse } from "next/server"
import { sendPushNotificationToAll } from "@/lib/push-notification-server"

// Send push notification to all subscribed users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, body: messageBody, data } = body

    if (!title || !messageBody) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 })
    }

    const result = await sendPushNotificationToAll({
      title,
      body: messageBody,
      data
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to send" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      sent: result.sent,
      failed: result.failed,
      message: `Notification sent to ${result.sent} subscribers`
    })
  } catch (error) {
    console.error("Error sending notification:", error)
  }
}
