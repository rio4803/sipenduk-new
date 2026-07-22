import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/app/utils/supabase"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")
    const {data: pengumumanList, error} = await supabase.from("pengumuman").select("*, read_by").or(`kepada.eq.${userId}, kepada.is.null`)
    if(error){
      console.log(error)
      return NextResponse.json({error: "terjadi kesalahan notifikasi"})
    }

    const formattedPengumuman = pengumumanList.map((p: any) => ({
        id: p.id,
        title: p.judul,
        message: p.isi,
        type: "info",
        created_at: p.tanggal,
        recipients: [p.kepada || "all"],
        read_by: p.read_by || [],
        is_announcement: true
      }))

    const sortedNotifications = formattedPengumuman.sort((a: any, b: any) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return NextResponse.json(sortedNotifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
