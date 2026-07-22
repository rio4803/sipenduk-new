import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/app/utils/supabase"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: original, error } = await supabase
      .from("pengumuman")
      .select("*, pengguna:penulis(name)")
      .eq("id", id)
      .single()

    if (error || !original) {
      return NextResponse.json({ error: "Pengumuman tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json(original)
  } catch (error) {
    console.error("Error fetching announcement detail:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
