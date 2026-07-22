import { NextRequest, NextResponse } from "next/server"
import { sendPush } from "@/lib/firebase-admin"
import { supabase } from "@/app/utils/supabase"

// Send push notification to all subscribed users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, body: messageBody, data, target } = body

    if (!title || !messageBody) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 })
    }

    // Build FCM data payload (must be Record<string, string>)
    const fcmData: Record<string, string> = {
      url: data?.url || "/dashboard/notifikasi",
    }
    if (data?.pengumumanId) {
      fcmData.pengumumanId = String(data.pengumumanId)
    }

    // Fetch subscriber tokens
    let subs
    if (!target) {
      const result = await supabase.from("push_subscriptions").select("token")
      if (result.error) {
        console.log(result.error)
        return NextResponse.json({ error: "terjadi masalah" })
      }
      subs = result.data
    } else {
      const result = await supabase.from("push_subscriptions").select("token").eq("user_id", target)
      if (result.error) {
        console.log(result.error)
        return NextResponse.json({ error: "terjadi masalah" })
      }
      subs = result.data
    }

    // Guard: skip if no subscribers
    if (!subs || subs.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No subscribers found, notification skipped",
      })
    }

    const relativeUrl = fcmData.url || "/dashboard/notifikasi"
    const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const fullUrl = relativeUrl.startsWith("http") ? relativeUrl : `${origin}${relativeUrl}`

    const message = {
      notification: {
        title,
        body: messageBody,
      },
      data: fcmData,
      webpush: {
        fcm_options: {
          link: fullUrl,
        },
        notification: {
          title,
          body: messageBody,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
        },
      },
      tokens: subs.map((s) => s.token),
    }

    console.log("Sending FCM message:", JSON.stringify(message, null, 2))
    const response = await sendPush(message)

    return NextResponse.json({
      success: true,
      message: `Notification sent`,
    })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json({
      success: false,
      message: `send notification problem`,
    })
  }
}
