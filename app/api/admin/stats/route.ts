import { NextResponse } from "next/server"
import { getRedisKeys, getRedisData } from "@/lib/redis-service"
import { supabase } from "@/app/utils/supabase"

export async function GET() {
  try {
    const {data, error} = await supabase.from("dashboard_view").select("*").single()
    if(error){
      return NextResponse.json({ error}, { status: 500 })
    }

    return NextResponse.json({
      totalPenduduk: data.total_penduduk,
      totalKK: data.total_kartu_keluarga,
      totalLaki: data.total_laki_laki,
      totalPerempuan: data.total_perempuan,
      totalKelahiran: data.total_kelahiran,
      totalKematian: data.total_kematian,
      totalKedatangan: data.total_kedatangan,
      totalPerpindahan: data.total_perpindahan,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Error fetching stats" }, { status: 500 })
  }
}

