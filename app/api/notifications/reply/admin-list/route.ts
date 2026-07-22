import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/app/utils/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id_pengumuman = searchParams.get("id_pengumuman")

    if (!id_pengumuman) {
      return NextResponse.json({ error: "Missing id_pengumuman parameter" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("balasan_pengumuman")
      .select("*, warga:warga_id(name, username)")
      .eq("id_pengumuman", id_pengumuman)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching admin chat list:", error)
      return NextResponse.json({ error: "Gagal mengambil daftar balasan" }, { status: 500 })
    }

    const uniqueWargaMap = new Map()
    data.forEach((msg) => {
      if (!uniqueWargaMap.has(msg.warga_id)) {
        uniqueWargaMap.set(msg.warga_id, {
          wargaId: msg.warga_id,
          wargaName: msg.warga?.name || msg.warga?.username || "Warga",
          lastMessage: msg.pesan,
          lastDate: msg.created_at,
        })
      }
    })

    const list = Array.from(uniqueWargaMap.values())
    return NextResponse.json({ list, allMessages: data })
  } catch (error) {
    console.error("Error in GET admin list:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
