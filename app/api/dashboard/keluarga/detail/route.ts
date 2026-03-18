import { supabase } from "@/app/utils/supabase"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 })
    }

    const {data: pengguna, error: errPengguna} = await supabase.from("pengguna").select("*, penduduk:id_penduduk").eq("id", userId).single()
    if(errPengguna) {console.log({errPengguna}); return NextResponse.json({error: "Terjadi gangguan"})}
    
    const {data: anggotaPengguna, error: errAnggotaPengguna} = await supabase.from("anggota_kartu_keluarga").select("*, penduduk:id_penduduk(*), kartu_keluarga:id_kk(*)").eq("id_penduduk", pengguna.id_penduduk).single()
    if(errAnggotaPengguna) {console.log({errAnggotaPengguna}); return NextResponse.json({error: "Terjadi gangguan"})}
    
    const {data: anggotaData, error: errAnggotaData} = await supabase.from("anggota_kartu_keluarga").select("*, penduduk:id_penduduk(*)").eq("id_kk", anggotaPengguna.id_kk)
    if(errAnggotaPengguna) {console.log({errAnggotaData}); return NextResponse.json({error: "Terjadi gangguan"})}

    const {data: dataKelahiran, error: errKelahiran} = await supabase.from("kelahiran").select("id, penduduk:id_penduduk(nama, tanggal_lahir, jenis_kelamin)").eq("id_kk", anggotaPengguna.id_kk)
    if(errKelahiran) {console.log({errKelahiran})}

    const anggota = anggotaData?.map(({penduduk, ...rest}) => ({...penduduk, ...rest})) 
    const kelahiran = dataKelahiran?.map(({penduduk, ...rest}) => ({...penduduk, ...rest}))    
    const dataPengguna = {
      pengguna,
      penduduk: anggotaPengguna.penduduk,
      kkData: anggotaPengguna.kartu_keluarga,
      kelahiran: kelahiran,
      anggotaKeluarga: anggota,
    }
    console.log(dataPengguna);
    return NextResponse.json(dataPengguna)
  } catch (error) {
    console.error("Error fetching keluarga detail data:", error)
    return NextResponse.json({ error: "Error fetching keluarga detail data" }, { status: 500 })
  }
}

