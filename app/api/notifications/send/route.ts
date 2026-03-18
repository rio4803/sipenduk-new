import { NextRequest, NextResponse } from "next/server"
import { sendPush } from "@/lib/firebase-admin"
import { supabase } from "@/app/utils/supabase"

// Send push notification to all subscribed users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, body: messageBody, data } = body

    if (!title || !messageBody) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 })
    }
    // console.log(body);

    if(!body.target){
      const {data: subs, error} = await supabase.from("push_subscriptions").select("token")
      if(error){
        console.log(error)
        return NextResponse.json({error:"terjadi masalah"})
      }
      const message = {
        notification: {
          title,
          body: messageBody,
        },
        tokens: subs.map(s => s.token)
      }
      console.log(message);
      const response = await sendPush(message)
    } 
    else {
      const {data: subs, error} = await supabase.from("push_subscriptions").select("token").eq("user_id", body.target)
      if(error){
        console.log(error)
        return NextResponse.json({error:"terjadi masalah"})
      }
      const message = {
        notification: {
          title,
          body: messageBody,
        },
        tokens: subs.map(s => s.token)
      }
      console.log(message);
      const response = await sendPush(message)
    }

    return NextResponse.json({
      success: true,
      message: `Notification sent`
    })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json({
      success: false,
      message: `send notification problem`
    })
  }
}
