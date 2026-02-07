import { supabase } from "@/app/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    const {user_id} = await req.json()
    const {error} = await supabase.from("push_subscriptions").delete().eq("user_id", user_id)
    if(error){
        console.log(error);
        return NextResponse.json({success: false})
    }
    
    return NextResponse.json({success: true})
}