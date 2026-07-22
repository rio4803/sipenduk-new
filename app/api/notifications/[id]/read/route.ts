import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/app/utils/supabase"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get current read_by array
    const { data: pengumuman, error: fetchError } = await supabase
      .from("pengumuman")
      .select("read_by")
      .eq("id", id)
      .single()

    if (fetchError || !pengumuman) {
      return NextResponse.json({ error: "Pengumuman tidak ditemukan" }, { status: 404 })
    }

    const currentReadBy: string[] = pengumuman.read_by || []

    // Add user to read_by if not already there
    if (!currentReadBy.includes(userId)) {
      const updatedReadBy = [...currentReadBy, userId]

      const { error: updateError } = await supabase
        .from("pengumuman")
        .update({ read_by: updatedReadBy })
        .eq("id", id)

      if (updateError) {
        console.error("Error updating read status:", updateError)
        return NextResponse.json({ error: "Gagal memperbarui status baca" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}
