import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/app/utils/supabase"

// Store push subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, user_id } = body

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }
    
    const {error} = await supabase.from("push_subscriptions").insert({user_id,token})
    if(error){
      if(error.code == "23505"){
        const {error} = await supabase.from("push_subscriptions").update({token}).eq("id", user_id)
        if(error){
          console.log(error)
          return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 400 })
        }
      } else {
        console.log(error)
        return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error storing subscription:", error)
    return NextResponse.json({ error: "Failed to store subscription" }, { status: 500 })
  }
}

// // Get all subscriptions (for admin)
// export async function GET(request: NextRequest) {
//   try {
//     const keys = await getRedisKeys("push_subscription:*")
//     const subscriptionPromises = keys.map((key) => getRedisData(key))
//     const subscriptions = await Promise.all(subscriptionPromises)

//     return NextResponse.json({ success: true, data: subscriptions.filter(Boolean) })
//   } catch (error) {
//     console.error("Error fetching subscriptions:", error)
//     return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
//   }
// }

// // Delete subscription (unsubscribe)
// export async function DELETE(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const id = searchParams.get("id")

//     if (!id) {
//       return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
//     }

//     await deleteRedisData(`push_subscription:${id}`)

//     return NextResponse.json({ success: true })
//   } catch (error) {
//     console.error("Error deleting subscription:", error)
//     return NextResponse.json({ error: "Failed to delete subscription" }, { status: 500 })
//   }
// }
