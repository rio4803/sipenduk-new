"use server"

import { z } from "zod"
import { supabase } from "@/app/utils/supabase"
import { logActivity } from "@/lib/activity-logger"

// read
// DONE
export async function getPerpindahanData() {
  try {
    const {data: perpindahan, error: errPerpindahan} = await supabase.from("perpindahan").select("*, penduduk:id_penduduk (nama)")
    if(errPerpindahan){
      console.log(errPerpindahan)
      return []
    }

    const perpindahanWithPenduduk = perpindahan.map(pindah => {
      const newObj = {...pindah, nama_penduduk: pindah.penduduk.nama}
      delete newObj.penduduk
      return newObj
    })

    return perpindahanWithPenduduk
  } catch (error) {
    console.error("Error fetching perpindahan data:", error)
    throw new Error("Gagal mengambil data perpindahan")
  }
}

// read by id
// DONE
export async function getPerpindahanById(id: string) {
  try {
    const {data: perpindahan, error} = await supabase.from("perpindahan").select("*, penduduk:id_penduduk (nama, nik)").eq("id", id).single()
    if(error){
      console.log(error)
      return null
    }

    const perpindahanPenduduk = {...perpindahan, ...perpindahan.penduduk}
    delete perpindahanPenduduk.penduduk
    return perpindahanPenduduk
  } catch (error) {
    console.error(`Error getting perpindahan with id ${id}:`, error)
    throw new Error("Gagal mengambil data perpindahan")
  }
}

// Schema validasi untuk perpindahan
const perpindahanSchema = z.object({
  id_penduduk: z.string().min(1, "Penduduk harus dipilih"),
  tanggal_pindah: z.string().min(1, "Tanggal pindah harus diisi"),
  alasan: z.string().min(1, "Alasan harus diisi"),
})

// create
// DONE
export async function createPerpindahan(formData: FormData, user_id: string) {
  try {
    // Validasi input
    const validatedFields = perpindahanSchema.safeParse({
      id_penduduk: formData.get("id_pdd"),
      tanggal_pindah: formData.get("tgl_pindah"),
      alasan: formData.get("alasan"),
    })

    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const newPerpindahan = {
      id_penduduk: validatedFields.data.id_penduduk,
      tanggal_pindah: validatedFields.data.tanggal_pindah,
      alasan: validatedFields.data.alasan,
    }

    const {error: errPindah} = await supabase.from("perpindahan").insert(newPerpindahan)
    if(errPindah){
      console.log(errPindah)
      return {error: "Terjadi masalah saat menambahkan data perpindahan"}
    }
    
    const {data: penduduk,error: errPenduduk} = await supabase.from("penduduk").update({status_penduduk: "Pindah"}).eq("id", validatedFields.data.id_penduduk).select("nama").single()
    if(errPenduduk){
      console.log(errPenduduk)
      return {error: "Terjadi masalah saat memperbarui data penduduk"}
    }
    
    const {error: errPengguna} = await supabase.from("pengguna").delete().eq("id_penduduk", validatedFields.data.id_penduduk)
    if(errPengguna){
      console.log(errPengguna)
      return {error: "Terjadi masalah saat memperbarui data pengguna"}
    }
    
    const {error: errAnggota} = await supabase.from("anggota_kartu_keluarga").delete().eq("id_penduduk", validatedFields.data.id_penduduk)
    if(errAnggota){
      console.log(errAnggota)
    }

    // log
    await logActivity({
      user_id,
      type: "Perpindahan",
      entity_type: "perpindahan",
      description: `Menambahkan data perpindahan untuk ${penduduk.nama}`
    })

    return { success: true, data: newPerpindahan }
  } catch (error) {
    console.error("Error creating perpindahan:", error)
    return { error: "Gagal menambahkan data perpindahan" }
  }
}

export async function updatePerpindahan(id: string, formData: FormData, user_id: string) {
  try {
    // Validasi input
    const validatedFields = perpindahanSchema.safeParse({
      id_penduduk: formData.get("id_pdd"),
      tanggal_pindah: formData.get("tgl_pindah"),
      alasan: formData.get("alasan"),
    })

    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const {data: perpindahan, error} = await supabase.from("perpindahan").update(validatedFields.data).eq("id", id).select("penduduk:id_penduduk(nama)").single()
    if(error){
      console.log(error)
      return {error: "Terjadi masalah saat memperbarui data perpindahan"}
    }

    // log
    await logActivity({
      user_id,
      type: "Perpindahan",
      entity_type: "perpindahan",
      description: `Memperbarui data perpindahan untuk ${perpindahan.penduduk?.[0]?.nama}`
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating perpindahan:", error)
    return { error: "Gagal memperbarui data perpindahan" }
  }
}

export async function deletePerpindahan(id: string, user_id: string) {
  try {
    const {data: pindah, error: errPindah} = await supabase.from("perpindahan").delete().eq("id", id).select("id_penduduk").single()
    if(errPindah){
      console.log(errPindah)
      return {error: "Terjadi masalah saat menghapus data perpindahan"}
    }
    
    const {data: penduduk, error: errPenduduk} = await supabase.from("penduduk").update({status_penduduk:  "Ada"}).eq("id", pindah.id_penduduk).select("nama").single()
    if(errPenduduk){
      console.log(errPenduduk)
      return {error: "Terjadi masalah saat memperbarui data penduduk"}
    }
    
    // log
    await logActivity({
      user_id,
      type: "Perpindahan",
      entity_type: "perpindahan",
      description: `Menghapus data perpindahan untuk ${penduduk.nama}`
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting perpindahan:", error)
    return { error: "Gagal menghapus data perpindahan" }
  }
}

