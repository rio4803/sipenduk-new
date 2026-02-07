import { supabase } from "@/app/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    const {user_id} = await req.json()
    const {data, error} = await supabase.from("push_subscriptions").select("*").eq("user_id", user_id).single()
    if(error||!data){
        console.log(error)
        return NextResponse.json({subsStatus: false})
    }
    return NextResponse.json({subsStatus: true})
}