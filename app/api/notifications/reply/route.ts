import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/app/utils/supabase"

// GET: Fetch replies for a specific announcement and a specific resident
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id_pengumuman = searchParams.get("id_pengumuman")
    const warga_id = searchParams.get("warga_id")

    if (!id_pengumuman || !warga_id) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("balasan_pengumuman")
      .select("*, pengirim:pengirim_id(name, username)")
      .eq("id_pengumuman", id_pengumuman)
      .eq("warga_id", warga_id)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching replies:", error)
      return NextResponse.json({ error: "Gagal mengambil balasan" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET replies:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST: Add a new reply
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id_pengumuman, pengirim_id, warga_id, pesan, is_admin_reply } = body

    if (!id_pengumuman || !pengirim_id || !warga_id || !pesan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("balasan_pengumuman")
      .insert({
        id_pengumuman,
        pengirim_id,
        warga_id,
        pesan,
        is_admin_reply: is_admin_reply || false,
      })
      .select("*, pengirim:pengirim_id(name, username)")
      .single()

    if (error) {
      console.error("Error inserting reply:", error)
      return NextResponse.json({ error: "Gagal mengirim balasan" }, { status: 500 })
    }

    // Optional: send push notification to recipient
    try {
      if (is_admin_reply) {
        // Send push to warga
        const pushResponse = await fetch(`${request.nextUrl.origin}/api/notifications/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Balasan baru dari Admin",
            body: pesan.length > 50 ? `${pesan.substring(0, 50)}...` : pesan,
            target: warga_id,
            data: {
              url: `/dashboard/notifikasi/${id_pengumuman}`,
            },
          }),
        })
        const pushResult = await pushResponse.json()
        console.log("Push notification result to warga:", pushResult)
      } else {
        // Fetch who wrote the pengumuman
        const { data: original } = await supabase
          .from("pengumuman")
          .select("penulis")
          .eq("id", id_pengumuman)
          .single()

        if (original && original.penulis) {
          // Send push to admin
          const pushResponse = await fetch(`${request.nextUrl.origin}/api/notifications/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: "Tanggapan warga baru",
              body: pesan.length > 50 ? `${pesan.substring(0, 50)}...` : pesan,
              target: original.penulis,
              data: {
                url: `/admin/pengumuman/${id_pengumuman}/balasan`,
              },
            }),
          })
          const pushResult = await pushResponse.json()
          console.log("Push notification result to admin:", pushResult)
        }
      }
    } catch (pushErr) {
      console.error("Failed to send reply push notification:", pushErr)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in POST reply:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
