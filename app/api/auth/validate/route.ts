import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/app/utils/supabase"

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ valid: false, message: "No user ID provided" }, { status: 401 })
    }

    const {data: user, error} = await supabase.from("pengguna").select("*").eq("id", id);
    if (!user || error) {
      console.log(error)
      return NextResponse.json({ valid: false}, { status: 401 })
    }

    return NextResponse.json({ valid: true, user })
  } catch (error) {
    console.error("Error validating user:", error)
    return NextResponse.json({ valid: false}, { status: 500 })
  }
}

