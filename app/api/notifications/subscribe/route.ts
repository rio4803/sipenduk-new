import { NextRequest, NextResponse } from "next/server"
import { getRedisData, setRedisData, getRedisKeys, deleteRedisData } from "@/lib/redis-service"

// Store push subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscription, userId } = body

    if (!subscription) {
      return NextResponse.json({ error: "Subscription is required" }, { status: 400 })
    }

    // Get all existing subscriptions
    const keys = await getRedisKeys("push_subscription:*")
    const subscriptionList = await Promise.all(keys.map((key) => getRedisData(key)))
    const subscriptionIds = subscriptionList.map((s) => (s ? s.id : 0))
    const newId = subscriptionIds.length > 0 ? Math.max(...subscriptionIds) + 1 : 1

    // Store subscription
    const newSubscription = {
      id: newId,
      subscription,
      userId: userId || null,
      createdAt: new Date().toISOString(),
    }

    await setRedisData(`push_subscription:${newId}`, newSubscription)

    return NextResponse.json({ success: true, data: newSubscription })
  } catch (error) {
    console.error("Error storing subscription:", error)
    return NextResponse.json({ error: "Failed to store subscription" }, { status: 500 })
  }
}

// Get all subscriptions (for admin)
export async function GET(request: NextRequest) {
  try {
    const keys = await getRedisKeys("push_subscription:*")
    const subscriptionPromises = keys.map((key) => getRedisData(key))
    const subscriptions = await Promise.all(subscriptionPromises)

    return NextResponse.json({ success: true, data: subscriptions.filter(Boolean) })
  } catch (error) {
    console.error("Error fetching subscriptions:", error)
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
  }
}

// Delete subscription (unsubscribe)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
    }

    await deleteRedisData(`push_subscription:${id}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting subscription:", error)
    return NextResponse.json({ error: "Failed to delete subscription" }, { status: 500 })
  }
}
